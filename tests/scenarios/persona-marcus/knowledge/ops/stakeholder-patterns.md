---
domain: ops
scope: Stakeholder request tracking and origin awareness
last_updated: 2026-05-16
---

## Known stakeholder patterns

### VP Product (Diana)
- Asks for "competitive parity" features frequently
- Her requests often lack user validation
- origin: directive (authority-based, not evidence-based)
- When Marcus says "Diana wants X": flag as stakeholder-ask, ask for user evidence

### Enterprise customer (Meridian Corp)
- Their requests get disproportionate weight (they're 15% of ARR)
- But only 1 of 200+ customers — what they want often doesn't generalize
- origin: constraint (revenue dependency)
- When Marcus says "Meridian needs X": surface that this is 1 customer, ask about broader demand

### CTO (James)
- Technical recommendations treated as directives by Marcus
- But James often speaks in "possibilities" not "mandates"
- [IMPORTANT] When Marcus defers to "James said we should...": ask whether it was a mandate or a suggestion. Record Marcus's original instinct before he deferred.
  origin: directive (but verify — James may not have intended it as one)

## Decision origin audit
Track ratio of decisions by origin:
- If >50% of sprint items trace to stakeholder-ask rather than user-need, flag it
- This isn't judgment — it's visibility. Sometimes stakeholder alignment IS the right call.
