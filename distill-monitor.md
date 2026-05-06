# Distill: Session Monitor

This file is loaded at the start of every Claude Code session. It is intentionally small (~40 lines) to minimize context cost.

## What to do

1. **At session start:** Read `~/.claude/distill/SPINE.md` to load your knowledge index.
2. **Throughout the session:** Track memory pressure (see below).
3. **When pressure is high:** Suggest `/distill` to the user.

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
