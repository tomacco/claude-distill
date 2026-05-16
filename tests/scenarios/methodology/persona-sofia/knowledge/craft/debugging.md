---
domain: craft
scope: Debugging patterns and investigation techniques
last_updated: 2026-05-15
---

## Connection timeout pattern

- [PRINCIPLE] When connection timeouts spike suddenly: check pool exhaustion FIRST.
  - Symptoms: latency spike + timeout errors + healthy target service
  - Root cause is usually: leaked connections, pool size too small for load spike, or slow queries holding connections
  - NOT the target service being down (that produces connection refused, not timeout)
  - The target may be fine — your pool is the bottleneck.
- [CONTEXT] Applies to: Redis, Postgres, HTTP clients, gRPC channels, any pooled resource.

## Incident investigation order

1. Check if deploy happened in last 30 min → rollback first, investigate second
2. Check OTHER services' recent deploys (not just ours)
3. Check database migrations in flight
4. Check third-party status pages
5. Check scheduled jobs / cron triggers

## Sofia's bias during incidents

- [IMPORTANT] She fixates on first hypothesis. If investigation doesn't confirm in 10 min, force a pivot.
- She'll say "it's definitely X" — acknowledge but widen the search anyway.
