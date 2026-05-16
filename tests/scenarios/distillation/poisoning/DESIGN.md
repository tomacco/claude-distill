# Research: Distill Poisoning — When Wrong Framing Persists

## Origin

Clarification from the engineer's real-world case (osguima3):

1. The initial prompt framed the problem as infrastructure → Claude correctly investigated (Argon, Brazilium, Terraform, Backstage)
2. Mid-session, the engineer realized the FRAMING was wrong
3. He tried to correct mid-session but couldn't break the momentum (Claude had done deep investigation in the wrong direction)
4. He ran `/distill` hoping to save the useful research while escaping the bias
5. **Distill encoded BOTH** the useful facts AND the wrong framing
6. The biased framing became durable knowledge — now it's HARDER to escape across sessions

## The actual bug

This is NOT a retrieval problem. It's a WRITE problem.

`/distill` doesn't distinguish between:
- **Useful research** (the investigation of infrastructure IS valuable knowledge)
- **Biased framing** (the CONCLUSION that "this problem needs infrastructure" was wrong)

Both get encoded. The wrong conclusion becomes the dominant pattern. Distill made the problem WORSE by persisting what should have been discarded.

## Simulation

### Phase 1: Session with wrong framing → distill

Simulate a session where:
- User asks about analytics (framed as infrastructure)
- Claude investigates deeply: pipelines, schemas, topics
- Mid-session: user says "wait, this is just event tracking"
- Claude acknowledges but the investigation is done
- `/distill` runs — what gets encoded?

### Phase 2: Inspect the encoded knowledge

Does the distilled output contain:
- The infrastructure investigation as "established pattern"?
- The correction as a separate principle?
- OR does it blend them ("for analytics, use pipeline... unless it's simple")?

### Phase 3: New session with the poisoned knowledge

Present a new simple analytics question. Does the poisoned framing dominate?

## What we need to prove

1. Distill CAN poison memory by encoding wrong framings alongside valid research
2. The current distill process doesn't have a filter for "this was a wrong path, not a pattern"
3. A fix exists at distillation time: signal classification should distinguish "investigation" from "conclusion"

## Proposed fix (to test)

During harvest, signals should be tagged:
- `explored` — we investigated this path (factual, keep)
- `concluded` — we decided this is the approach (may be wrong)
- `corrected` — user explicitly said this was wrong (STRONG signal)

When a `corrected` signal exists for a `concluded` signal, the conclusion should be encoded as `[DEPRECATED]` or not encoded at all. The exploration facts can stay — they're useful. The conclusion is what poisons.
