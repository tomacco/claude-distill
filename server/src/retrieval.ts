import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { DISTILL_DIR } from "./db.js";

interface SpineEntry {
  title: string;
  path: string;
  hook: string;
  keywords: string[];
}

interface RecallCandidate {
  source: string;
  scope: string;
  confidence: number;
  match_reason: string;
}

interface RecallResult {
  status: "resolved" | "needs_routing";
  relevant_knowledge?: Array<{
    source: string;
    content: string;
    confidence: number;
    match_reason: string;
  }>;
  candidates?: RecallCandidate[];
  hint?: string;
  recall_id: string;
}

const ACTION_DOMAINS: Record<string, string[]> = {
  code: ["craft", "feedback"],
  architecture: ["craft", "ops", "projects"],
  communication: ["profile", "feedback"],
  process: ["ops", "feedback"],
  review: ["craft", "feedback", "projects"],
  general: ["craft", "ops", "profile", "projects", "feedback"],
};

function parseSpine(): SpineEntry[] {
  const spinePath = join(DISTILL_DIR, "SPINE.md");
  if (!existsSync(spinePath)) return [];

  const content = readFileSync(spinePath, "utf-8");
  const entries: SpineEntry[] = [];

  for (const line of content.split("\n")) {
    // Format: - [Title](path.md) — hook text
    const match = line.match(/^- \[(.+?)\]\((.+?)\)\s*[—–-]\s*(.+)$/);
    if (match) {
      const [, title, path, hook] = match;
      // Derive keywords from title + hook
      const keywords = `${title} ${hook}`
        .toLowerCase()
        .split(/[\s,;:—–\-/()]+/)
        .filter((w) => w.length > 2);

      entries.push({ title, path, hook, keywords });
    }
  }

  return entries;
}

function scoreMatch(
  entry: SpineEntry,
  queryTerms: string[],
  actionDomains: string[]
): number {
  let score = 0;

  // Domain match (does this entry's path match the action type?)
  const entryDomain = entry.path.split("/")[0];
  if (actionDomains.includes(entryDomain)) {
    score += 0.3;
  }

  // Keyword overlap
  const matchedKeywords = queryTerms.filter((term) =>
    entry.keywords.some(
      (kw) => kw.includes(term) || term.includes(kw)
    )
  );
  const keywordScore = matchedKeywords.length / Math.max(queryTerms.length, 1);
  score += keywordScore * 0.7;

  return Math.min(score, 1.0);
}

export function recall(
  query: string,
  actionType: string = "general"
): RecallResult {
  const recallId = crypto.randomUUID();
  const spine = parseSpine();

  if (spine.length === 0) {
    return {
      status: "resolved",
      relevant_knowledge: [],
      recall_id: recallId,
    };
  }

  const queryTerms = query
    .toLowerCase()
    .split(/[\s,;:—–\-/()]+/)
    .filter((w) => w.length > 2);

  const actionDomains = ACTION_DOMAINS[actionType] || ACTION_DOMAINS.general;

  // Score all entries
  const scored = spine
    .map((entry) => ({
      entry,
      score: scoreMatch(entry, queryTerms, actionDomains),
    }))
    .filter(({ score }) => score > 0.2)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      status: "needs_routing",
      candidates: spine
        .filter((e) => actionDomains.includes(e.path.split("/")[0]))
        .map((e) => ({
          source: e.path,
          scope: e.hook,
          confidence: 0.1,
          match_reason: "domain match only, no keyword overlap",
        })),
      hint: "No strong keyword matches found. These files are in the right domain — pick any that seem relevant and call distill_get.",
      recall_id: recallId,
    };
  }

  // High confidence: top results are strong
  const highConfidence = scored.filter(({ score }) => score >= 0.6);

  if (highConfidence.length > 0) {
    const results = highConfidence.slice(0, 3).map(({ entry, score }) => {
      const filePath = join(DISTILL_DIR, entry.path);
      const content = existsSync(filePath)
        ? readFileSync(filePath, "utf-8")
        : `[file not found: ${entry.path}]`;

      return {
        source: entry.path,
        content,
        confidence: Math.round(score * 100) / 100,
        match_reason: `keyword match + domain for action_type=${actionType}`,
      };
    });

    return {
      status: "resolved",
      relevant_knowledge: results,
      recall_id: recallId,
    };
  }

  // Low confidence: return candidates for cognitive routing
  return {
    status: "needs_routing",
    candidates: scored.slice(0, 5).map(({ entry, score }) => ({
      source: entry.path,
      scope: entry.hook,
      confidence: Math.round(score * 100) / 100,
      match_reason: `partial keyword match (${Math.round(score * 100)}%)`,
    })),
    hint: "Partial matches found but confidence is low. Pick the ones relevant to your task and call distill_get for each.",
    recall_id: recallId,
  };
}

export function getFile(relativePath: string): string | null {
  const filePath = join(DISTILL_DIR, relativePath);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, "utf-8");
}
