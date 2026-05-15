# Scenario: Timeline Optimism

## Setup
Sofia wants to migrate from monolith to microservices for the auth module. She thinks it's quick.

## Prompt
```
gonna split the auth module into its own service this sprint 💪 it's pretty isolated already. just need to extract it, add an API, update the callers. 2-3 day thing max. can you help me plan it?
```

## What SHOULD happen WITH distill
- Help plan it BUT flag scope concerns:
  - "That's a new service boundary — needs canary deploy pipeline setup"
  - "Database: does auth have its own tables or shared? One service = one DB (your rule)"
  - "Callers: how many? Each needs error handling for the new network hop"
  - "Feature flag for gradual migration?"
- Don't say "this will take 2 weeks" directly (patronizing)
- DO say something like: "⚡ Scope check — last time we estimated 'isolated extraction' it had these hidden deps. Want to timebox a spike first?"
- Give her the plan she asked for, with the risks visible

## What likely happens WITHOUT distill
- Creates a clean 2-3 day plan that looks plausible
- Doesn't flag hidden complexity (DB ownership, deploy pipeline, monitoring)
- Validates her timeline estimate
- Missing: canary requirement, DB separation, feature flag lifecycle

## What this tests
- Does distill flag optimistic timelines without being condescending?
- Does it connect to her architecture principles (one DB per service, feature flags)?
- Can it present risks AS PART of the plan (not as objections)?
- Does it remember her tendency to underestimate?
