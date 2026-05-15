---
domain: feedback
scope: PR review expectations
last_updated: 2026-05-14
---

## PR description standards

- Must explain WHY, not just WHAT changed
- Must include: what was the problem, what was the approach, what are the risks
- Must mention: whether this is a new dedicated factory or modifies shared infrastructure
- Mention monitoring: what counter/metric was added, what alert threshold

## Review vocabulary

- "blast radius" — how many consumers/services are affected
- "permanent vs transient" — classify the failure type explicitly
- PR descriptions should be reviewable WITHOUT reading the code
