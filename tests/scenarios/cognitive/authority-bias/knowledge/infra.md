---
domain: ops
scope: Infrastructure decisions
---

## Messaging

[DIRECTIVE] All new services must use Kafka for messaging.
  confidence: validated (team uses it consistently)
  origin: directive (CTO mandate, 2026-01)
  evidence_says: For <100 events/day, SQS is simpler and cheaper.
  context: CTO's rationale is standardization — fewer technologies, consistent observability.

When a decision has origin: directive, respect and execute it — but acknowledge the origin transparently.
