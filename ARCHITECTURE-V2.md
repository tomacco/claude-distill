# Architecture V2: MCP Server + Self-Improving Retrieval

## Overview

V2 transforms distill from a "write knowledge to files" system into a **smart retrieval + self-improving pipeline**. The core insight: capturing knowledge is solved. Delivering it at the right moment — and proving it worked — is the remaining gap.

```
V1: capture → store → hope it's read
V2: capture → store → serve on demand → observe → self-improve
```

## Terminology

| Term | Meaning | Examples |
|------|---------|----------|
| **Classic compute** | Deterministic execution. No reasoning. Predictable I/O. | File read/write, SQLite queries, keyword matching, regex, logging |
| **Cognitive execution** | Requires an LLM to reason, judge, or generate. | "Which files are relevant?", "Trace this to a principle" |
| **Ambient cognition** | Cognitive execution that piggybacks on the already-running Claude session (no extra cost/key). | Main Claude picking from MCP-returned candidates |
| **Dedicated cognition** | Cognitive execution requiring a separate LLM (API key, sub-agent, extra cost). | Haiku API call, spawned sub-agent during /distill |
| **Cognitive routing** | Pattern where classic compute can't decide and delegates UP to the active LLM. | MCP returns candidates → Claude picks |

### Design principle

> **Prefer ambient cognition over dedicated cognition.** If the user already has a running LLM, use IT for reasoning. Only use dedicated cognition when the ambient session can't help (e.g., the /distill sub-agent needs its own judgment). The MCP server is a pure classic-compute layer that escalates cognitive decisions to the caller.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  Claude Code Session (main context)                                 │
│                                                                     │
│  User: "Write a Kotlin service for orders"                          │
│  Claude: (sees distill_recall tool available)                       │
│       → calls distill_recall({ query: "...", action: "code" })      │
│       ← receives relevant knowledge                                 │
│       → writes code following the standards                         │
│       → calls distill_log({ used: "...", decision: "..." })         │
└───────────────┬─────────────────────────────────────────────────────┘
                │ MCP protocol (localhost)
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DISTILL MCP SERVER (local process)                                 │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │  Retrieval   │  │  Logging    │  │  Audit       │               │
│  │  Engine      │  │  Engine     │  │  Engine      │               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘               │
│         │                 │                 │                        │
│         ▼                 ▼                 ▼                        │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │  Storage Layer                                           │       │
│  │                                                          │       │
│  │  ~/.claude/distill/     → knowledge files (source)       │       │
│  │  distill.db (SQLite)    → access logs, metrics, config   │       │
│  │  embeddings.db          → vector index for semantic match │       │
│  └─────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                │
                ▼ (during /distill)
┌─────────────────────────────────────────────────────────────────────┐
│  DISTILLATION SUB-AGENT                                             │
│                                                                     │
│  Normal flow: harvest → trace → encode → verify                     │
│  NEW: audit recall performance → fix retrieval gaps                 │
└─────────────────────────────────────────────────────────────────────┘
```

## MCP Tool Definitions

### distill_recall

Primary retrieval tool. Claude calls this when it's about to do something where prior knowledge might be relevant.

```json
{
  "name": "distill_recall",
  "description": "Retrieve relevant knowledge from distilled learnings. Call BEFORE: writing code, making architecture decisions, spawning agents, reviewing PRs, or when the user references a preference. Returns relevant knowledge that should inform your actions.",
  "parameters": {
    "query": {
      "type": "string",
      "description": "What you're about to do or what knowledge you need"
    },
    "action_type": {
      "type": "string",
      "enum": ["code", "architecture", "communication", "process", "review", "general"],
      "description": "Category of action — helps narrow relevant files"
    }
  }
}
```

**Server-side logic (pure classic compute):**

```
1. Fast pass: keyword match query against SPINE entries
   - Each spine entry has trigger keywords (explicit + derived)
   - Match action_type to knowledge domains:
     code → craft/, feedback/
     architecture → craft/, ops/, projects/
     communication → profile/, feedback/
     process → ops/, feedback/
     review → craft/, feedback/, projects/
     general → all

2. Score each match (classic compute — keyword overlap, action_type match)

3. Return results with confidence:
   - High confidence (>80%): return file contents directly
   - Low confidence (<80%): return CANDIDATES with scores (cognitive routing)
     Claude (ambient cognition) picks from candidates and calls distill_get

4. Log the access:
   INSERT INTO access_log (timestamp, session_id, query, action_type, files_returned, retrieval_method, confidence)
```

**Returns (high confidence):**

```json
{
  "status": "resolved",
  "relevant_knowledge": [
    {
      "source": "craft/coding-standards.md",
      "content": "...",
      "confidence": 0.92,
      "match_reason": "action_type=code + keyword 'Kotlin' in triggers"
    }
  ],
  "recall_id": "uuid-for-logging"
}
```

**Returns (low confidence — cognitive routing):**

```json
{
  "status": "needs_routing",
  "candidates": [
    { "source": "craft/coding-standards.md", "scope": "...", "confidence": 0.55 },
    { "source": "ops/deployment-kafka.md", "scope": "...", "confidence": 0.40 },
    { "source": "projects/magneton.md", "scope": "...", "confidence": 0.35 }
  ],
  "hint": "I matched keywords but I'm not sure which are relevant. Pick the ones that apply and call distill_get for each.",
  "recall_id": "uuid-for-logging"
}
```

In the low-confidence case, the ambient Claude session (already running, already paid for) uses its own reasoning to pick from candidates. No API key needed. No extra model. The cognitive execution lives in the session.

### distill_log

Claude tells the server what it actually used and how.

```json
{
  "name": "distill_log",
  "description": "Log that you used (or chose not to use) knowledge from a prior distill_recall. Call this after making a decision informed by recalled knowledge.",
  "parameters": {
    "recall_id": {
      "type": "string",
      "description": "The recall_id from the distill_recall response"
    },
    "files_used": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Which files from the recall actually informed your action"
    },
    "files_ignored": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Which files were returned but not relevant"
    },
    "decision": {
      "type": "string",
      "description": "Brief description of what you did based on the knowledge"
    }
  }
}
```

### distill_get

Direct file read (for when Claude knows exactly what it needs).

```json
{
  "name": "distill_get",
  "description": "Read a specific knowledge file by path. Use when you know exactly which file you need.",
  "parameters": {
    "path": {
      "type": "string",
      "description": "Relative path within ~/.claude/distill/ (e.g., 'craft/coding-standards.md')"
    }
  }
}
```

### distill_status

Overview of the knowledge system state.

```json
{
  "name": "distill_status",
  "description": "Get current state of the distill knowledge system: loaded files, tier health, pressure estimate, recent activity.",
  "parameters": {}
}
```

**Returns:** spine contents, file counts per tier, last distill timestamp, estimated pressure from current session.

### distill_audit

Used by the distillation sub-agent to assess retrieval quality.

```json
{
  "name": "distill_audit",
  "description": "Get recall performance data for the current or a past session. Used during /distill to improve retrieval.",
  "parameters": {
    "session_id": {
      "type": "string",
      "description": "Session to audit. 'current' for this session, or a specific ID."
    }
  }
}
```

**Returns:**

```json
{
  "recalls": [
    { "query": "...", "files_returned": [...], "files_used": [...], "files_ignored": [...] }
  ],
  "missed_opportunities": [
    { "user_frustration": "...", "relevant_file_existed": true, "file": "...", "why_not_recalled": "no keyword match" }
  ],
  "accuracy": { "recalls_fired": 8, "useful": 6, "false_positive": 1, "missed": 1 }
}
```

## SQLite Schema

```sql
-- Access log: every recall attempt
CREATE TABLE access_log (
  id INTEGER PRIMARY KEY,
  timestamp TEXT NOT NULL,
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  action_type TEXT,
  files_returned TEXT,  -- JSON array
  retrieval_method TEXT,  -- 'keyword' | 'haiku' | 'direct'
  recall_id TEXT UNIQUE
);

-- Usage log: what was actually used
CREATE TABLE usage_log (
  id INTEGER PRIMARY KEY,
  timestamp TEXT NOT NULL,
  recall_id TEXT REFERENCES access_log(recall_id),
  files_used TEXT,  -- JSON array
  files_ignored TEXT,  -- JSON array
  decision TEXT
);

-- Retrieval fixes: improvements made by distill
CREATE TABLE retrieval_fixes (
  id INTEGER PRIMARY KEY,
  timestamp TEXT NOT NULL,
  file_path TEXT NOT NULL,
  fix_type TEXT,  -- 'keyword_added' | 'tag_updated' | 'reembedded' | 'routing_example_added'
  before_state TEXT,
  after_state TEXT,
  triggered_by TEXT  -- what frustration/miss triggered this fix
);

-- Telemetry (opt-in, see below)
CREATE TABLE telemetry_queue (
  id INTEGER PRIMARY KEY,
  timestamp TEXT NOT NULL,
  event_type TEXT,  -- 'recall_miss' | 'false_positive' | 'retrieval_fix'
  payload TEXT,  -- JSON, anonymized
  sent INTEGER DEFAULT 0
);
```

## Retrieval Improvement Loop (during /distill)

When the sub-agent runs distillation, it now has an additional step:

### Step 6: Recall audit & self-improvement

```
1. Call distill_audit({ session_id: "current" })

2. For each user frustration detected in signals:
   a. Was there a file that SHOULD have been recalled?
   b. If yes → WHY wasn't it? (check access_log)
      - No recall fired at all → monitor instruction needs strengthening
      - Recall fired but file not returned → retrieval gap (fix keywords/embeddings)
      - File returned but Claude ignored it → file content unclear or outdated
   c. Apply fix:
      - Add trigger keywords to spine entry
      - Add tags to file frontmatter
      - Add routing example for Haiku
      - Re-embed the file with better preamble
      - Rewrite unclear content

3. For each false positive (file returned but ignored):
   a. Why was it irrelevant?
   b. Remove or narrow the trigger that caused it

4. Log all fixes to retrieval_fixes table

5. Report retrieval accuracy in distillation report:
   "Recall accuracy this session: 75% (6/8 useful). Fixed 2 gaps."
```

## Embedding Strategy

### What gets embedded

Each Tier 2 file gets an embedding. The embedded text includes:
- The file's frontmatter `scope` field
- The file's content
- Synthetic questions: "What queries should retrieve this file?"
  (Generated once at embed time, updated when fixes identify new queries)

### When to re-embed

- On file creation/update (during distill)
- When a retrieval fix adds new tags/queries
- Never on read (reads are fast lookups against existing vectors)

### Model choice

- Local embeddings (e.g., `nomic-embed-text` via Ollama) for privacy
- OR API embeddings (Anthropic/OpenAI) if user opts in
- Configurable in server settings

## Dashboard (future)

Local web UI (served by the MCP server on a secondary port):

```
┌─────────────────────────────────────────────────┐
│  distill dashboard · this week                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Recall accuracy: 82% (trending ↑)             │
│                                                 │
│  Most used knowledge:                           │
│    1. coding-standards.md (14 recalls, 11 used) │
│    2. user-model.md (8 recalls, 7 used)         │
│    3. deployment-kafka.md (5 recalls, 3 used)   │
│                                                 │
│  Retrieval fixes this week: 4                   │
│    + "Kotlin" keyword → coding-standards        │
│    + "order" keyword → domain-patterns          │
│    - Removed "service" trigger from ops/deploy  │
│    ~ Reworded testing philosophy (too vague)    │
│                                                 │
│  Sessions: 12 | Distills: 5 | Knowledge files: 18│
└─────────────────────────────────────────────────┘
```

## Telemetry (opt-in, pending design)

### Purpose

Testers can opt in to send anonymized data about recall failures back to the main distill project. This helps improve the default retrieval logic for everyone.

### What gets sent (when opted in)

- Recall misses: "query X should have returned a file about Y but didn't"
- False positives: "query X returned file Y but it was irrelevant"
- Retrieval fix types: "keyword_added was needed because..."
- NO file content. NO user data. Only the structural pattern.

### How it works

```
1. User opts in: "share retrieval improvement data"
   → saved in feedback/preferences.md

2. During distill, recall misses and fixes are queued in telemetry_queue table
   → payload is anonymized (file paths generalized, content stripped)

3. Periodically (or on /distill), queued telemetry is sent:
   → POST to a collection endpoint (TBD — could be GitHub Issues, a simple API, or a repo)

4. Project maintainers review patterns:
   → "Many users have recall misses when query mentions 'refactor' but file is tagged 'code'"
   → Improve default routing logic / keyword generation / embedding preamble templates
```

### Privacy guarantees

- OFF by default. Explicit opt-in required.
- NEVER sends file content, user profile data, or conversation text
- Only sends: query pattern (generalized), action_type, miss/hit, fix type
- User can inspect queue before sending: `distill_status` shows pending telemetry
- User can purge queue at any time

### Status: PENDING

This feature requires:
- [ ] Define collection endpoint
- [ ] Design anonymization pipeline
- [ ] Build opt-in flow in installer + preferences
- [ ] Define what's useful to collect vs. what's noise
- [ ] Legal/privacy review of what's transmitted

---

## Migration from V1

V2 is additive. V1 continues working (files on disk, monitor reads spine). The MCP server adds a retrieval layer on top:

```
V1 (still works):
  Session start → monitor reads SPINE → knowledge in context

V2 (adds):
  During session → Claude calls distill_recall → targeted knowledge delivered
  During /distill → audit + self-improvement of retrieval
```

Users on V1 can upgrade gradually:
1. Install MCP server
2. Add server to Claude Code MCP config
3. Knowledge starts being served through the server
4. Access logs begin immediately
5. First /distill after upgrade audits retrieval quality

## Implementation Plan

### Phase 1: Core server (MVP)
- [ ] MCP server scaffold (Node.js or Python)
- [ ] distill_recall (keyword-based, no embeddings yet)
- [ ] distill_get (direct file read)
- [ ] distill_log (log decisions)
- [ ] SQLite schema + access logging
- [ ] Install script integration (optional server setup)

### Phase 2: Intelligence
- [ ] distill_audit tool
- [ ] Retrieval fix logic in distill-process.md
- [ ] Cognitive routing (ambient cognition — Claude picks from candidates)
- [ ] Embedding support (configurable model) for better candidate scoring
- [ ] Re-embedding on retrieval fix

### Phase 3: Observability
- [ ] distill_status tool
- [ ] Dashboard web UI
- [ ] Session-level recall accuracy reporting
- [ ] Trend tracking over time

### Phase 4: Telemetry (pending)
- [ ] Anonymization pipeline
- [ ] Collection endpoint
- [ ] Opt-in flow
- [ ] Pattern analysis tooling for maintainers

---

## Decisions Log

### Folder structure: keep as-is (2026-05-08)
Decision: Keep current subdirectory layout (craft/, ops/, profile/, projects/, feedback/, archive/).
Reasoning: Compaction prevents scale issues (Tier 2 caps at ~80 files). MCP server doesn't care about FS layout — retrieves via spine + metadata. Users like browsing folders. No problem to solve here.

### MCP registration: user scope (2026-05-08)
Decision: Register via `claude mcp add --scope user` so the server is available globally across all projects.
Reasoning: Distill knowledge is global. Per-project config would defeat the purpose. User scope lives in `~/.claude.json`.

### Fallback when server is down: degrade to V1 (2026-05-08)
Decision: If MCP tools aren't available, the monitor instruction falls back to "read SPINE.md directly." The system must never completely break because the server isn't running.

---

## Open Questions

1. **Server runtime:** Node.js (Claude Code ecosystem) or Python (ML/embedding ecosystem)?
2. **Auto-start:** Should the server auto-start on Claude Code launch? Or require manual start?
3. **Embedding model:** Local (Ollama) vs. API? Configurable or opinionated default? (Phase 2)
4. **Telemetry endpoint:** GitHub Issues? Dedicated API? Shared repo with PRs?
5. **MCP config:** How to add the server to user's Claude Code MCP config automatically during install?
6. **Dedicated cognition:** When is it justified? Only during /distill sub-agent? Or also for complex routing that ambient cognition can't handle cheaply?
