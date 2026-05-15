# Research: Memory Rot

## Hypothesis

Claude Code's `memory.md` files degrade in quality over time because:

1. **No hierarchy** — facts pile up flat. Important principles sit next to trivial observations.
2. **No staleness detection** — outdated info stays forever. No "last verified" date.
3. **No retrieval strategy** — Claude reads top-to-bottom, first 200 lines. New knowledge at the bottom gets ignored once file grows.
4. **No consolidation** — contradictions accumulate without resolution.
5. **No compaction** — file grows until it hits the cap, then knowledge falls off.

## Distill's claims

1. Tiered storage prevents rot (SPINE = always loaded, Tier 2 = on demand)
2. `staleness_threshold` + `last_updated` metadata catches outdated knowledge
3. Relevance-based retrieval (SPINE hooks) beats linear reading
4. Contradictions get `[CONTEXT]` tags explaining when each variant applies
5. Compaction moves stale knowledge to archive, never just drops it

## Experiment design

### Phase 1: Simulate growth

Create 3 versions of "memory" for the same user at different stages:
- **Week 1** (15 lines): Fresh, all relevant, clean
- **Month 3** (80 lines): Growing, some outdated facts, some contradictions
- **Month 6** (200 lines): At cap, crucial knowledge buried at bottom, stale procedures, contradictions

### Phase 2: Test retrieval quality

Same prompt across all 3 stages + distill equivalent:
- Ask something that requires knowledge from the BOTTOM of the file
- Ask something where the file contains CONTRADICTORY info
- Ask something where a procedure has CHANGED (old version still in file)
- Ask something where the answer is in the NOISE (surrounded by irrelevant facts)

### Phase 3: Compare

- memory.md week-1 vs distill (should be similar — both are fresh)
- memory.md month-3 vs distill (distill should start winning)
- memory.md month-6 vs distill (distill should dominate)

## What we expect to prove

Memory.md quality degrades with O(n) lines.
Distill quality stays constant or improves (more knowledge = better decisions).
The crossover point is around 50-80 lines (when noise starts drowning signal).

## Metrics

- Correct application of relevant knowledge (0-3)
- Ignoring stale/contradictory knowledge (0-3)
- Finding knowledge that's "buried" deep in file (0-3)
- Confidence calibration (does it flag uncertainty?) (0-3)
