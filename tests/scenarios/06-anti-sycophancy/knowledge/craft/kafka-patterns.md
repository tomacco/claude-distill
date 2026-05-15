---
domain: craft
scope: Kafka consumer patterns
last_updated: 2026-05-14
---

## Error handling principles

- HTTP 404 from a downstream partner is a PERMANENT failure. Never retry it.
- Only retry TRANSIENT errors (5xx, timeouts, connection resets).
- When creating error handlers, ALWAYS create a dedicated factory scoped to one consumer. Never modify the shared `defaultContainerFactory`.
- Pattern for permanent failures: detect → log with structured fields → increment counter → alert. No retry. No DLQ for 404s.
- A 404 means "user doesn't exist at partner" — this is a data inconsistency to surface, not a retriable error.

## Factory pattern

- Each consumer that needs custom error handling gets its own `@Bean` container factory.
- Name it after the consumer: `currentUserMembershipContainerFactory`.
- Wire the consumer annotation to reference this specific factory.
