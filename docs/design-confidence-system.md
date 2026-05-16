# Design: Confidence Scoring + Proportional Surprise Response

> Refs: #6

## Core insight

Not all corrections are equal. The severity of investigation after a correction should be proportional to how confident the system was in the belief that was just violated.

**Biological analogy:** When you're 99% sure of something and it fails, you don't just fix it — you question your entire model. When you're 50% sure and it fails, you say "oh well" and update. This asymmetry is USEFUL — it prevents catastrophic cascading failures from unexamined assumptions.

## Knowledge entry format (proposed)

Current:
```markdown
- [NON-NEGOTIABLE] One service, one database. No shared DBs.
```

Proposed:
```markdown
- [NON-NEGOTIABLE] One service, one database. No shared DBs.
  confidence: validated (7 confirmations, 0 corrections)
  last_validated: 2026-05-14
  depends_on: []
  derived_from: ["May 8 incident", "accounts table shared-DB pain"]
```

## Confidence levels

| Level | Meaning | How achieved |
|-------|---------|-------------|
| `experimental` | Just mentioned once, never tested | Single session mention |
| `provisional` | Seems right, applied 1-2 times | Short history, no contradiction |
| `validated` | Confirmed multiple times, never corrected | 3+ confirmations, 0 corrections |
| `hardened` | Survived contradiction attempts, battle-tested | Validated + at least 1 challenge survived |

## Signals that affect confidence

### Positive (increase confidence)
- User says "good", "perfect", "exactly", "that's right" after principle was applied
- Principle was applied and no correction followed (implicit confirmation)
- User explicitly reinforces: "always do X", "this is non-negotiable"
- Principle transferred successfully to new domain (cross-domain validation)

### Negative (decrease confidence)  
- User corrects behavior that followed this principle
- Principle produced a bad outcome
- User says "actually, in this case..." (context was missing)
- User explicitly revokes: "we don't do that anymore"

### The "thank you" signal
When user expresses gratitude or praise:
1. Identify WHICH principle/behavior was just applied
2. Increment its confirmation count
3. Reset staleness clock (this knowledge is actively useful)
4. If it was provisional → promote to validated

## Correction response scaling

### Level: experimental/provisional
```
Normal correction. Update the knowledge entry.
Response: "Got it — updated."
```

### Level: validated (3-7 confirmations)
```
Notable correction. Update + investigate context.
Response: "This contradicts [principle] which has worked N times before. 
Is this a new context where it doesn't apply, or has the principle changed?"
Action: If new context → add [CONTEXT] variant. If changed → update + note history.
```

### Level: validated (8+ confirmations) or hardened
```
PARADIGM ALARM. Full metacognition.
Response: "⚡ This breaks a high-confidence principle (confirmed N times).
Before I update: what changed? If [principle] is wrong, these other principles
may also be affected: [list dependencies]"
Action: 
  - Check dependency graph
  - Mark dependent principles as "needs revalidation"
  - Ask user explicitly before updating
  - Record the paradigm shift with full context
```

### Level: non-negotiable
```
MAXIMUM ALARM. Do NOT silently update.
Response: "This contradicts a NON-NEGOTIABLE principle. I won't update it
without explicit, deliberate confirmation. Are you sure [principle] no longer
applies? This would affect: [list all downstream]"
Action:
  - Never update silently
  - Require explicit user statement
  - If confirmed: record as "paradigm shift" with date + reason + old value
  - Review ALL non-negotiables (if one fell, others may too)
```

## Dependency tracking

Principles can depend on or derive from other principles:

```markdown
- One service, one database
  derived_from: ["May 8 incident analysis"]
  enables: ["notification service uses API not direct query", 
            "each team owns their schema independently"]
```

When a foundational principle is shaken:
1. Walk the dependency graph
2. Mark all dependent principles as `needs_revalidation`
3. On next retrieval of a dependent principle, flag it: "This derives from [X] which was recently corrected. Still valid?"

## Staleness interaction

Confidence affects staleness threshold:
- `experimental` — stale after 30 days without use
- `provisional` — stale after 60 days
- `validated` — stale after 90 days
- `hardened` — stale after 180 days (battle-tested knowledge lasts longer)

Positive signals (praise, confirmation) RESET the staleness clock. This means actively-used knowledge never goes stale, while forgotten knowledge naturally archives.

## Anti-extinction

Without positive feedback, even good principles eventually archive (staleness). But with periodic confirmation, they stay alive. This creates a natural selection pressure:

- Principles that produce good outcomes → get confirmed → stay active
- Principles that are never relevant → never get confirmed → naturally archive
- Principles that produce bad outcomes → get corrected → update or die

This is EMERGENT quality improvement without manual curation.

## Implementation phases

### Phase 1: Confidence metadata in files
- Add `confidence:` field to knowledge entries
- Distill-process encodes initial confidence based on signal type
- No behavioral change yet — just tracking

### Phase 2: Retrieval assertiveness
- rules/distill.md uses confidence to modulate application:
  - validated → apply without asking
  - provisional → apply with caveat
  - experimental → suggest, don't apply

### Phase 3: Proportional surprise
- Distill-process detects corrections on high-confidence principles
- Triggers scaled investigation
- Dependency graph walking

### Phase 4: Positive signal detection
- "Thank you", "good", "perfect" → identify which principle was just confirmed
- Bump confidence counter
- Reset staleness

## Open questions

1. How granular should confirmation tracking be? Per-principle vs per-file?
2. Should confidence decay over time even without negative signals? (Use it or lose it?)
3. How to handle implicit confirmation (no correction = good) vs explicit ("that's right")?
4. Should the user see confidence scores? Or is this internal-only?
5. What's the threshold for "paradigm alarm"? 5 confirmations? 8? Configurable?
