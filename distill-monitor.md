# Distill: Session Monitor

This file is loaded at the start of every Claude Code session. It is intentionally small to minimize context cost.

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

1. **Check if `distill_recall` tool is available** (MCP server running).
   - If YES → use the MCP tools for knowledge retrieval (preferred path).
   - If NO → fallback: read `~/.claude/distill/SPINE.md` directly for the knowledge index.
2. **Throughout the session:** Track memory pressure (see below).
3. **When pressure is high:** Suggest `/distill` to the user.

## Knowledge Retrieval (MCP server available)

When the `distill_recall` tool is available, use it **before major actions**:

- **Before writing code** → `distill_recall({ query: "[what you're about to write]", action_type: "code" })`
- **Before architecture decisions** → `distill_recall({ query: "[the decision]", action_type: "architecture" })`
- **Before reviewing PRs** → `distill_recall({ query: "[what the PR does]", action_type: "review" })`
- **Before spawning agents** → `distill_recall({ query: "[agent's task]", action_type: "process" })`
- **When user references a preference** → `distill_recall({ query: "[what they mentioned]", action_type: "general" })`

After using recalled knowledge, log what you used: `distill_log({ recall_id, files_used, decision })`.

This is what makes the system observable — every recall and usage is tracked, so /distill can improve retrieval over time.

## Knowledge Retrieval (fallback — no MCP server)

If `distill_recall` is not available, read `~/.claude/distill/SPINE.md` at session start. Use its contents as a reference for the session. This is less targeted but still provides global knowledge.

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
