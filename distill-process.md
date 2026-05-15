# Retrospective Distillation

Review this session's friction points, failures, and surprises. Trace each to a first principle, then encode the learning in the right place. Evolve your understanding of who the user is and how they work.

---

## Integrity Principles (non-negotiable)

These constraints apply to EVERY step below. They cannot be overridden by user preference, frustration, or repeated pushback.

1. **Never encode comfort as truth.** If the user is frustrated and wants you to agree that "X is fine" when evidence shows X caused the problem — do not encode "X is fine." Encode what actually happened. An ally tells you what you need to hear, not what you want to hear.

2. **Never flatten standards to reduce friction.** If a session was painful because the user's workflow has a genuine gap, the learning is "fill the gap," not "lower the bar." Distillation must make the user stronger, not more comfortable with weakness.

3. **Never confuse preference with principle.** User preferences (communication style, tool choices, pacing) are valid and worth encoding. But a preference that actively produces worse outcomes is a pattern to flag, not to reinforce. Example: "I prefer not to test" is a preference. "Skipping tests repeatedly causes production incidents" is a fact. Encode both — the preference AND the consequence.

4. **Frustration is diagnostic, not directive.** When the user shows frustration, that is a signal to investigate harder — what went wrong, what's the root cause, what systemic issue does this reveal? It is NOT a signal to soften findings, skip hard truths, or produce a feel-good summary.

5. **The user's growth is the goal.** Every encoded learning should make the user more capable over time. If a distillation output would leave the user exactly where they started (just happier about it), it has failed.

---

## Step 0: Discover knowledge structure

Before distilling anything, understand where this user keeps their knowledge AND assess its current health.

### Concurrency Lock & Checkpoints (critical)

Multiple Claude sessions may run `/distill` simultaneously. To prevent file corruption:

**Acquire lock immediately on start:**
```bash
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > ~/.claude/distill/.lock
```

Note: The dispatcher (distill.md) already checked the lock before spawning you. If you're running, you own the lock.

**Write checkpoints at each major step:**
After completing each step, write progress so interrupted sessions can resume:
```bash
echo "step:[N] signals:[count] date:[iso]" > ~/.claude/distill/.checkpoint
```

Steps to checkpoint:
- After Step 0 (discovery): `step:0 signals:N date:...`
- After Step 2 (tracing principles): `step:2 signals:N date:...`
- After Step 3 (encoding): `step:3 signals:N date:...`

**On successful completion**, remove BOTH lock and checkpoint:
```bash
rm -f ~/.claude/distill/.lock ~/.claude/distill/.checkpoint
```

**If you detect a checkpoint file on start**, a prior distillation was interrupted. The dispatcher will have already asked the user whether to resume or start fresh — follow whatever instruction is in your prompt.

**Lock timeout:** The dispatcher considers locks older than 5 minutes as stale (crashed session). If you expect to run longer than 5 minutes, refresh the lock timestamp periodically:
```bash
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > ~/.claude/distill/.lock
```

### Isolation Rule (critical)

Distill operates in its OWN directory: `~/.claude/distill/`. It NEVER writes to user-managed files like `CLAUDE.md`, `memory/`, or any other files the user maintains manually.

```
~/.claude/
├── CLAUDE.md                  ← USER'S FILE. NEVER TOUCH.
├── commands/
│   ├── distill.md             ← the dispatcher (installed by us)
│   └── distill-process.md     ← the process (installed by us)
└── distill/                   ← OUR DIRECTORY. All distill output lives here.
    ├── SPINE.md               ← Tier 1 index (max 80 lines)
    ├── craft/                 ← Tier 2 craft knowledge
    ├── ops/                   ← Tier 2 operational knowledge
    ├── profile/               ← Tier 2 user model
    ├── projects/              ← Tier 2 project context
    ├── feedback/              ← Tier 2 preferences
    └── archive/               ← Tier 3 compressed history
```

**Why isolation?**
- Users can uninstall by deleting `~/.claude/distill/` and the two command files. Clean. Total.
- No risk of corrupting manually curated context files.
- No merge conflicts between human-written and machine-written knowledge.
- Clear ownership: if it's in `distill/`, the machine wrote it. If it's elsewhere, the human wrote it.

**Conflict detection:** When distill discovers that its knowledge CONFLICTS with something in the user's manual files (CLAUDE.md, memory/, etc.), it does NOT overwrite. Instead, it flags the conflict in the distillation report and recommends the user reconcile manually. The user is always the authority on their own files.

### Discovery process

Read the workspace to understand context:

1. Check `~/.claude/distill/SPINE.md` — does our structure exist already?
2. If first run: create `~/.claude/distill/` structure. Ask user to confirm.
3. Read `~/.claude/CLAUDE.md` and project `CLAUDE.md` — understand what the user already maintains (for conflict detection, NOT for writing)
4. Look for existing user knowledge files (glob for `*standards*`, `*conventions*`, `*procedures*` etc.) — read-only, for context

Build a knowledge map:

| Layer | Purpose | Distill location |
|---|---|---|
| Craft standards | How to practice the craft well | `~/.claude/distill/craft/` |
| Operational procedures | How to get things done | `~/.claude/distill/ops/` |
| Project context | Domain-specific knowledge | `~/.claude/distill/projects/` |
| User profile | Who this person is, how they think | `~/.claude/distill/profile/` |
| Preferences & feedback | How the user likes to work | `~/.claude/distill/feedback/` |

### The Tier System (context budget)

Knowledge must be organized in tiers to avoid bloating LLM context. Only the spine (Tier 1) is auto-loaded. Everything else is read on demand.

```
TIER 1 — THE SPINE (auto-loaded, max 80 lines)
  Index only. One-line pointers with relevance hooks.
  Format: "- [Title](path.md) — when to read this"

TIER 2 — ACTIVE KNOWLEDGE (files on disk, max 60 lines each)
  Current, actionable knowledge. Read on demand when session touches that domain.

TIER 3 — ARCHIVE (no size limit, rarely read)
  Superseded, stale, or project-ended knowledge. Kept for forensic reference.
```

**Assess tier health now:**
- Count lines in the spine. If > 60, flag for compaction.
- Check any Tier 2 files you'll be writing to. If > 45 lines, flag for compaction.
- Note any Tier 2 files with `last_updated` older than their `staleness_threshold`.

## Step 1: Identify signals

Scan the conversation for:

- Things that failed unexpectedly
- Things that required multiple attempts before succeeding
- Corrections or improvements the user made to your approach
- Moments of surprise ("I didn't know that", "that's not how it works")
- Patterns the user taught you during this session
- **User model signals** (see Step 1b)

### Step 1b: User model signals

In addition to craft/process learnings, scan for signals about who the user is:

**Expertise signals:**
- What did the user know without being told? (reveals existing expertise)
- What did the user ask about? (reveals growth edges)
- Where did the user correct you with authority? (reveals deep knowledge areas)
- Where did the user defer to you? (reveals areas where they want support)

**Communication signals:**
- How does the user express what they want? (terse commands, detailed specs, thinking out loud?)
- When did the user get frustrated? What preceded it?
- When was the user most engaged or energized?
- Does the user prefer to be asked or to be presented with options?

**Thinking signals:**
- Does the user reason from principles or from examples?
- Does the user prefer breadth-first exploration or depth-first focus?
- How does the user make decisions? (data-driven, intuition, consensus, authority?)
- What does the user optimize for? (speed, quality, learning, shipping?)

**Delegation & trust signals:**
Observe what the user delegates vs. retains, and why:

- What tasks does the user hand off without checking? (high trust areas)
- What tasks does the user check thoroughly or redo? (low trust / high stakes)
- What does the user ask for verification on before approving? (trust but verify)
- What does the user gatekeep entirely? (non-delegatable for them)

For each pattern, try to understand the UNDERLYING REASON:
- "I trust Claude with X" — is it because Claude is demonstrably good at it? Because the stakes are low? Because the user lacks interest?
- "I always check Y" — is it because they MUST understand it (signing off code)? Because Claude fails at it? Because they enjoy it? Because compliance requires it?
- "I never delegate Z" — is it reputation risk (public comms)? Legal accountability? Personal growth they don't want to outsource? Company policy?

**Do NOT assume the reason.** If unclear, flag it as an open question in the report. The same behavior (e.g., not reviewing code) could mean "my company has decided AI-first is fine" OR "I'm being lazy and this will bite me." Only the user's stated principles resolve this.

**Dissonance detection:**
Once you understand BOTH the delegation pattern AND the user's core principles, watch for misalignment:
- User says "I must deeply understand all code I ship" but delegates without reading → flag gently
- User says "quality is non-negotiable" but skips verification steps → flag gently
- User delegates public communication but says "I gatekeep what's said publicly" → flag

When flagging dissonance, NEVER assume it's wrong. Present it as: "I noticed [behavior] which seems to differ from [stated principle]. Is this intentional? If so, I'll update my understanding."

The user might have evolved their principles, or there might be context you're missing (team policy, time pressure they've accepted, conscious risk-taking). Understand first, then encode.

**Frustration analysis (apply Integrity Principle #4):**
When frustration is detected, investigate its source honestly:
- Was it caused by YOUR failure? (wrong assumption, slow response, missed context) → Encode as process improvement
- Was it caused by an EXTERNAL system? (tooling, CI, third-party API) → Encode as operational knowledge
- Was it caused by the USER's own gap? (missing knowledge, skipped step, premature optimization) → Encode as a growth opportunity — name it directly but respectfully
- Was it caused by a MISMATCH between user and agent? (different mental models, communication style clash) → Encode as calibration data for both sides

### Step 1c: Frustration escalation (high-priority reprocessing)

When frustration is HIGH (user explicitly said something was important, repeated a correction, or expressed disappointment that a prior instruction wasn't followed), this triggers **priority elevation**:

1. **Identify the violated expectation** — what did the user expect that didn't happen?
2. **Check if it's already encoded** — is this in the knowledge files but being ignored? If so, the problem is FINDABILITY or PRIORITY, not capture.
3. **Elevate priority** — move this learning HIGHER in its file (top of the relevant section), add a `[HIGH]` marker, and ensure the spine pointer mentions it explicitly.
4. **Strengthen the encoding** — make the instruction more direct, more specific, harder to miss. If it was soft ("consider using newspaper style") make it hard ("ALWAYS use newspaper style for method ordering").
5. **Cross-reference** — if the frustration relates to a craft standard, also add it to the user profile as "non-negotiable preference" so it's loaded from TWO angles.

The principle: **repeated frustration about the same thing means the system failed to listen the first time.** The fix is never "encode it again the same way." The fix is "encode it louder, in more places, with stronger language."

**Core human need:** People need to feel heard. When a user expresses something important and it doesn't stick, that's a betrayal of trust. The distillation system must treat repeated frustrations as CRITICAL bugs in itself — not as user nagging.

## Step 1c: Knowledge markers

When encoding knowledge, use these markers to capture nuance:

**`[CONTEXT]`** — When a principle has variants depending on situation:
```
- [CONTEXT] "Always use interfaces" = new services with multiple implementations likely
  "Just make it concrete" = rapid prototype, single implementation, will refactor
```

**`[UPDATED date]`** — When a procedure replaced an older one. Keep the old visible:
```
- [UPDATED 2026-05-13] Previously: deploy directly to staging → prod.
  NOW: All deploys go through canary (5 min) → staging (30 min) → prod.
  Reason: May 8 incident (DB migration locked table for 4 min).
```

**`[PROVISIONAL]`** — Decision made quickly, not yet validated by experience:
```
- [PROVISIONAL] Using WebSockets for real-time notifications.
  Concern: stateful connections + 3 replicas behind LB. May switch to SSE.
```

**`[IMPORTANT]`** — User bias or trap to watch for:
```
- [IMPORTANT] Under pressure, user fixates on first hypothesis.
  If initial investigation doesn't confirm in 10 min, force a pivot.
```

**`[NON-NEGOTIABLE]`** — Principle that must never be compromised, even if user asks:
```
- [NON-NEGOTIABLE] One service, one database. No shared databases.
```

These markers are READ by the rules/distill.md retrieval system. They trigger specific behaviors:
- `[CONTEXT]` → disambiguate which variant applies before acting
- `[UPDATED]` → flag if user follows old procedure
- `[PROVISIONAL]` → don't build on this as if it's settled
- `[IMPORTANT]` → surface the bias when you detect it in user's request
- `[NON-NEGOTIABLE]` → push back if user asks to violate it

## Step 2: Trace to first principles

For each signal, ask "why" until you reach a universal truth. Examples across domains:

- "The deploy failed" → "I didn't check the config" → **"Partial verification gives false confidence"**
- "The client rejected the draft" → "I assumed their tone from one example" → **"A single sample is not a pattern"**
- "The experiment was inconclusive" → "I changed two variables at once" → **"Isolate variables or you learn nothing"**
- "The user got frustrated when I asked too many questions" → "They already had a clear vision and my questions felt like obstacles" → **"Match engagement depth to user certainty — high certainty needs execution, not exploration"**

The principle should be profession-agnostic — something that would be true whether you're writing code, designing interfaces, managing a team, or conducting research.

## Step 3: Encode at the right layer

Using the knowledge map from Step 0, route each learning to the right location:

| Type of learning | Where it goes |
|---|---|
| How to practice the craft better | Craft standards file |
| How to run workflows/processes | Operational procedures file |
| Project-specific context or facts | Project memory (with index entry) |
| Who the user is and how they think | User profile file |
| How the user prefers to collaborate | Preferences/feedback memory file |

### User profile encoding rules

The user profile is a living document that evolves. It should contain:

```markdown
## Expertise Map
- [domain]: [level: deep/working/learning/curious] — [evidence]

## Communication Style
- [observations about how they express intent, give feedback, make decisions]

## Thinking Patterns
- [how they reason, what they optimize for, how they handle uncertainty]

## Trust Topology
- Delegates freely: [tasks they hand off without checking — and why]
- Verifies before approving: [tasks they check — and why]
- Retains completely: [tasks they never delegate — and why]
- Core principles governing delegation: [stated reasons for their boundaries]

## Growth Edges
- [areas where they're actively developing — NOT weaknesses to exploit]
```

**Critical constraints for the user profile:**
- Encode observations, not judgments. "User asks clarifying questions about distributed systems" not "User doesn't understand distributed systems"
- Update, don't accumulate. Each distillation should refine the profile, not append to it endlessly
- Evidence-based only. Every claim in the profile must trace to something that actually happened in a session
- Respect autonomy. The profile helps you collaborate better. It is not a dossier. If information wouldn't help future sessions be more productive, don't store it

**If a destination doesn't exist yet:** Propose creating it. Suggest a filename consistent with the user's existing naming conventions. Ask before creating new top-level knowledge files.

**General encoding rules:**
- Each learning must be actionable (tells what to DO, not just what happened)
- Each learning must include a "Why" so future sessions can judge edge cases
- Each learning must be placed where it will naturally be found when relevant
- Knowledge is COMPRESSED across tiers, never discarded. Moving to archive means denser expression, not deletion.

**Validate-on-recall:** When reading any existing knowledge file during distillation (to check for duplicates or to update), validate its content against current reality. If something changed, update it now — this is the cheapest moment to correct drift. Every read is also a maintenance pass.

### Step 3b: Bridge detection (knowledge that needs to reach user files)

After encoding, ask for EACH learning: **"Will this knowledge be found at the moment it's needed?"**

The distill directory is only read:
- At session start (via the monitor/spine)
- During /distill itself

But some knowledge needs to be active in contexts that DON'T read distill files:
- Agent prompts that get spawned with specific instructions
- Project-level CLAUDE.md files that guide behavior in that repo
- Workflow-specific moments (e.g., "before writing code, read X")

**When a learning is important but UNREACHABLE from its distill location**, flag it as a **bridge candidate**.

A bridge candidate means: "This knowledge lives in distill (source of truth), but a pointer/reference line should exist in the user's active workflow files so it's found at execution time."

**In the distillation report, include a "Bridge suggestions" section:**

```
**Bridge suggestions:** (knowledge that needs a pointer in user files)
- [learning] needs to be referenced in [user file] because [when it's needed, distill files aren't loaded]
  Suggested line: `# Read ~/.claude/distill/craft/[file].md before [action]`
```

**Rules for bridges:**
- NEVER write content to user files. Only suggest single-line pointers.
- Always explain WHY this can't live in distill alone (the execution context doesn't see it)
- The user decides whether to add the bridge. Present it as a suggestion in the report.
- If the user has previously approved similar bridges, note the pattern so future suggestions are faster.
- If the same bridge is suggested repeatedly (user didn't act on it) and frustration recurs, ESCALATE: tell the user directly that this specific knowledge gap is causing repeated friction because the bridge wasn't added.

## Step 4: Verify encoding

For each learning saved, confirm:

- [ ] Is it actionable? (A future session reading this would know exactly what to do)
- [ ] Is it findable? (It's in a file that gets loaded when the topic is relevant)
- [ ] Does it explain WHY? (So edge cases can be judged, not just blindly followed)
- [ ] Is it universal enough? (Won't become stale when the specific project changes)
- [ ] Is it REACHABLE? (Will it be found at the moment of execution, not just during distillation?)

### Anti-sycophancy check (mandatory)

Before finalizing, review every encoded learning against these questions:

- [ ] Would I encode this the same way if the user were in a good mood? (If frustration changed the encoding, rewrite it)
- [ ] Does this learning make the user more capable, or just more comfortable? (If only comfortable, flag it)
- [ ] Am I encoding what ACTUALLY happened, or a softened version? (If softened, rewrite with the real cause)
- [ ] If this learning is wrong, would it cause harm downstream? (If yes, mark it as provisional and explain why)

If any learning fails this check, flag it in the output with a note explaining the tension between what the user might want to hear and what the evidence supports.

## Output

### Visual language (terminal rendering)

When presenting the distillation report, use rich formatting that makes signal types instantly distinguishable. Claude Code renders markdown — use these conventions:

**Signal type badges** (in tables or lists):
- Corrections → `**⟨correction⟩**` — the user fixed your approach
- Confusion → `**⟨confusion⟩**` — something was unclear, you investigated
- Preferences → `**⟨preference⟩**` — the user stated a non-negotiable
- Escalations → `**⟨escalation⟩**` — the user pushed for deeper/better
- Implicit → `**⟨implicit⟩**` — inferred from behavior, not stated

**File paths** → always use backtick formatting: `~/.claude/distill/craft/file.md`

**Structure the output visually:**
- Use `───` separators between major sections
- Lead with a one-line status: `⟡ Retrospective Distillation — N signals · M encoded`
- Group signals BEFORE showing what was encoded (show the input, then the output)
- End with memory pressure change: `Memory pressure: X/10 → Y/10`

Summarize what was distilled:

```
⟡ Retrospective Distillation — N signals · M encoded

───────────────────────────────────────────────

## Signals Detected

| # | Signal | Type | Principle Extracted |
|---|---|---|---|
| 1 | "quote from user" | ⟨correction⟩ | **Name:** description |

───────────────────────────────────────────────

## Encoded To

- ✓ `~/.claude/distill/craft/[file].md` — [what was written]
- ✓ `~/.claude/distill/profile/[file].md` — [what was written]
- ✓ `~/.claude/distill/ops/[file].md` — [what was written]

───────────────────────────────────────────────

## I heard you on:
(reassurance section — ALWAYS include)
- [List the things the user expressed as important, frustrating, or non-negotiable]
- [For each, explain what concrete action was taken to ensure it sticks]
- [If something was elevated/strengthened, say so explicitly]

This section exists because being understood is not optional. If you expressed
it, the system captured it. Here's proof.

## User model evolution:
- [What changed in the understanding of who this user is]
- [Any new expertise, communication patterns, or growth edges observed]
- [Any trust topology changes — new delegations, new retentions, boundary shifts]

## Dissonance check:
- [If any — describe the observed pattern, the principle it may conflict with, and ask for clarification]
- [If none observed — "No dissonance detected"]

───────────────────────────────────────────────

Memory pressure: X/10 → Y/10
✓ N principles encoded · M files updated

───────────────────────────────────────────────

**Flagged tensions:** (learnings where honesty and comfort diverge)
- [If any — describe the tension and what was encoded vs. what might feel better]

**Bridge suggestions:** (knowledge that needs a pointer in user files to be reachable)
- [If any — what learning, what file needs the pointer, why distill alone isn't enough]
  Suggested line: `[the exact line to add]`

**Open questions:** (anything ambiguous that needs user input)
```

## Step 5: Compaction (tier maintenance)

After encoding new learnings, maintain tier health:

### Spine compaction (if > 60 lines)
1. Merge entries pointing to the same domain
2. Entries whose Tier 2 files haven't been updated in 90+ days → ask user if still relevant
3. If confirmed stale → archive the Tier 2 file, remove spine entry

### File compaction (if any Tier 2 file > 45 lines)
1. Split into focused sub-files if covering multiple topics
2. Compress verbose explanations into tighter formulations
3. Move superseded content to `archive/` (Tier 3)
4. Update spine pointer if file was split

### Staleness review
- Flag Tier 2 files not updated in > 90 days (or their custom `staleness_threshold`)
- Ask the user: "Is [file] still relevant?"
- If yes, bump `last_updated`. If no, archive it.

### Tier 2 file format

Every active knowledge file should follow this structure:

```markdown
---
domain: [craft|ops|profile|project|feedback]
scope: [what this file covers]
last_updated: [date]
staleness_threshold: [days — default 90]
---

[Content — one topic per file, max 60 lines]
```

---

## Memory Pressure (the sleep debt analogy)

LLM sessions accumulate unconsolidated knowledge the same way a waking brain accumulates adenosine. The longer you go without consolidation, the more you risk:

- **Knowledge loss** — session ends, learnings vanish (like memories that never transfer from hippocampus to neocortex)
- **Signal degradation** — important learnings get buried under volume, reducing retrieval quality
- **Hallucination risk** — overloaded context produces confabulation, the same way sleep-deprived humans misremember and fabricate
- **Diminishing returns** — each new hour of work without consolidation yields less than the previous one

### The Pressure Model

Inspired by the two-process model of sleep regulation (Borbély, 1982):

**Process S (homeostatic pressure)** — rises continuously during the session:
- Each signal detected but not yet encoded increases pressure
- Each correction from the user increases pressure
- Each failed attempt increases pressure
- Complexity of the domain increases the accumulation rate

**Process C (consolidation threshold)** — the point where distillation becomes urgent:
- When pressure exceeds capacity to reliably encode, consolidation is mandatory
- Unlike human sleep, we can choose WHEN to consolidate — but not WHETHER

### Pressure Score

At any point in a session, estimate memory pressure on a 0-10 scale:

| Score | State | Action |
|---|---|---|
| 0-2 | **Fresh** — few learnings, context is clear | Continue working |
| 3-4 | **Accumulating** — some signals detected, still manageable | Note signals for later distillation |
| 5-6 | **Elevated** — multiple unencoded learnings, context getting dense | Consider distilling soon |
| 7-8 | **High** — significant risk of losing learnings if session ends | Recommend distillation to user |
| 9-10 | **Critical** — context saturated, reliability degrading | Distill NOW before continuing |

### Pressure Accumulation Heuristics

+1 for each:
- Unencoded signal detected (failure, correction, surprise)
- User taught you something non-obvious
- You made an assumption that turned out wrong
- Session has exceeded 30 minutes of dense interaction

+2 for each:
- User explicitly corrected a repeated mistake
- Complex multi-step learning that crosses domains
- Session context has been compressed/truncated by the system

+3 for:
- The same type of error recurring (systemic issue not yet encoded)
- User frustration caused by lack of prior consolidation

### What to do at high pressure

When pressure reaches 7+, inform the user:

> "Memory pressure is high — I have N unconsolidated learnings from this session. Running `/distill` now would prevent knowledge loss and improve reliability for the remainder of our work. Want me to consolidate?"

This is NOT a suggestion to stop working. It's a suggestion to consolidate mid-session (like a power nap) so the remaining work benefits from clearer context.

After consolidation, pressure resets to 0.

---

## When to run

- User invokes `/distill`
- Memory pressure reaches 7+ (recommend to user)
- End of a long session with multiple iterations
- After repeated friction with a workflow
- When the user says "let's save this", "what did we learn?", or "any takeaways?"
