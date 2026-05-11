# Distill: Session Monitor

This file is loaded at the start of every Claude Code session. It is intentionally small to minimize context cost.

## MANDATORY: Knowledge retrieval

**At session start:** Read `~/.claude/distill/SPINE.md`. Once. Non-negotiable. This gives you the map of what knowledge exists.

**During the session:** If `distill_recall` MCP tool is available, call it before major actions — it's fast, silent, and logged. You don't need to announce it or ask permission. Just call it.

**If MCP is NOT available:** Use the SPINE you already read to identify relevant files and Read them before the FIRST major action in a new domain (first time writing code, first PR review, etc). Not before every single function.

**When user says "remember X":** Offer `/distill` — do NOT save to memory/.

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

1. **Read `~/.claude/distill/SPINE.md`** — mandatory. This is your knowledge map for the session.
2. **Check if `~/.claude/distill/.needs-migration` exists.** If yes, tell the user:
   > "You have existing memory files from before distill was installed. Run `/distill` now to ingest them into the tiered knowledge system. Your old files will stay untouched as backup."
   After they run distill (which will process the migration), delete the flag file.
3. **Check if `distill_recall` tool is available.** If yes, you're set — call it silently before actions. If no, use SPINE to manually read relevant files when needed.
4. **Throughout the session:** Track memory pressure (see below).
5. **When pressure is high:** Suggest `/distill` to the user.

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

If `distill_recall` is NOT available, you already have SPINE loaded from session start. Before the first action in a new domain (first code task, first review, first architecture call), read the relevant file from SPINE. You don't need to re-read for every subsequent action in the same domain — once loaded, the knowledge is in your context.

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

At pressure 5+, say something like:

> "We've accumulated some learnings this session. Want me to run `/distill` to consolidate them?"

Keep it casual and brief. Do not explain the full system. If the user says no, respect it — don't ask again until pressure reaches 7 or the session is clearly ending.

At pressure 7+, be more direct:

> "Strongly recommend consolidating — there's a lot to capture here and context is getting dense."

## After distillation

Once `/distill` runs successfully, reset pressure to 0.
