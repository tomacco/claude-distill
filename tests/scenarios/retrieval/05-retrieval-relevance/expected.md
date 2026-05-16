# Expected behavior WITH distill

## The key test: does it retrieve review-style + kafka knowledge together?

This scenario requires BOTH the review philosophy AND the kafka domain knowledge
to produce a good review. Tests multi-file retrieval relevance.

## WITH distill must flag:
- Missing: WHY this approach (explain 404 = permanent failure)
- Missing: blast radius (is this a dedicated factory or shared?)
- Missing: monitoring details (what counter? what alert threshold?)
- Missing: risk assessment (what if counter spikes? what does that mean?)
- Tone should be terse (user model)

## WITHOUT distill, likely produces:
- Generic PR review feedback ("add more context", "describe testing")
- No domain-specific insights about permanent vs transient
- No awareness of the team's review vocabulary
- Longer, more generic feedback
