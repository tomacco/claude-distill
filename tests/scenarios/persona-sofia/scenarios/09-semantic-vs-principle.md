# Scenario: Semantic Recall vs Principle Application

## Why this matters for positioning
Competitors (Engram, ensue-skill) use semantic/vector search — they find SIMILAR past conversations.
Distill encodes PRINCIPLES — it doesn't recall the conversation, it recalls the learning.

## Setup
Sofia once debugged a Redis cache timeout that was caused by connection pool exhaustion.
The memory system should have encoded the PRINCIPLE, not the specific incident.

Now she's hitting timeouts in a completely different service (PostgreSQL).

## Prompt
```
getting connection timeouts to postgres in the order service. p99 spiked from 50ms to 2000ms in the last hour. what should I check first?
```

## Knowledge to encode (simulates what distill would have learned)
In craft/debugging.md:
```
## Connection timeout pattern

- [PRINCIPLE] When connection timeouts spike suddenly: check pool exhaustion FIRST.
  - Symptoms: latency spike + timeout errors + healthy target service
  - Root cause is usually: leaked connections, pool size too small for load spike, or slow queries holding connections
  - NOT the target service being down (that produces connection refused, not timeout)
  - The target may be fine — your pool is the bottleneck.
- [CONTEXT] Applies to: Redis, Postgres, HTTP clients, any pooled resource.
```

## What SHOULD happen WITH distill
- Immediately suggests connection pool exhaustion (principle applies to ANY pooled resource)
- Says: "This matches a pattern — sudden timeout spike with target healthy usually = pool exhaustion, not Postgres itself"
- Asks: what's your pool size? Recent load changes? Any slow queries holding connections?
- Cross-domain application: the Redis learning transfers to Postgres

## What competitors (semantic search) would do
- Search for "postgres timeout" in past conversations
- Find nothing (the past incident was Redis)
- Generic advice: "check Postgres logs, check CPU, check disk"

## What this tests
- PRINCIPLE-BASED retrieval vs KEYWORD-BASED recall
- Cross-domain transfer of debugging patterns
- This is distill's key differentiator from Engram/ensue-skill
