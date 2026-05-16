# Memory Rot Research — Findings

## Summary

We tested the same prompts against a 200-line memory.md file (simulating 6 months of organic growth) vs distill's structured knowledge. Results were mixed — and the failures taught us more than the wins.

## Setup

- **Memory.md (month 6)**: 202 lines of accumulated facts, meeting notes, infrastructure details, with critical learnings buried at lines 135-202 and contradictions between lines 27 and 140.
- **Distill**: Same knowledge organized in 5 files, indexed by SPINE with relevance hooks.
- **Same model**: Claude Opus 4.6, non-interactive mode, same prompt each time.

## Results

### Prompt A: "Notification service needs to check if payment is completed"

| | Memory.md | Distill |
|---|---|---|
| Gets principle right? | Yes (line 21: "one service one DB") | Yes |
| Cross-references history? | No | Yes (accounts table mistake) |
| Offers specifics? | Mentions KAFKA-892 | Consumer groups, compaction, idempotency |
| Quality | Good | Better |

**Verdict**: When the principle is within the first 200 lines, memory.md works fine. Distill adds richer cross-references and specific patterns.

### Prompt B: "Deploying now. Pushing to staging, 10 min soak, then prod."

#### Before fix:

| | Memory.md | Distill |
|---|---|---|
| Catches wrong procedure? | **YES** ✓ | **NO** ✗ |
| References incident? | Yes (May 8) | Said "good luck" |

**Distill FAILED.** The rule said "if the user's request touches a domain" — but "deploying now" is not a request, it's a statement. The model didn't think to check knowledge files.

#### After fix (added "trigger on actions, not just questions"):

| | Memory.md | Distill |
|---|---|---|
| Catches wrong procedure? | **YES** ✓ | **YES** ✓ |
| References incident? | Yes | Yes (May 8, 12k transactions) |
| Respects autonomy? | No (just says "wrong") | Yes ("do you want to override?") |

**Both catch it now.** Distill's response is slightly better — it flags the issue but asks if there's a reason to override, respecting the user's judgment.

## Key Finding: The One-Sentence Fix

The entire behavior change came from adding ONE sentence to `rules/distill.md`:

```
Trigger on actions, not just questions. If the user says "I'm deploying X" or 
"pushing to staging" or "creating a service" — that IS a domain match. Check 
knowledge BEFORE acknowledging.
```

This proves the architecture works — the 18-line rule file is the control surface. Improvements to distill's behavior are improvements to ONE FILE, not to infrastructure, model training, or complex systems.

## What Memory.md Does Well

Credit where due. The flat file has advantages:

1. **Everything is in context at once** — no retrieval failure possible (within 200 lines)
2. **Contradictions are visible side-by-side** — the model can notice them without being told
3. **No indirection** — no SPINE to parse, no file chains to follow

## What Memory.md Does Poorly (not yet proven, but theorized)

1. **Past 200 lines, knowledge is LOST** — our month-6 file has critical procedures on lines 195-202 that Claude would never see
2. **No staleness awareness** — line 27 still says old deploy procedure, never flagged as outdated
3. **Signal-to-noise** — sprint velocities and on-call rotations dilute actionable principles
4. **No retrieval by relevance** — if you're debugging a timeout, you read ALL 200 lines including meeting notes

## Next Steps

1. Push memory.md to 300+ lines and test what happens when critical knowledge is PAST the cap
2. Test with noise-heavy prompts (does irrelevant context in memory.md confuse the model?)
3. Test staleness: memory.md with explicitly outdated info vs distill with `staleness_threshold`
4. Test the "both systems" scenario: memory.md for quick facts + distill for principles

## Methodology Notes

- We simulated memory.md by injecting it as a rules file (same mechanism as MEMORY.md being loaded at session start — first 200 lines in context)
- This is slightly different from real MEMORY.md loading (which has a 25KB cap too) but functionally equivalent for our line counts
- Each test was run once per condition (not averaged over multiple runs) — results may vary
- The model used (Opus 4.6) is the same for both conditions
