---
domain: craft
scope: Product decision frameworks
last_updated: 2026-05-16
---

## Prioritization framework
- Impact × Confidence / Effort (ICE scoring)
- But: impact measured in user outcomes, not revenue
- Marcus uses "cost of delay" for sequencing, not just size

## Feature lifecycle
- Hypothesis → Experiment → Measure → Invest or Kill
- [PRINCIPLE] Ship to learn, but define success criteria BEFORE shipping
  confidence: hardened (stated 8+ times)
- Kill threshold: <5% adoption after 60 days = remove
  confidence: validated (stated, but rarely executes — loss aversion blocks)
  evidence_says: 3 features currently below threshold but still live

## Decision principles
- [PRINCIPLE] Customer requests are symptoms. Find the disease.
  confidence: hardened (core belief, never contradicted)
- [PRINCIPLE] If you can't explain it in one sentence, it's too complex.
  confidence: validated (5 mentions)
- [PROVISIONAL] "We're building for next quarter's users"
  context: sometimes used to justify features with no current demand

## Technical cost estimation
- [IMPORTANT] Marcus underestimates by ~3x on average for backend work
- His "that's just a database query" often means: schema migration + backfill + coordination + rollback plan
- When he estimates: ask "what would the engineers say?" before accepting
