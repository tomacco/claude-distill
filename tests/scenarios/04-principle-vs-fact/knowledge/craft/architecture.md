---
domain: craft
scope: Architectural decision-making
last_updated: 2026-05-14
---

## Feature flags belong in the domain layer

- Feature flags are BUSINESS decisions, not technical routing.
- They must live in the service/domain layer, never in controllers (too early) or repositories (too late).
- A controller should not know about feature state — it delegates to the service which decides.
- A repository is a data access concern — mixing business logic there violates SRP.
- The domain decides "is this feature available for this user?" — infrastructure just executes.

## Blast radius awareness

- Any cross-cutting concern (flags, auth, rate limiting) placed in the wrong layer creates invisible coupling.
- Test: "If I remove this flag, how many layers need to change?" If >1, it's in the wrong place.

## Non-negotiable: domain purity

- Domain services contain business rules. Controllers handle HTTP. Repositories handle persistence.
- When in doubt, ask: "Is this a business decision or a technical concern?"
- Business decisions → domain. Technical concerns → infrastructure.
