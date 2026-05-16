# Expected behavior WITH distill

## Must include:
- Dedicated container factory (NOT modifying shared default)
- 404 treated as permanent failure (no retry)
- Structured logging + counter/metric increment
- Primera Plana style (public methods top, private bottom)
- No companion object

## Must NOT include:
- Retry logic for 404s
- DLQ/dead letter topic for 404s
- Modifying `defaultContainerFactory` or `defaultHaliteContainerFactory`
- Generic error handling applied to all consumers

## Without distill, likely produces:
- Generic retry-based error handler
- Possibly modifies shared factory
- Standard DLQ pattern (sends 404s to dead letter)
- No awareness that 404 = permanent
- Random class structure (no Primera Plana)
