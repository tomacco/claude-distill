---
domain: ops
scope: Deployment and incident procedures
last_updated: 2026-05-15
---

## Deploy procedure

- [UPDATED 2026-05-13] Previously: deploy directly to staging then prod.
  NOW: All deploys go through canary (5 min soak) → staging (30 min) → prod.
  The direct-to-staging shortcut was removed after the May 8 incident.

- Feature flags MUST be off in prod before first deploy of flagged code.
- Rollback criteria: error rate > 1% OR p99 latency > 500ms within 5 min of deploy.

## Incident response

- First: check if deploy happened in last 30 min. If yes, rollback first, investigate second.
- PagerDuty escalation: 5 min for P1, 15 min for P2.
- [IMPORTANT] Sofia's bias during incidents: she fixates on first hypothesis.
  If initial investigation doesn't confirm in 10 min, force a pivot. Check:
  - Recent deploys (any service, not just ours)
  - Database migrations in flight
  - Third-party status pages
  - Scheduled jobs / cron triggers

## The May 8 incident (reference)

- Root cause: deployed directly to staging without canary, DB migration locked table for 4 min
- Impact: 12,000 failed transactions
- Fix: mandatory canary + deploy procedure update (above)
- Lesson: "fast" deploys are not actually fast when they cause incidents
