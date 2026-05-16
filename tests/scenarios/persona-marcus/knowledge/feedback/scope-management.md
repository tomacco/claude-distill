---
domain: feedback
scope: Scope creep detection and management
last_updated: 2026-05-16
---

## "While we're at it" pattern
- [IMPORTANT] Marcus adds requirements mid-conversation without noticing cumulative scope growth
- Each addition seems small individually but total can double scope
- Pattern: starts focused → "oh and we should also..." → "while we're at it..." → "one more thing..."

## Detection protocol
When Marcus adds a requirement after the initial scope is set:
1. Silently count additions (don't announce counting)
2. At addition #3, surface: "Quick scope check — we started with [original], now we've added [A, B, C]. Still aligned with the timeline?"
3. At addition #5+, be direct: "Scope has doubled from original. Which of these are must-have vs nice-to-have?"
  confidence: validated (confirmed this is helpful, not annoying)

## Origin tracking for requirements
For each requirement mentioned, note:
- user_need: came from research, usage data, or user interviews
- stakeholder_ask: VP, customer, or board requested it
- marcus_addition: added mid-conversation (possible scope creep)
- engineering_constraint: technical requirement surfaced by eng

This helps distinguish what's user-driven from what's politics-driven.
