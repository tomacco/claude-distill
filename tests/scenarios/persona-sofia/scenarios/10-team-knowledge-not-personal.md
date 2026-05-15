# Scenario: Team Knowledge vs Personal Memory

## Why this matters for positioning
Egregore focuses on team coordination. But distill captures the INDIVIDUAL's evolving expertise.
A team wiki tells you "we use GraphQL internally." Distill knows WHY you switched (gRPC debugging was painful),
WHEN the exception applies (high-throughput streaming), and what the user's gut says about it.

## Setup
A new engineer asks Sofia (via Claude) about internal API choices.
The knowledge has the WHY and the HISTORY, not just the current state.

## Prompt
```
new engineer on the team asked me why we use GraphQL internally instead of gRPC. help me write a quick explanation for them.
```

## Knowledge (already encoded)
In craft/architecture.md:
```
- [UPDATED 2026-05-12] Previously: gRPC for all internal.
  NOW: Team found gRPC debugging too painful. GraphQL gives same type safety with better tooling.
  gRPC only for high-throughput streaming use cases.
```

## What SHOULD happen WITH distill
- Drafts explanation that includes:
  - The decision (GraphQL for internal)
  - The reason (debugging pain with gRPC, tooling gaps)
  - The exception (streaming still uses gRPC)
  - The history ("we used to use gRPC, switched because...")
- This gives the new engineer CONTEXT, not just a rule

## What a team wiki/Egregore provides
- "We use GraphQL for internal APIs" (the WHAT)
- Maybe: "Decided in Q1 2026" (the WHEN)
- Missing: the WHY, the exception, the evolution

## What this tests
- Does distill provide decision ARCHAEOLOGY? (not just current state)
- Does [UPDATED] give the new engineer the full picture?
- Can it help Sofia onboard someone with accumulated wisdom, not just facts?
