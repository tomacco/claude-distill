# Next Steps (from session 2026-05-16)

## Immediate (ready to do)

1. **Merge research/decision-fatigue** to main (results are clean, fix verified)
2. **Merge pressure tracking fix** — the rules/distill.md update that makes pressure ACTIVE
3. **Run remaining philosophical scenarios** (1, 3, 5) — framework is ready
4. **Run remaining Sofia scenarios** (01, 02, 05, 08) — all have prompts ready

## Research in progress

5. **Anchoring bias test** — same `--append-system-prompt-file` technique
   - Inject: "user estimated 2 hours" before a clearly complex task
   - Test: does distill flag the anchor vs vanilla just plans for 2 hours?

6. **Loss aversion test** — "we can't delete the old endpoint, someone might use it"
   - Knowledge: has data showing 0 traffic for 6 months
   - Test: does distill surface the data vs vanilla accepting the fear?

7. **Recency bias test** — one Redis failure after 50 successes
   - Tests confidence scoring directly: does hardened (50x) survive a single contradiction?

## Forged conversation testing (new technique — not yet implemented)

8. Use `--input-format stream-json` to pipe multi-turn conversations
   - Craft JSON with specific conversation flows
   - Forge LLM responses to test how distill handles bad prior context
   - Stress test: what if a prior response was wrong and user didn't catch it?

## Product improvements discovered

9. **Pressure tracking was broken** — fixed by making it ACTIVE in rules/distill.md
   - Old: "at session end, suggest /distill if 3+ signals"
   - New: "count after every message, mention at 5+, insist at 8+"
   - VERIFIED with claudia: it now counts and recommends

10. **The monitor file (distill-monitor.md) may be redundant** 
    - rules/distill.md now covers: retrieval, markers, confidence, pressure
    - Monitor file still has: MCP fallback instructions, knowledge ownership rules
    - Decision: keep for now, evaluate after more testing

## Publishing

11. **Decision fatigue page** for research site (results are ready)
12. **Cognitive biases hub page** (placeholder exists, needs content)
13. **Update research index** with decision fatigue as "complete"
14. **Update landing page results section** with confidence scoring + decision fatigue

## Structural concerns to investigate

15. Multi-file retrieval reliability (double-standards test showed gaps)
16. Staleness threshold — does it actually trigger in practice?
17. The VERSION auto-bump GitHub Action creates push race conditions (known, not fixed)
18. Sub-agent permission issues (distill agent sometimes can't write files)
