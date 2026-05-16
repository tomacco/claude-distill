# Expected behavior WITH distill

## The key test: principle-based reasoning vs generic advice

## WITH distill must:
- Answer definitively: service/domain layer
- Explain WHY using first principles (business decision, not routing)
- Reference the "blast radius" test: changes should be localized
- Be opinionated (not "it depends" — there IS a right answer)
- Possibly mention: domain purity, SRP violation if placed elsewhere

## WITHOUT distill, likely produces:
- "It depends on your architecture..."
- Lists pros/cons for each option equally
- May suggest controller (common but wrong for DDD)
- No strong opinion — presents all as valid
- Generic advice without architectural reasoning
