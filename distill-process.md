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

**Frustration analysis (apply Integrity Principle #4):**
When frustration is detected, investigate its source honestly:
- Was it caused by YOUR failure? (wrong assumption, slow response, missed context) → Encode as process improvement
- Was it caused by an EXTERNAL system? (tooling, CI, third-party API) → Encode as operational knowledge
- Was it caused by the USER's own gap? (missing knowledge, skipped step, premature optimization) → Encode as a growth opportunity — name it directly but respectfully
- Was it caused by a MISMATCH between user and agent? (different mental models, communication style clash) → Encode as calibration data for both sides

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

## Step 4: Verify encoding

For each learning saved, confirm:

- [ ] Is it actionable? (A future session reading this would know exactly what to do)
- [ ] Is it findable? (It's in a file that gets loaded when the topic is relevant)
- [ ] Does it explain WHY? (So edge cases can be judged, not just blindly followed)
- [ ] Is it universal enough? (Won't become stale when the specific project changes)

### Anti-sycophancy check (mandatory)

Before finalizing, review every encoded learning against these questions:

- [ ] Would I encode this the same way if the user were in a good mood? (If frustration changed the encoding, rewrite it)
- [ ] Does this learning make the user more capable, or just more comfortable? (If only comfortable, flag it)
- [ ] Am I encoding what ACTUALLY happened, or a softened version? (If softened, rewrite with the real cause)
- [ ] If this learning is wrong, would it cause harm downstream? (If yes, mark it as provisional and explain why)

If any learning fails this check, flag it in the output with a note explaining the tension between what the user might want to hear and what the evidence supports.

## Output

Summarize what was distilled:

```
## Distillation Report

**Signals found:** N
**Learnings encoded:** M
**User model updates:** K

| # | Learning (principle) | Destination | New/Updated |
|---|---|---|---|
| 1 | ... | ... | ... |

**User model evolution:**
- [What changed in the understanding of who this user is]
- [Any new expertise, communication patterns, or growth edges observed]

**Knowledge structure used:**
- Craft: [path or "none — consider creating one"]
- Operations: [path or "none"]
- User profile: [path or "none — consider creating one"]
- Memory: [path or "none"]

**Flagged tensions:** (learnings where honesty and comfort diverge)
- [If any — describe the tension and what was encoded vs. what might feel better]

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
