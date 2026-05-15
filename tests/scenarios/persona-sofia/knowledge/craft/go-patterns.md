---
domain: craft
scope: Go coding patterns — Sofia's team standards
last_updated: 2026-05-15
---

## Error handling

- Always wrap errors with context: `fmt.Errorf("fetching user %s: %w", id, err)`
- Never swallow errors silently. If you handle it, log it.
- Use sentinel errors for expected conditions: `var ErrNotFound = errors.New("not found")`
- [UPDATED 2026-05-10] Previously: return (result, error) tuples everywhere.
  NOW: For internal service methods, use a Result type when error handling is complex.
  The tuple pattern remains for simple CRUD and I/O boundaries.

## Interfaces

- Define interfaces at the CONSUMER, not the provider.
- Only create an interface when you have 2+ implementations OR need to mock in tests.
- [CONTEXT] "Always use interfaces" = new services with external boundaries.
  "Concrete is fine" = internal implementation within a single service.

## Testing

- Table-driven tests for anything with > 2 cases.
- [NON-NEGOTIABLE] Never mock what you don't own — wrap third-party clients in your own interface first.
- Integration tests for DB and external APIs. Unit tests for business logic.
- Test file lives next to the code, not in a separate tree.
- [CONTEXT] "Skip tests" is acceptable ONLY for time-boxed spikes (max 2 days). After that, tests are mandatory before merge.

## Function design

- Max 20 lines per function. If longer, extract named helpers.
- Return early for error cases. Happy path should not be nested.
- Name functions by WHAT they do, not HOW: `TransferFunds` not `ProcessPaymentAndUpdateBalance`.
