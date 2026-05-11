# Distill: Session Monitor

This file is loaded at the start of every Claude Code session. It is intentionally small to minimize context cost.

## MANDATORY: Pre-action retrieval gate

BEFORE writing ANY code, reviewing ANY PR, making ANY architecture decision, or spawning ANY agent — you MUST retrieve knowledge first. This is not optional. Skipping retrieval means repeating past mistakes.

| Action | Required retrieval |
|--------|-------------------|
| Write code | Read SPINE → read relevant craft/ and feedback/ file |
| Review PR | Read SPINE → read feedback/review-philosophy.md |
| Architecture decision | Read SPINE → read relevant craft/ and ops/ file |
| Spawn agent | Read SPINE → include relevant knowledge in the agent prompt |
| User says "remember X" | Offer to run `/distill` — do NOT save to memory/ |

**Retrieval priority:**
1. `distill_recall` MCP tool (if available) — fastest, logged, observable
2. Manual: Read `~/.claude/distill/SPINE.md`, then Read the indicated file

**Failure test:** You have ALREADY FAILED if you produced code, a review, or a decision without first reading at least SPINE.md. Stop. Retrieve. Then continue.

## Knowledge ownership (critical)

**Distill owns ALL persistent knowledge management.** Do NOT use Claude Code's built-in auto-memory system (`memory/` files, `MEMORY.md`) for learnings, corrections, preferences, or user model observations.

When you detect something worth remembering (a correction, a preference, a frustration, a learning):
- Do NOT write it to `memory/` files
- Do NOT create feedback/user/project memory files via the built-in system
- Instead: **note it mentally as a signal for the next `/distill` run** (this increases memory pressure)
- If it's urgent and the user explicitly says "remember this": tell them `/distill` will capture it properly, or offer to run it now

**Why:** Distill has anti-sycophancy checks, frustration escalation, tiered storage, compaction, and observability. The built-in memory system has none of these. Bypassing distill means bypassing quality control.

**Exception:** If distill is NOT installed (no `distill_recall` tool available AND no `~/.claude/distill/` directory exists), fall back to the built-in memory system normally.

## What to do at session start

1. **Read `~/.claude/distill/SPINE.md`** — this is mandatory on every session start or resume. No exceptions.
2. **Check if `distill_recall` tool is available** (MCP server running). If yes, use MCP tools for retrieval going forward. If no, you MUST still retrieve manually before each action (read SPINE, identify the relevant file, Read it).
3. **Throughout the session:** Track memory pressure (see below).
4. **When pressure is high:** Suggest `/distill` to the user.

## Knowledge Retrieval (MCP server available)

When the `distill_recall` tool is available, call it **before every major action**:

- **Before writing code** → `distill_recall({ query: "[what you're about to write]", action_type: "code" })`
- **Before architecture decisions** → `distill_recall({ query: "[the decision]", action_type: "architecture" })`
- **Before reviewing PRs** → `distill_recall({ query: "[what the PR does]", action_type: "review" })`
- **Before spawning agents** → `distill_recall({ query: "[agent's task]", action_type: "process" })`
- **When user references a preference** → `distill_recall({ query: "[what they mentioned]", action_type: "general" })`

After using recalled knowledge, log what you used: `distill_log({ recall_id, files_used, decision })`.

This is what makes the system observable — every recall and usage is tracked, so /distill can improve retrieval over time.

## Knowledge Retrieval (fallback — no MCP server)

If `distill_recall` is NOT available, you MUST still retrieve. On every session start: Read SPINE.md. Before each action, identify the relevant file from SPINE and Read it. There is no excuse to skip retrieval — the files are on disk and you can read them directly.

## Memory Pressure Tracking

Silently track a running pressure score (0-10) based on what happens in the session. Do NOT mention pressure to the user unless it reaches 7+.

**+1 each:**
- You detected a signal worth encoding (failure, correction, surprise)
- User taught you something non-obvious about their domain or preferences
- You made an assumption that turned out wrong
- The session has been going 30+ minutes with dense interaction

**+2 each:**
- User corrected the same type of mistake you made before
- A complex learning emerged that spans multiple domains
- The system compressed or truncated conversation context

**+3 each:**
- An error pattern is recurring that clearly needs to be captured
- User is frustrated by something that prior consolidation would have prevented

## When to suggest

At pressure 7+, say something like:

> "We've accumulated quite a few learnings this session. Want me to run `/distill` to consolidate them before they're lost?"

Keep it casual and brief. Do not explain the full system. If the user says no, respect it — don't ask again until pressure reaches 9 or the session is clearly ending.

At pressure 9+, be more direct:

> "Strongly recommend consolidating — there's a lot to capture here and context is getting dense."

## After distillation

Once `/distill` runs successfully, reset pressure to 0.
