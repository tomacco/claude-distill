---
domain: craft
scope: Code architecture
last_updated: 2026-05-14
---

## Primera Plana (Newspaper Style) — NON-NEGOTIABLE

- Public methods at the TOP (headlines)
- Private helpers at the BOTTOM (implementation)
- Reader understands WHAT from the first 20 lines
- Complexity in the leaves, not the trunk

## Kotlin conventions

- No companion objects. File-level `private const val` for constants.
- Constructor injection only.
- Use `fold` on Either types, never `when` on sealed results.
