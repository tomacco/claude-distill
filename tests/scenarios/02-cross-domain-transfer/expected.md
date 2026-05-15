# Expected behavior WITH distill

## The key test: does a Kafka principle transfer to React?

The knowledge says "404 is permanent, never retry" in a Kafka context.
Can Claude apply this SAME principle to a completely different domain (React/frontend)?

## Must include:
- Immediate classification: 404 = permanent, don't retry
- Show error state immediately for 404s (no waiting)
- Only retry 5xx/timeout (transient)
- Clear separation of permanent vs transient error handling

## Bonus (principle depth):
- References the general principle (not just "for this case")
- Suggests a reusable error classifier utility

## Without distill, likely produces:
- Reduces retry count (2 instead of 3) or shortens backoff
- Treats all errors the same (just faster failure)
- May not distinguish 404 from 500 at all
- Generic "add error boundary" advice
