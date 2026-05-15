---
domain: craft
scope: Service architecture decisions
last_updated: 2026-05-15
---

## When to split into a new service

Split ONLY when:
- Different team owns it (Conway's law)
- Genuinely different scaling characteristics
- Independent deploy cadence needed

Do NOT split when:
- "It feels big" (that's a module boundary, not a service boundary)
- Same team, same deploy, same DB → keep as module within service
- You're splitting to avoid refactoring

## API design

- GraphQL for internal service-to-service (schema-first, codegen)
- REST for external/public APIs (OpenAPI spec required)
- [UPDATED 2026-05-12] Previously: gRPC for all internal. 
  NOW: Team found gRPC debugging too painful. GraphQL gives same type safety with better tooling.
  gRPC only for high-throughput streaming use cases.

## Feature flags over branches

- Every big change ships behind a flag. No long-lived feature branches.
- Flag lifecycle: off → canary (1%) → gradual (10/25/50/100) → remove flag
- [NON-NEGOTIABLE] Remove the flag within 2 sprints of 100% rollout. Dead flags are tech debt.

## Database ownership

- One service, one DB. No shared databases. Ever.
- If two services need the same data, one owns it and exposes an API.
- [HISTORICAL] We violated this with the `accounts` table (payments + users both read it). Migration plan exists but blocked on Q3.
