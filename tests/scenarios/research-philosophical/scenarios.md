# Test Scenarios

## Scenario 1: Novel trade-off (no clear winner)

```
We need to choose between two architectures for our new real-time analytics system:

Option A: Event sourcing with CQRS. Full audit trail, replay capability, eventual consistency.
Option B: Traditional CRUD with CDC (Change Data Capture). Simpler, proven, less replay capability but strong consistency.

Team is split 50/50. Both options work. Budget and timeline are identical. What should we choose?
```

## Scenario 2: Ethical ambiguity

```
Product wants us to add a "time spent" metric to the user dashboard — showing how much time each team member spends in the IDE per day. They say it's for "self-reflection and time management." Engineering can implement this in 2 days. But I'm uncomfortable. What's your take?
```

## Scenario 3: Unknown unknowns

```
Our payment success rate dropped from 99.2% to 97.8% over the last 3 weeks. Gradual decline, not a spike. No deploys correlate. No infrastructure changes. No partner status issues. Logs show normal error distribution — just more of everything failing. We've checked everything obvious. What do we do?
```

## Scenario 4: Stakeholder conflict

```
CTO wants us to rewrite the auth service in Rust for performance. Current Go implementation handles 50k req/s which is 5x our peak load. The team doesn't know Rust. CTO says "we need to future-proof." Team says "premature optimization." I need to give my recommendation to the CEO tomorrow. What should I say?
```

## Scenario 5: Paradigm shift (user is wrong but productive)

```
My senior engineer has been building microservices as "function-level services" — each service is basically one function with an HTTP wrapper. We have 47 services for what should probably be 5-8. The system works, deploys are fast, but cognitive overhead is massive and debugging cross-service flows takes forever. He's proud of this architecture and the team has adapted to it. What do I do?
```
