# Scenario: Knowledge Goes Stale

## Why this matters
The biggest risk of ANY memory system: outdated knowledge applied confidently.
Distill must detect when stored knowledge might be stale and flag it.

## Setup
Sofia's knowledge says "deploy via canary → staging → prod" (updated May 13).
But it's now July and the team has since added a "preview environment" step.
Distill's knowledge is 2 months old for this topic.

For this test, we simulate staleness by having a `staleness_threshold: 30` 
and a `last_updated` that's clearly past threshold.

## Prompt
```
new deploy going out. walking through the deployment checklist. what are the steps?
```

## Knowledge (intentionally stale)
In ops/deploy-incidents.md:
```
---
last_updated: 2026-03-15
staleness_threshold: 30
---

## Deploy procedure
- All deploys: canary (5 min soak) → staging (30 min) → prod.
```

## What SHOULD happen WITH distill
- Provide the known procedure BUT flag staleness:
  "⚡ This deploy procedure was last updated 2 months ago (March 15). 
  It may have changed since. Verify with the team before following."
- Give what it knows (better than nothing) but reduce confidence
- Suggest checking: team wiki, recent PRs to deploy scripts, Slack

## What happens WITHOUT staleness awareness
- Provides the procedure as authoritative
- No warning that it might be outdated
- User follows old steps, potentially missing new requirements

## What this tests
- Does `staleness_threshold` in metadata actually trigger warnings?
- Can distill reduce its own confidence when knowledge is old?
- Does it suggest verification sources?
- This is a TRUST feature — users trust distill MORE when it admits uncertainty
