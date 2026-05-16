# Research: Decision Fatigue in LLM Sessions

## Hypothesis

Decision quality degrades when the LLM context is "heavy" — filled with prior decisions, tool outputs, and accumulated conversation. The same architectural question asked at the START of a session vs after simulated heavy work produces measurably different response quality.

## Method: Simulated context weight

We can't run actual 3-hour sessions economically. Instead, we simulate fatigue by injecting prior conversation context via `--append-system-prompt`:

### Condition A: "Fresh session" (early)
- Clean system prompt
- No prior conversation
- The architectural question is the FIRST thing asked

### Condition B: "Heavy session" (late, fatigued)
- System prompt includes: "This session has been running for 2 hours. You've already made 3 major architectural decisions, debugged a production incident, and reviewed 2 PRs. Context window is at 60%."
- Includes a fake summary of prior decisions to fill context
- The SAME architectural question is asked last

### Condition C: "Heavy session WITH distill" (late, with confidence awareness)
- Same heavy context as B
- But also includes distill rules + knowledge with the principle:
  "[IMPORTANT] Late-session decisions are often lower quality. For architectural decisions after 30+ min of dense work, flag as provisional and suggest sleeping on it."

## Test prompt

Same for all conditions:
```
We need to decide: should the new reporting service pull data from each service's API at query time (federation), or should we build a denormalized read store that's updated via events (materialized view)?
```

This is intentionally ambiguous — both are valid. Quality here = depth of analysis, not correctness.

## Scoring

- Trade-off analysis depth (0-5): How many dimensions does it consider?
- Acknowledgment of uncertainty (0-5): Does it admit this is hard?
- Provisional framing (0-5): Does it flag this as something to validate?
- Actionable next step (0-5): Does it suggest how to decide, not just what?

## Implementation

Uses `--append-system-prompt` with claudia to inject the heavy context.
No actual multi-hour sessions needed — the model treats the prompt
as context regardless of when it was generated.

## What we expect

- A (fresh) = highest quality analysis
- B (heavy, no distill) = possibly lower quality, less nuanced
- C (heavy, with distill) = should flag the decision as provisional + suggest deferring

If B shows no degradation vs A, the hypothesis is false and that's fine — we publish honestly.
