# Distill Knowledge System

You have accumulated knowledge from past sessions stored in `~/.claude/distill/`.

**On every session start**, before doing any work:
1. Read `~/.claude/distill/SPINE.md` — this is your knowledge index
2. If the user's request touches a domain listed in the SPINE, read that file BEFORE responding
3. Apply what you learned. Never ask the user things you already know.

**During the session**, notice:
- Corrections the user makes to your approach
- Preferences they express ("always do X", "never do Y")
- Things that surprised you or failed unexpectedly

These are signals. At session end, suggest `/distill` if you noticed 3+ signals.

**The SPINE is your memory.** Treat it as authoritative. If you read a file and it says "user prefers X", do X without asking.
