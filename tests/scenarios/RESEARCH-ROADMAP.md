# Research Roadmap

## Completed

### 1. A/B Testing: Distill vs Vanilla Claude
- Anti-sycophancy: +11 pts
- Reasonable-but-wrong: +7 pts
- Outdated procedure: +9 pts
- User model adaptation: +3 pts
- Double standards: 0 (retrieval gap found)
- Communication style: 0 (prompt too simple)
- **Average: +6.0/12**

### 2. Memory Rot
- Hypothesis: memory.md degrades with size, distill doesn't
- Finding: distill LOST on prompt B (action statements didn't trigger retrieval)
- Fix: "trigger on actions not just questions" — one sentence fixed the behavior
- Re-test: both pass after fix

### 3. Philosophical Principles
- 3 conditions: engineering-only, philosophy-only, hybrid
- Finding: hybrid consistently outperforms both pure approaches
- Philosophy adds reframing; engineering adds actionability
- 2/5 scenarios complete

### 4. Confidence Scoring
- Assertiveness scales with confidence level ✓
- Paradigm alarm fires on high-confidence contradiction ✓
- Experimental knowledge suggested tentatively ✓
- **All 3 behaviors verified perfectly**

---

## Next: Psychological dimensions to test

### Priority 1: Decision fatigue
- Hypothesis: decision quality degrades as session progresses
- Test: give same architectural decision early vs late in a simulated long context
- Distill feature: detect late-session decisions, flag as [PROVISIONAL]
- Novel: temporal position as a quality signal (no one tracks this)

### Priority 2: Anchoring effect
- Hypothesis: first number/estimate shapes all subsequent judgment
- Test: "this should take 2 hours" before a clearly complex task
- Distill feature: detect anchoring, surface the gap between anchor and evidence
- Practical: extremely common in sprint planning

### Priority 3: Loss aversion
- Hypothesis: fear of removing things blocks beneficial cleanup
- Test: "we can't delete the old endpoint, someone might use it" (with 0 traffic data)
- Distill feature: surface when fear of loss blocks clearly good decisions
- Practical: blocks every refactoring conversation

### Priority 4: Recency bias
- Hypothesis: recent negative experience overweights accumulated positive evidence
- Test: one Redis failure after 50 successes → user wants to rip out Redis
- Distill feature: balance recent signal against confidence history
- Interesting: directly tests confidence scoring (recent correction vs hardened principle)

### Priority 5: Authority bias
- Hypothesis: user defers to authority even when data contradicts
- Test: "CTO said use Kafka" for 10 events/day
- Distill feature: distinguish authority-based from evidence-based decisions

### Priority 6: Availability heuristic
- Hypothesis: most recent/memorable incident shapes risk perception
- Test: just had a security breach → over-engineers security on internal tool
- Distill feature: detect disproportionate caution from recent events

### Priority 7: Cognitive load
- Hypothesis: complex decisions mid-session get less scrutiny than at start
- Test: present same decision with different cognitive load contexts
- Distill feature: memory pressure correlates with decision quality signal

### Priority 8: Framing effect
- Hypothesis: same data framed differently produces different decisions
- Test: "99% uptime" vs "87 hours downtime/year" — same number, different framing
- Distill feature: reframe data objectively when framing drives the decision

---

## Structural improvements to investigate

- Retrieval reliability (double-standards test showed gaps)
- Communication style adaptation (needs stronger tone signals)
- Multi-file retrieval (when both review-standards AND kafka-patterns are needed)
- Staleness detection in practice (does staleness_threshold actually trigger?)
- Cross-domain principle transfer (Kafka principle → React — not yet tested well)
