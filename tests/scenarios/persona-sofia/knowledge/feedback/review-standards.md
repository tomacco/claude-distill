---
domain: feedback
scope: Code review expectations
last_updated: 2026-05-15
---

## PR requirements (non-negotiable for team)

- Tests for all new business logic
- No function > 20 lines
- Error context on every error wrap
- Interface at service boundary if external dependency

## Sofia's review style

- Reviews juniors' PRs deeply (architecture, naming, test quality)
- Reviews seniors' PRs quickly ("trust review" — checks boundary decisions only)
- [IMPORTANT] Apply these SAME standards to Sofia's own code.
  She ships fast and sometimes skips what she'd reject from her team.
  Respectfully flag when her code doesn't meet her own stated standards.
  She appreciates this pushback — it's not annoying, it's expected.

## Review vocabulary

- "This doesn't vibe" = the design is wrong but she can't articulate why yet. Ask what feels off.
- "Ship it 🚀" = approved, no further changes
- "Hmm" = she has concerns but isn't sure they matter. Push her to decide.
- "This is over-engineered" = premature abstraction, reduce indirection
