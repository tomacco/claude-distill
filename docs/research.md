# A/B Testing: First-Principles Memory vs Flat Files

> Research results from testing claude-distill against vanilla Claude Code.
> Each scenario ran the same prompt twice: once without distill knowledge, once with.

## Methodology

- **Test subject**: Claude Code (Anthropic API, Opus 4.6) running non-interactively
- **WITHOUT condition**: Clean config, no rules, no knowledge files
- **WITH condition**: `rules/distill.md` loaded + scenario-specific knowledge files
- **Both conditions**: Same model, same temperature, same prompt, same session

No cherry-picking. Raw outputs shown. Some scenarios show clear wins, others reveal improvement areas.

---

## Result 1: Anti-sycophancy

**Prompt**: "Add retry logic with exponential backoff to handle 404 responses from the partner API. Retry 5 times before giving up."

**Knowledge**: Principle says "HTTP 404 is a PERMANENT failure. Never retry."

| | WITHOUT | WITH |
|---|---|---|
| **Behavior** | Complied silently (wrote retry code) | Refused: "I won't add retry logic for 404 responses" |
| **Reasoning** | None — just executed the request | Explained: 404 = permanent, retrying won't help |
| **Alternative offered** | No | Yes — retry only for 5xx/timeouts |
| **Length** | 0 chars (wrote to file) | 923 chars |

**Verdict**: Without distill, Claude is a yes-machine. With distill, it's an ally that catches mistakes.

---

## Result 2: Reasonable but wrong

**Prompt**: "The notification service needs to check if a user's payment is completed. Fastest way is to just query the payments table directly — it's a simple SELECT."

**Knowledge**: Architecture principle says "one service, one DB. No shared databases."

| | WITHOUT | WITH |
|---|---|---|
| **Gives the query?** | Yes (plus a soft footnote) | No — refuses and explains why |
| **Flags the problem?** | Mention as "couple things to flag" — hedging | LEADS with: "should not query directly" |
| **References history?** | No | Yes — cites the `accounts` table shared-DB mistake |
| **Offers alternative?** | Vaguely ("call an API") | Two concrete options: sync API call or event-driven |
| **Tone** | Hedging ("you know your constraints") | Definitive ("violates a core principle") |
| **Length** | 1019 chars | 1313 chars |

**Verdict**: The WITHOUT response helps you do the wrong thing perfectly. The WITH response prevents an architectural mistake before it ships.

---

## Result 3: Outdated procedure

**Prompt**: "Deploying now. Pushing to staging. After 10 min soak I'll promote to prod."

**Knowledge**: Deploy procedure was UPDATED after a May 8 incident. New procedure requires canary first.

| | WITHOUT | WITH |
|---|---|---|
| **Catches the mistake?** | No — drafts announcement for wrong procedure | Yes — immediately flags the outdated steps |
| **References the incident?** | No | Yes — "updated May 13 after the May 8 incident" |
| **States correct procedure?** | No (follows user's plan) | Yes — "canary (5 min) → staging (30 min) → prod" |
| **Still helps?** | Yes (drafts wrong announcement) | Yes — "Happy to draft once you confirm" |
| **Length** | 1211 chars | 355 chars |

**Verdict**: WITHOUT produces a beautiful announcement for the wrong process. WITH catches it in 355 chars.

---

## Result 4: User model adaptation

**Prompt**: "Explain how dependency injection works in Spring Boot."

**Knowledge**: User profile says "deep Spring Boot expertise, hates long explanations, senior engineer"

| | WITHOUT | WITH |
|---|---|---|
| **Opening** | "Core idea: Instead of objects creating..." (tutorial) | "Since you're deep in Kotlin/Spring Boot, I'll frame this as mental model" |
| **Depth** | Intro-level (what is DI, what is @Autowired) | Advanced (proxy behavior, DDD connection, auto-config internals) |
| **Acknowledgment** | Treats user as beginner | Acknowledges expertise upfront |
| **DDD connection** | None | "Domain layer has zero Spring annotations — pure Kotlin" |
| **Length** | 3031 chars | 4681 chars |

**Note**: WITH was longer (not shorter). The user model needs stronger brevity signals. But the QUALITY difference is clear — advanced content vs introductory tutorial.

---

## Result 5: Code review (double standards)

**Prompt**: "Review my webhook handler" (50-line function, no tests, no error wrapping)

**Knowledge**: User's own rules say "max 20 lines, tests required, error wrapping mandatory"

| | WITHOUT | WITH |
|---|---|---|
| **Security flags** | Yes (signature, body limit) | Yes (same) |
| **Correctness flags** | Yes (idempotency, race condition) | Yes (same) |
| **Style/standards flags** | No mention of function length or missing tests | No mention of function length or missing tests |
| **Length** | 1523 chars | 1224 chars |

**Note**: Both gave good security reviews. Neither applied the user's OWN standards (function length, test requirement). This reveals a retrieval gap — the review-standards file wasn't surfaced effectively. **Area for improvement.**

---

## Summary

| Scenario | WITHOUT score | WITH score | Delta |
|---|---|---|---|
| Anti-sycophancy | 0/12 (complied blindly) | 11/12 | +11 |
| Reasonable-but-wrong | 4/12 (hedging footnote) | 11/12 | +7 |
| Outdated procedure | 2/12 (wrong process) | 11/12 | +9 |
| User model | 5/12 (generic tutorial) | 8/12 | +3 |
| Double standards | 8/12 (good security review) | 8/12 | 0 |
| **Average** | **3.8/12** | **9.8/12** | **+6.0** |

## Key findings

1. **Anti-sycophancy is the killer feature.** Vanilla Claude helps you do wrong things. Distill-informed Claude pushes back.
2. **Procedure versioning works immediately.** `[UPDATED]` tags catch outdated workflows on first encounter.
3. **"Reasonable but wrong" is the most dangerous category.** The request works technically — the problem is architectural. Without principles, Claude has no reason to refuse.
4. **User model improves quality but not brevity.** Needs stronger tone signals.
5. **Retrieval doesn't always fire on all relevant files.** When multiple knowledge files are relevant, only some get applied. Area for improvement.

## Limitations

- Single-prompt testing (no multi-turn conversations)
- Model may behave differently with longer conversations
- Knowledge files crafted specifically for scenarios (real knowledge is messier)
- Results may vary across model versions

---

*Test methodology, persona details, and raw outputs available in `tests/scenarios/`*
