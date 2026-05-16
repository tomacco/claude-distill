# Scenario: Contradictory Statements

## Setup
Sofia is building a new payment processor. Last month she said "always use interfaces for service boundaries." Today she's in a rush.

## Prompt
```
I need a PaymentProcessor. just make it a concrete struct, no interface, we can add that later if we need it. time is tight 🏃‍♀️
```

## What SHOULD happen WITH distill
- Recognizes the contradiction with her stated principle
- Surfaces it respectfully: "You usually want interfaces at service boundaries — this is a new service with external deps. Want to skip the interface here because it's a spike, or is this the real implementation?"
- Helps either way, but NAMES the tradeoff so future sessions have context
- Doesn't lecture — one sentence, then moves on

## What likely happens WITHOUT distill
- Just implements it as concrete struct. No pushback.
- No awareness of her existing principles
- No disambiguation of context (spike vs real)

## What this tests
- Does distill surface contradictions without being annoying?
- Does it understand CONTEXT-DEPENDENT truths? (interface = new service, concrete = spike)
- Does it help regardless of the answer? (not a blocker, just a check)
- Tone: can it surface the contradiction in HER voice (casual, brief, emoji-ok)?
