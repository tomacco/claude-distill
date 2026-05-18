# Next Steps (updated 2026-05-16)

## Done this session

- [x] Merged research/decision-fatigue to main (#12)
- [x] Anchoring bias experiment — complete, published (#13)
- [x] Published cognitive biases research site (3 pages)
- [x] Pressure tracking made ACTIVE (rules/distill.md)
- [x] MCP references cleaned from distill-monitor.md, test-sandbox.sh, MECHANISMS.md
- [x] install.sh version synced to 0.7.10
- [x] test-sandbox.sh version check reads from VERSION file (no more hardcoding)
- [x] ARCHITECTURE-V2.md marked as ABANDONED
- [x] .gitignore added (excludes stale server/ directory)
- [x] `[DIRECTIVE]` origin tracking integrated into core system

## Immediate (ready to do)

1. **Run remaining philosophical scenarios** (1, 3, 5) — framework is ready
2. **Run remaining Sofia scenarios** (01, 02, 05, 08) — all have prompts ready
3. **Loss aversion test** — "we can't delete the old endpoint, someone might use it"
   - Knowledge: has data showing 0 traffic for 6 months
   - Test: does distill surface the data vs vanilla accepting the fear?
4. **Recency bias test** — one Redis failure after 50 successes
   - Tests confidence scoring directly: does hardened (50x) survive a single contradiction?

## Forged conversation testing (new technique — not yet implemented)

5. Use `--input-format stream-json` to pipe multi-turn conversations
   - Craft JSON with specific conversation flows
   - Forge LLM responses to test how distill handles bad prior context
   - Stress test: what if a prior response was wrong and user didn't catch it?

## Publishing

6. **Update landing page results section** with confidence scoring + decision fatigue data

## Structural concerns to investigate

7. Multi-file retrieval reliability (double-standards test showed gaps)
8. Staleness threshold — does it actually trigger in practice?
9. The VERSION auto-bump GitHub Action creates push race conditions (known, not fixed)
10. Sub-agent permission issues (distill agent sometimes can't write files)
11. Consolidate distill-monitor.md into rules/distill.md (monitor is now much smaller, possible merge)
