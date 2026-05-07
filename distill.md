# Retrospective Distillation

> **MANDATORY**: This command MUST execute via a spawned sub-agent. NEVER run the distillation process in the main conversation context. The main context is precious — distillation would consume it and defeat the purpose.

## What you MUST do (exactly in this order)

### Step 1: Harvest signals from THIS conversation

You are in the main context right now. You CAN see the full conversation history. The sub-agent CANNOT. Therefore you must extract everything relevant NOW, before spawning.

Scan the entire conversation above and collect:

**A) Failures & friction**
- Every failed attempt (what was tried, what went wrong, what the fix was)
- Every multi-attempt sequence (what changed between attempts)
- Every unexpected behavior encountered

**B) Corrections & teachings**
- Every time the user corrected your approach (what you did vs. what they wanted)
- Every non-obvious fact the user taught you
- Every wrong assumption you made

**C) User behavior observations**
- Communication style exhibited (terse commands? detailed specs? thinking aloud?)
- Expertise demonstrated (what they knew without being told)
- Growth edges revealed (what they asked about or struggled with)
- Emotional signals (frustration, excitement, impatience — and what preceded each)
- Decision-making style (did they reason from principles or examples? data or intuition?)

**D) Session metadata**
- What was the session about? (high-level goal)
- How long / how complex was it?
- What domain(s) did it cover?
- What was the outcome?

Write all of this down as a structured summary. Be thorough — anything you don't include here is LOST to the sub-agent.

### Step 2: Spawn the distillation agent

Use the Agent tool. The sub-agent receives the FULL distillation process plus your harvested signals.

```
Agent({
  description: "Distill session learnings",
  prompt: `You are a Distillation Agent. Your sole purpose is to consolidate session learnings into durable knowledge.

You CANNOT see the original conversation. Everything you know comes from the signal harvest below and from reading the knowledge files on disk.

## Session Signal Harvest

[INSERT THE FULL HARVEST FROM STEP 1 HERE — failures, corrections, user observations, metadata, ALL OF IT]

## Your Process

Read the full distillation process instructions from:
~/.claude/distill/distill-process.md

Execute every step:
0. Discover knowledge structure
1. Process the signals above (they are pre-harvested for you)
2. Trace each to first principles
3. Encode at the right layer (write the actual files)
4. Verify encoding quality + anti-sycophancy check
5. Run compaction if any tier is over threshold

## Critical Rules
- You MUST write files. This is not a dry run.
- You MUST follow the integrity principles in distill-process.md (never encode comfort as truth).
- You MUST validate any existing knowledge files you read (validate-on-recall).
- You MUST report back what you encoded and where.

## Output Format
Return a distillation report:
- Signals processed: N
- Learnings encoded: list with file paths
- User model updates: what changed
- Tier health: current state
- Flagged tensions: any honesty-vs-comfort conflicts
- Open questions: anything you couldn't resolve without asking the user
`
})
```

### Step 3: Load results into current context

When the sub-agent completes:

1. **Read the spine** — `Read ~/.claude/distill/SPINE.md` to bring the updated knowledge index into the current session context. This is how the current session benefits immediately from what was just distilled.

2. **Relay the report** to the user concisely. Only surface:
   - What was learned (the principles, not the raw signals)
   - Where it was saved
   - Any open questions that need user input
   - Any flagged tensions

The spine is now in your context — you can reference distilled knowledge for the remainder of this session without re-reading files.

---

## Version Checking & Updates

On the FIRST invocation of `/distill` in a session, check for updates:

1. Read `~/.claude/distill/.version` to get the installed version
2. Check if `~/.claude/distill/feedback/preferences.md` contains an auto-update preference
3. Fetch `https://raw.githubusercontent.com/tomacco/claude-distill/main/VERSION` to get the latest
4. If versions match → continue silently
5. If they differ → proceed based on user preference:

### If auto-update is OFF (default):

Inform the user:

> "claude-distill update available: vX.Y.Z → vA.B.C. Want me to update now? (You can also say 'always keep it updated' and I won't ask again.)"

- If user says **yes/update** → run the update (see below)
- If user says **no/later** → continue with current version, don't ask again this session
- If user says **"always keep it updated"** or similar → save preference, then update

### If auto-update is ON (user previously opted in):

Update silently, then briefly confirm:

> "claude-distill updated: vX.Y.Z → vA.B.C"

### Update procedure (when accepted):

```bash
curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/distill.md -o ~/.claude/commands/distill.md
curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/distill-process.md -o ~/.claude/distill/distill-process.md
curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/distill-monitor.md -o ~/.claude/distill/distill-monitor.md
echo "NEW_VERSION" > ~/.claude/distill/.version
```

After updating, inform the user what changed (fetch the commit log or just state the new version).

### Auto-update preference storage:

Save in `~/.claude/distill/feedback/preferences.md`:

```markdown
---
domain: feedback
scope: distill system preferences
last_updated: [date]
---

## Auto-update
- enabled: true
- set_on: [date user said yes]
```

Only check version once per session, not on every invocation.

---

## Memory Pressure (continuous background monitoring)

This section applies to the MAIN conversation at all times, not just during `/distill`:

Track unconsolidated signals throughout the session:

| Trigger | Points |
|---------|--------|
| Unencoded failure/correction/surprise | +1 |
| User taught something non-obvious | +1 |
| Wrong assumption discovered | +1 |
| 30+ min of dense interaction | +1 |
| User corrected a repeated mistake | +2 |
| Complex learning crossing domains | +2 |
| System compressed/truncated context | +2 |
| Same error type recurring | +3 |
| User frustration from prior gap | +3 |

**When pressure reaches 7+**, tell the user:

> "Memory pressure is high — I have N unconsolidated learnings from this session. Running `/distill` now would prevent knowledge loss and improve reliability for the rest of our work. Want me to consolidate?"

After successful distillation, pressure resets to 0.
