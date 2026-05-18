# Proposal: User Model v2 — Always-On Preferences

**Problem**: aura-distill scores 3.17/5 on user model (5th of 7). The winner (knowledge-graph, 4.33/5) inlines preferences directly in its rules file — zero retrieval cost, always present, cannot be missed.

**Root cause**: User preferences are locked behind lazy-load gates. Profile loads when the SPINE domain trigger fires, but user identity applies to EVERY response. The architecture treats "who you are" like "what you know about Kafka" — domain-specific, opt-in. It should be ambient.

---

## 1. Architecture Change

### Current flow

```
Session start → rules/distill.md loaded (retrieval instructions only)
             → SPINE.md loaded (index only)
             → User asks question
             → IF domain matches "profile" trigger → load profile/user.md
             → THEN apply preferences (maybe)
```

### Proposed flow

```
Session start → rules/distill.md loaded (retrieval instructions + ALWAYS-ON PREFS)
             → SPINE.md loaded (index only)
             → User asks question
             → Preferences ALREADY in context, applied immediately
             → IF domain matches profile trigger → load full profile for deep context
```

### What changes in each file

**`rules/distill.md`** — gains a new section: `## Always-On User Preferences` (max 15 lines). This section contains the 5-8 most critical preferences that must apply to every response. It lives in the rules file because rules files are loaded on every session, unconditionally.

**`SPINE.md`** — the profile entry changes from passive to split:

```markdown
# Before
- [User profile](profile/user.md) — when calibrating explanations or suggestions

# After  
- [User profile — deep context](profile/user.md) — when calibrating expertise level, understanding decision patterns, or investigating delegation/trust
```

The always-on preferences no longer depend on SPINE triggers at all — they're in the rules file.

**`profile/user.md`** — keeps the full schema (Expertise Map, Communication Style, Thinking Patterns, Trust Topology, Growth Edges) but gains a frontmatter field:

```markdown
---
domain: profile
scope: user identity and behavioral model
last_updated: 2026-05-17
staleness_threshold: 60
promoted_to_rules: 2026-05-17
---
```

The `promoted_to_rules` date tracks when preferences were last synced to the always-on section.

**`distill-process.md`** — gains a new sub-step in Step 3 (encoding) that evaluates whether any user model change should be promoted to always-on.

---

## 2. Always-On Preferences

### Location: `rules/distill.md`, new section after line 64

The section is capped at 15 lines to stay within the 60-line budget (rules file is currently ~64 lines; the new section replaces the generic "Match the user's communication style" line at line 32 with a concrete, enforceable version).

### Format

```markdown
## Always-On User Preferences

<!-- Synced from {DISTILL_DIR}/profile/user.md by /distill. Max 15 lines. -->
<!-- These apply to EVERY response. No retrieval needed. -->

**Output rules** (enforce on every response):
- Concise: default to bullet points, not paragraphs. Max 3 sentences before a structural break.
- Code over prose: when explaining how, show the code. Wrap explanation around it, not the reverse.
- No filler: never say "Great question!", "I'd be happy to", "Let me help you with that."
- Uncertainty: say "I'm not sure" directly. Never hedge with 5 qualifiers.

**Interaction rules** (enforce on every exchange):
- Terse input = terse output. Match energy, don't over-expand.
- Don't ask what you can infer. If the codebase answers the question, read the codebase.
- When corrected, apply immediately. Don't explain why you were wrong unless asked.

**Identity context** (for calibration):
- Shell: fish | Editor: neovim | Stack: Go, TypeScript, Kotlin
- Expertise: deep in backend systems, working in frontend, learning ML
- Decision style: intuition-first, validates with data after
```

### Key design decisions

1. **Enforcement language, not descriptive language.** "Concise: default to bullet points" is an instruction Claude can follow. "User prefers concise answers" is a fact Claude can ignore when the question is complex.

2. **Three categories.** Output rules (how to format responses), interaction rules (how to behave), identity context (who the user is). Output rules are the most enforceable. Identity context is the least — it's calibration data, not instructions.

3. **Synced, not hand-written.** The `/distill` process writes this section automatically from the full profile. Users never edit rules/distill.md directly — it's machine-managed. This preserves the isolation principle.

4. **The `<!-- Max 15 lines -->` comment** is a hard cap. If a user has 20 preferences, `/distill` must prioritize. Priority order: (a) preferences that caused frustration when violated, (b) preferences confirmed 3+ times, (c) output-format preferences, (d) everything else.

---

## 3. Enforcement Hooks

The rules file needs specific instructions that make Claude *enforce* preferences, not just *know* them. These replace the current generic line 32 ("Match the user's communication style").

### New enforcement section in `rules/distill.md`

Replace lines 32-33 with:

```markdown
**Enforce user preferences actively.** The "Always-On User Preferences" section below contains preferences that apply to EVERY response. These are not suggestions — they are constraints. Before generating any response, verify:
1. Does the response format match the output rules? (If it says "bullet points", don't write paragraphs.)
2. Does the response length match the interaction rules? (If input was 5 words, output should not be 500.)
3. If you catch yourself violating a preference because the situation "seems to call for something different" — apply the preference anyway. The user stated it for a reason. If truly inappropriate, mention the tension in one sentence, then comply.
```

### Why this works

The current system says "match their style" — this is vague. The proposed version:
- Gives a concrete checklist (3 items)
- Makes preferences override Claude's default instincts ("apply the preference anyway")
- Handles the edge case where Claude's training wants to be verbose on complex topics

---

## 4. Schema Completion

The `distill-process.md` defines five profile sections. Currently, most users only get Expertise Map and Communication Style populated. Here's how to make the remaining three actionable.

### Trust Topology

**Problem**: The schema asks "what does the user delegate vs retain" — but this requires many sessions of observation. Most profiles are empty here.

**Fix**: Change the detection trigger. Instead of waiting for explicit delegation signals, infer from behavior patterns that already exist.

Add to `distill-process.md` Step 1b, under "Delegation & trust signals":

```markdown
**Accelerated trust detection** (use these proxies when explicit signals are scarce):
- User runs the command you suggested without reading it → high trust in your commands
- User reads your code diff line-by-line before applying → low trust in your code, OR high-stakes context
- User asks "are you sure?" → trust-but-verify mode. Note what domain triggered it.
- User says "just do it" → high trust OR low stakes. Disambiguate from context.
- User re-runs your tests manually → doesn't trust your test selection
- User edits your commit messages → cares about public-facing text (retains comms)

**Encoding format for trust entries:**
- [task]: [delegates|verifies|retains] — because [reason if known, "unknown" if not]
  observed: [count] times
  last_seen: [date]
  confidence: [experimental|provisional|validated]
```

### Thinking Patterns

**Problem**: "Does the user reason from principles or examples" is hard to detect in a single session.

**Fix**: Make it observable through concrete behavioral markers, and encode provisionally from session 1.

Add to `distill-process.md` Step 1b, under "Thinking signals":

```markdown
**Observable markers for thinking patterns:**
- When explaining a problem, does the user start with the abstract ("the issue is consistency") or the concrete ("this endpoint returns 500")? → principle-first vs. example-first
- When given options, does the user ask for data ("what's the performance difference?") or state a preference ("I like option B")? → analytical vs. intuitive
- When stuck, does the user explore broadly ("what else could cause this?") or dig deep ("let's trace this specific path")? → breadth-first vs. depth-first
- How does the user respond to uncertainty? ("let's try and see" = experimental, "let's research first" = analytical, "what does the team think" = consensus)

**Encoding format:**
- Primary reasoning: [principle-first|example-first|mixed] — observed in [context]
- Decision mode: [data-driven|intuition-led|consensus|authority-defers]
- Uncertainty response: [experimental|analytical|consensus-seeking|authority-seeking]
  confidence: provisional (auto-set until 3+ observations)
```

### Growth Edges

**Problem**: "Areas where they're actively developing" feels judgmental. Distillers avoid writing it.

**Fix**: Reframe as "areas where the user invests curiosity" and tie to concrete session evidence.

Add to `distill-process.md` Step 1b, after growth edges:

```markdown
**Growth edges are NOT weaknesses.** They are domains where the user is actively investing attention. Evidence:
- User asks detailed questions about X (not "what is X" but "how does X handle Y") → actively learning X
- User tries something new and asks for feedback → experimenting in this area
- User reads your explanation fully instead of skipping to the code → absorbing knowledge here
- User bookmarks/saves a reference you shared → investing in this domain

**Encoding format:**
- [domain]: actively learning — evidence: [what they asked/did]
  growth_type: [deepening|broadening|skill-building]
  first_observed: [date]
  
Do NOT encode:
- Things the user is bad at (that's a judgment)
- Things the user doesn't know (that's obvious and unhelpful)
- Things the user explicitly said they don't care about (that's a preference, not a growth edge)
```

---

## 5. Preference Lifecycle

### Promotion chain

```
Session signal → profile/user.md (experimental)
             → 3+ confirmations → profile/user.md (validated)  
             → caused frustration when violated → profile/user.md (hardened)
             → hardened + output-relevant → promoted to rules/distill.md always-on section
```

### Promotion criteria for always-on

A preference gets promoted to the always-on section when ALL of these are true:

1. **Confidence is `validated` or `hardened`** — confirmed 3+ times or survived a challenge
2. **It's format/interaction-relevant** — applies to response format, length, tone, or interaction flow (not domain-specific knowledge)
3. **It's enforceable in one line** — can be stated as an instruction, not a description
4. **It doesn't duplicate a more specific rule** — if it only applies in code review, it stays in the feedback file

### Demotion and staleness

Add to `distill-process.md` Step 5 (compaction):

```markdown
### Always-on preference review (during every distillation)

1. Read the always-on section in `rules/distill.md`
2. For each preference, check:
   - Was it CONTRADICTED in this session? → demote to profile, mark as [CONTEXT]-dependent
   - Has the user explicitly changed it? ("actually, I want more detail now") → update in-place
   - Has it gone 90+ days without reinforcement AND a new preference conflicts? → flag for user review
3. Check profile/user.md for newly hardened preferences that should be promoted
4. Rewrite the always-on section if changes are needed (keep within 15-line cap)

**Stale preference detection:**
- If a preference was promoted but the user's behavior consistently contradicts it (3+ violations without correction), flag it:
  "Your always-on preference says [X] but you've been doing [Y] in recent sessions. Has this changed?"
- Don't auto-remove. Ask first. Behavior might be contextual.
```

### How `/distill` writes the always-on section

Add to `distill-process.md` Step 3, after the user profile encoding rules:

```markdown
### Step 3c: Always-on sync

After updating profile/user.md, determine if the always-on section in rules/distill.md needs updating.

**Trigger conditions** (any one is sufficient):
- A new preference reached `hardened` confidence
- A preference that caused frustration was identified (Step 1c escalation)
- This is the first distillation (bootstrap)
- The always-on section doesn't exist yet

**Sync process:**
1. Read all preferences from profile/user.md with confidence >= validated
2. Filter to format/interaction/identity preferences (exclude domain-specific)
3. Rank by: frustration-caused > hardened > validated, then by confirmation count
4. Take top entries that fit in 15 lines
5. Format as enforcement rules (imperative mood, not descriptive)
6. Write the always-on section to rules/distill.md, preserving all other sections

**Format the always-on section as three blocks:**
- **Output rules**: how to format responses (enforced per-response)
- **Interaction rules**: how to behave in the exchange (enforced per-exchange)
- **Identity context**: who the user is (calibration, not enforcement)

If there aren't enough validated preferences yet (new user), write a minimal section:
```markdown
## Always-On User Preferences

<!-- Not enough data yet. This section fills in as /distill learns your preferences. -->
<!-- Run a few sessions and /distill regularly to build your profile. -->

**Identity context:**
- [whatever is known so far, even if just the shell/editor from env detection]
```
```

---

## 6. Migration Path

### For existing users with profile data

No breaking changes. The migration happens automatically during the next `/distill` run.

Add to `distill-process.md` Step 0 (discovery), after the existing migration check:

```markdown
### Always-on bootstrap (one-time)

If `rules/distill.md` does NOT contain a "## Always-On User Preferences" section:

1. Read profile/user.md (if it exists)
2. Read feedback/*.md files (if they exist)
3. Extract all preferences with confidence >= provisional
4. Apply the Step 3c sync process to generate the initial always-on section
5. Write it to rules/distill.md
6. Report in distillation output: "Bootstrapped always-on preferences from existing profile"

This ensures existing users get the always-on section without losing any data. Their profile files are unchanged — the rules file just gets a new section that references the same preferences.
```

### For the install script

The install script (`install.sh`) downloads `rules/distill.md` from the repo. The repo version will include a placeholder always-on section:

```markdown
## Always-On User Preferences

<!-- This section is populated by /distill as it learns your preferences. -->
<!-- Until then, distill uses the full profile in {DISTILL_DIR}/profile/ -->
```

This means fresh installs have an empty always-on section that fills in after the first `/distill` run. No manual setup required.

### For the rules file line budget

Current `rules/distill.md`: ~64 lines.
Changes:
- Remove line 32-33 (generic "match style" instruction): -2 lines
- Add enforcement hook (3 lines of instruction): +3 lines  
- Add always-on section header + placeholder: +4 lines (grows to max 19 lines when populated)

**Worst case with full always-on section: 64 - 2 + 3 + 19 = 84 lines.**

This exceeds the 60-line budget. Two options:

**Option A (recommended):** Raise the rules file cap to 80 lines. The always-on preferences ARE the most valuable content in the file — they're worth the tokens. The rules file is loaded once per session; 20 extra lines cost ~30 tokens. The user model improvement is worth far more than 30 tokens.

**Option B:** Compress existing content. Lines 24-30 (origin tracking explanation) could be reduced from 7 to 3 lines. Lines 57-63 (struggling-is-a-signal) could be moved to distill-process.md (it's a distillation instruction, not a retrieval instruction). This recovers ~10 lines.

**Recommendation:** Do both. Compress where possible, then allow up to 80 lines. The rules file has a different cost profile than tier-2 files — it's loaded exactly once and governs all behavior. Being tight here saves tokens but loses enforcement.

---

## 7. Concrete File Diffs

### `rules/distill.md` — after changes

The full file with changes applied (showing only the modified/new sections):

**Replace lines 32-33** with:

```markdown
**Enforce user preferences actively.** The "Always-On User Preferences" section below contains preferences that apply to EVERY response. Before generating a response:
1. Check output rules — does format match? (bullets vs prose, code vs explanation)
2. Check interaction rules — does energy match? (terse input = terse output)
3. If a preference seems wrong for this situation, apply it anyway and note the tension in one sentence. The user set it deliberately.
```

**Add after the final line (after "The SPINE is your memory..." block):**

```markdown

## Always-On User Preferences

<!-- Synced from {DISTILL_DIR}/profile/user.md by /distill. Max 15 lines. -->
<!-- These apply to EVERY response. No retrieval needed. -->
<!-- Section auto-populated after first /distill run. -->
```

### `distill-process.md` — new Step 3c

Insert after the "User profile encoding rules" section (after line 406):

```markdown
### Step 3c: Always-on preference sync

After updating profile/user.md, sync critical preferences to rules/distill.md.

**When to sync:**
- New preference reached `validated` or `hardened`
- Preference caused frustration when violated (Step 1c escalation)
- First distillation (bootstrap)
- Always-on section is empty/placeholder

**Process:**
1. Collect preferences from profile/user.md with confidence >= validated
2. Filter: must be format, interaction, or identity — not domain-specific
3. Rank: frustration-triggered > hardened > validated > by confirmation count
4. Take top entries fitting 15 lines
5. Write as three blocks in rules/distill.md under "## Always-On User Preferences":
   - **Output rules** — response format (imperative mood: "do X", not "user prefers X")
   - **Interaction rules** — exchange behavior
   - **Identity context** — shell, stack, expertise levels, decision style
6. Preserve all other sections of rules/distill.md unchanged

**If insufficient data (< 3 validated preferences):**
Write a minimal section with only identity context from available signals.

**Cap enforcement:**
If preferences exceed 15 lines, drop the lowest-ranked entries. They remain in profile/user.md — they're not lost, just not always-on.
```

---

## 8. Expected Impact

| Gap | Current | After |
|-----|---------|-------|
| Load-time gap | Preferences behind lazy-load gate | Critical preferences in rules file — zero retrieval cost |
| Application gap | Stated as facts, ignored under pressure | Stated as enforcement rules with explicit compliance checklist |
| Coverage gap | Missing output-format preferences | Output rules category in always-on section; enriched schema in profile |
| Split fragmentation | Profile and feedback are separate triggers | Always-on section unifies critical prefs; deep context stays split (acceptable) |

**Why this should move the score from 3.17 toward 4.0+:**

The winner (knowledge-graph) inlines everything in a single rules file. Our approach is structurally similar for the critical preferences (they're in rules/distill.md, loaded every session) while maintaining the richer profile in tier-2 for deep context. We get the winner's zero-cost retrieval without sacrificing our schema depth.

The enforcement hooks are the multiplier. The winner's preferences work partly because they're terse and imperative ("concise answers, no over-engineering"). Our current profile is descriptive ("user prefers concise answers"). The enforcement section transforms descriptive into imperative.

---

## 9. Risks and Mitigations

**Risk: Always-on section becomes stale.** Mitigation: Every `/distill` run validates and re-syncs the section. The `promoted_to_rules` date in the profile tracks freshness.

**Risk: Users with many preferences hit the 15-line cap.** Mitigation: Prioritization by frustration/confirmation count ensures the most important preferences survive. The full profile still exists for deep reads.

**Risk: Enforcement language causes Claude to be rigid.** Mitigation: The enforcement hook explicitly says "apply the preference anyway and note the tension in one sentence" — Claude can flag when a preference seems inappropriate for the situation, but still complies. User can then adjust.

**Risk: Profile fragmentation across profile/ and feedback/ is not fully solved.** Mitigation: The always-on section draws from BOTH sources, unifying them at the point of delivery. The underlying split is acceptable — it's an organizational detail, not a user-facing gap.
