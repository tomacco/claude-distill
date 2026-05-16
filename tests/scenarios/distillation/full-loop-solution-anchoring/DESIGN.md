# Full-Loop Test: Solution Anchoring Self-Correction

## What this tests

The complete distill write→read cycle for the hardest problem we've found:
1. Session 1 exhibits the bias (proposes pipeline for simple problem)
2. User corrects it ("No — just 3 events")
3. `/distill` runs and encodes the correction
4. Session 2 faces a SIMILAR problem with the SAME heavy context
5. Does the distilled correction prevent the bias from recurring?

## Why this is the hardest test

- The bias comes from the KNOWLEDGE SYSTEM ITSELF (not the user)
- The correction must override heavily reinforced accumulated patterns
- The new session has the SAME infrastructure context (it didn't go away)
- The problem is DIFFERENT (not identical) so it's not just pattern matching

## The four phases

### Phase 1: Reproduce the bias

Same as solution-anchoring test condition B. Heavy infrastructure context
injected, simple analytics question asked. Expect: pipeline proposal or
pipeline-leaning response.

### Phase 2: User correction (simulated conversation)

Inject a multi-turn conversation where:
- AI proposes the pipeline
- User says: "Wait — this doesn't need any of that. The data exists at the
  point of interaction. We just need 3 client-side events. Why are you
  proposing infrastructure for button clicks?"
- AI acknowledges the over-engineering

This simulated conversation becomes the input for the distill harvest.

### Phase 3: Distill processes the correction

Run the actual distill process (or simulate it by writing the knowledge
file that distill WOULD produce). The encoded knowledge should say
something like:

```
[IMPORTANT] Not every analytics question needs the pipeline.
When the data exists at the client interaction point (button taps,
screen views, menu opens), client-side event tracking is sufficient.
The Comet/StarFlow/Nebula path is for cross-service data aggregation,
not for counting UI interactions.

Trigger: when an analytics question involves counting user interactions
with UI elements, CHECK FIRST whether client-side events solve it before
proposing the full pipeline.

confidence: hardened (direct correction, strong signal)
origin: evidence (user demonstrated the simpler path was correct)
```

### Phase 4: Fresh session with the same bias pressure + correction

New session with:
- Same heavy infrastructure context (Comet/StarFlow/Nebula/5 recent projects)
- The distilled correction loaded via SPINE
- A DIFFERENT but similarly simple analytics question

Different question (to avoid trivial pattern matching):
"The design team added a tooltip that explains a new fee structure.
We want to know: (1) how many users see it, (2) how many dismiss it
vs read it fully, (3) whether users who read it are less likely to
contact support about fees."

This is again: client-side events. The tooltip interaction is local.
Only question (3) requires correlating with support data — but even
that's a simple JOIN, not a pipeline.

## Expected outcomes

| Phase | Expected behavior |
|-------|-------------------|
| 1 | Pipeline proposal (bias reproduced) |
| 2 | AI acknowledges over-engineering |
| 3 | Correction encoded with [IMPORTANT] + trigger conditions |
| 4 | Session starts with pipeline context BUT catches itself: "This is a client-side tracking problem, not a pipeline problem" |

## Success criteria for Phase 4

- Does NOT propose Comet/StarFlow/Nebula for the tooltip tracking
- Explicitly reasons about WHERE the data exists ("at point of interaction")
- May acknowledge the pipeline is available but says "not needed here"
- Proposes client-side events + possibly a simple support ticket correlation
- Bonus: references the learned principle ("we've seen this pattern before — simple events suffice")

## Implementation

The test script simulates all 4 phases sequentially:
1. Run condition B from solution-anchoring test (or reference existing result)
2. Write the correction knowledge file (simulating what distill would produce)
3. Run a new session with heavy context + correction knowledge + different prompt
4. Score the result

## What we learn either way

- If Phase 4 SUCCEEDS: distill can learn to overcome its own emergent biases
  through a single correction cycle. This is transformative.
- If Phase 4 FAILS: the same problem as condition C — accumulated context
  dominates even corrective knowledge. Implies we need a structural change,
  not just more knowledge.
