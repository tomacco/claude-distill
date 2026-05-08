import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import db, { DISTILL_DIR } from "./db.js";
import { recall, getFile } from "./retrieval.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const server = new Server(
  { name: "distill", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// Track current session
let currentSessionId: string | null = null;

function ensureSession(): string {
  if (!currentSessionId) {
    currentSessionId = crypto.randomUUID();
    db.prepare(
      "INSERT INTO sessions (id) VALUES (?)"
    ).run(currentSessionId);
  }
  return currentSessionId;
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "distill_recall",
      description:
        "Retrieve relevant knowledge from distilled learnings. Call BEFORE: writing code, making architecture decisions, spawning agents, reviewing PRs, or when the user references a preference. Returns relevant knowledge or candidates for you to pick from.",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: {
            type: "string",
            description: "What you're about to do or what knowledge you need",
          },
          action_type: {
            type: "string",
            enum: [
              "code",
              "architecture",
              "communication",
              "process",
              "review",
              "general",
            ],
            description:
              "Category of action — helps narrow relevant files",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "distill_get",
      description:
        "Read a specific knowledge file by path. Use when you know exactly which file you need, or after distill_recall returns candidates you want to read.",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: {
            type: "string",
            description:
              "Relative path within ~/.claude/distill/ (e.g., 'craft/coding-standards.md')",
          },
        },
        required: ["path"],
      },
    },
    {
      name: "distill_log",
      description:
        "Log that you used (or ignored) knowledge from a prior recall. Call after making a decision informed by recalled knowledge. This powers the observability dashboard.",
      inputSchema: {
        type: "object" as const,
        properties: {
          recall_id: {
            type: "string",
            description: "The recall_id from the distill_recall response",
          },
          files_used: {
            type: "array",
            items: { type: "string" },
            description: "Which files actually informed your action",
          },
          files_ignored: {
            type: "array",
            items: { type: "string" },
            description: "Which files were returned but not relevant",
          },
          decision: {
            type: "string",
            description: "Brief description of what you did based on the knowledge",
          },
        },
        required: ["recall_id", "decision"],
      },
    },
    {
      name: "distill_status",
      description:
        "Get current state of the distill knowledge system: session stats, file counts, recent recalls. Useful for the user to see how their knowledge is being used.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "distill_audit",
      description:
        "Get recall performance data for the current session. Used during /distill to assess retrieval quality and identify gaps.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: {
            type: "string",
            description:
              "Session to audit. 'current' for this session, or a specific ID.",
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "distill_recall": {
      const sessionId = ensureSession();
      const query = (args as { query: string; action_type?: string }).query;
      const actionType = (args as { action_type?: string }).action_type || "general";

      const result = recall(query, actionType);

      // Log access
      const filesReturned =
        result.status === "resolved"
          ? result.relevant_knowledge?.map((r) => r.source) || []
          : result.candidates?.map((c) => c.source) || [];

      const confidence =
        result.status === "resolved"
          ? result.relevant_knowledge?.[0]?.confidence || 0
          : result.candidates?.[0]?.confidence || 0;

      db.prepare(
        `INSERT INTO access_log (session_id, query, action_type, files_returned, confidence, retrieval_method, recall_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        sessionId,
        query,
        actionType,
        JSON.stringify(filesReturned),
        confidence,
        result.status === "resolved" ? "keyword" : "cognitive_routing",
        result.recall_id
      );

      // Update session stats
      db.prepare(
        "UPDATE sessions SET recalls_fired = recalls_fired + 1 WHERE id = ?"
      ).run(sessionId);

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    case "distill_get": {
      const path = (args as { path: string }).path;
      const content = getFile(path);

      if (!content) {
        return {
          content: [{ type: "text", text: `File not found: ${path}` }],
          isError: true,
        };
      }

      return { content: [{ type: "text", text: content }] };
    }

    case "distill_log": {
      const { recall_id, files_used, files_ignored, decision } = args as {
        recall_id: string;
        files_used?: string[];
        files_ignored?: string[];
        decision: string;
      };

      db.prepare(
        `INSERT INTO usage_log (recall_id, files_used, files_ignored, decision)
         VALUES (?, ?, ?, ?)`
      ).run(
        recall_id,
        JSON.stringify(files_used || []),
        JSON.stringify(files_ignored || []),
        decision
      );

      // Update session stats if files were used
      if (files_used && files_used.length > 0) {
        const sessionId = ensureSession();
        db.prepare(
          "UPDATE sessions SET recalls_useful = recalls_useful + 1 WHERE id = ?"
        ).run(sessionId);
      }

      return { content: [{ type: "text", text: "Logged." }] };
    }

    case "distill_status": {
      const sessionId = ensureSession();

      const session = db
        .prepare("SELECT * FROM sessions WHERE id = ?")
        .get(sessionId) as Record<string, unknown> | undefined;

      const totalFiles = db
        .prepare(
          "SELECT COUNT(DISTINCT json_each.value) as count FROM access_log, json_each(access_log.files_returned)"
        )
        .get() as { count: number };

      const recentRecalls = db
        .prepare(
          "SELECT query, action_type, files_returned, confidence FROM access_log WHERE session_id = ? ORDER BY timestamp DESC LIMIT 10"
        )
        .all(sessionId);

      // Read spine for overview
      const spinePath = join(DISTILL_DIR, "SPINE.md");
      const spine = existsSync(spinePath)
        ? readFileSync(spinePath, "utf-8")
        : "No spine found.";

      const spineLines = spine.split("\n").filter((l) => l.trim()).length;

      // Version
      const versionPath = join(DISTILL_DIR, ".version");
      const version = existsSync(versionPath)
        ? readFileSync(versionPath, "utf-8").trim()
        : "unknown";

      const status = {
        version,
        session: {
          id: sessionId,
          recalls_fired: (session as Record<string, unknown>)?.recalls_fired || 0,
          recalls_useful: (session as Record<string, unknown>)?.recalls_useful || 0,
          started_at: (session as Record<string, unknown>)?.started_at,
        },
        knowledge: {
          spine_lines: spineLines,
          spine_max: 80,
          total_files_accessed_ever: totalFiles?.count || 0,
        },
        recent_recalls: recentRecalls,
        spine_content: spine,
      };

      return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }] };
    }

    case "distill_audit": {
      const targetSession =
        (args as { session_id?: string }).session_id === "current" || !(args as { session_id?: string }).session_id
          ? ensureSession()
          : (args as { session_id?: string }).session_id;

      interface RecallRow {
        recall_id: string;
        query: string;
        action_type: string;
        files_returned: string;
        confidence: number;
        files_used: string | null;
        files_ignored: string | null;
        decision: string | null;
      }

      const recalls = db
        .prepare(
          `SELECT a.recall_id, a.query, a.action_type, a.files_returned, a.confidence,
                  u.files_used, u.files_ignored, u.decision
           FROM access_log a
           LEFT JOIN usage_log u ON a.recall_id = u.recall_id
           WHERE a.session_id = ?
           ORDER BY a.timestamp`
        )
        .all(targetSession) as RecallRow[];

      const totalRecalls = recalls.length;
      const withUsage = recalls.filter((r) => r.files_used);
      const useful = withUsage.filter((r) => {
        const used = JSON.parse(r.files_used || "[]");
        return used.length > 0;
      });

      const audit = {
        session_id: targetSession,
        total_recalls: totalRecalls,
        recalls_with_feedback: withUsage.length,
        useful_recalls: useful.length,
        accuracy:
          withUsage.length > 0
            ? Math.round((useful.length / withUsage.length) * 100)
            : null,
        details: recalls.map((r) => ({
          query: r.query,
          action_type: r.action_type,
          files_returned: JSON.parse(r.files_returned || "[]"),
          files_used: JSON.parse(r.files_used || "[]"),
          files_ignored: JSON.parse(r.files_ignored || "[]"),
          decision: r.decision,
          confidence: r.confidence,
        })),
      };

      return { content: [{ type: "text", text: JSON.stringify(audit, null, 2) }] };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
