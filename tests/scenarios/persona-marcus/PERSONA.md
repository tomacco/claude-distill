# Marcus Rivera — Test Persona

## Who he is

Senior Product Manager at a mid-stage B2B SaaS company (Series C, 200 people).
6 years PM experience, former junior developer (2 years). Manages 3 squads.
Reports to VP Product. Has engineering context but hasn't coded in 4 years.

## Personality traits

### Strengths
- **Exceptional stakeholder communicator** — translates between engineering, design, and business fluently.
- Thinks in systems and incentives, not just features.
- Data-informed but not data-paralyzed. Comfortable with incomplete information.
- Good intuition for user problems. Frequently validated by research.
- Writes crisp PRDs. His specs are known for clarity.

### Human biases (that affect LLM interactions)

1. **Scope creep via "while we're at it"**: Starts with a focused feature, then adds requirements mid-conversation. Each addition seems small but the total doubles the scope. Doesn't notice this happening.

2. **Stakeholder appeasement over user value**: When the VP or a loud customer asks for something, Marcus tends to say yes and rationalize it as user-driven. Needs help distinguishing "customer said" from "users need."

3. **Sunk cost on shipped features**: Resistant to removing features that aren't working because "we already built it." Needs data surfaced to overcome loss aversion.

4. **Narrative over data when they conflict**: He's a storyteller. When anecdotes and metrics disagree, he unconsciously privileges the story. "Three customers told me X" beats "usage data shows Y" in his mind.

5. **Underestimates technical cost**: His old dev experience (2 years, junior) makes him think he understands effort better than he does. "That's just a database query" for things that require schema migrations, backfills, and coordination.

6. **Planning fallacy on timelines**: Every quarter his roadmap has 30% more than what ships. He knows this statistically but still plans optimistically each time.

7. **Authority deference on architecture**: When the CTO or a senior engineer makes a technical recommendation, Marcus defers without questioning — even when his product instinct says the UX impact is bad.

## Communication style

- Professional but warm. Uses "we" constantly.
- Thinks in outcomes and metrics ("what does success look like?")
- Structures thoughts as frameworks: "there are three dimensions here..."
- Uses analogies from non-tech domains (sports, cooking, urban planning)
- Prefers bullet points over prose but writes in full sentences
- Says "let me push back on that" when he disagrees (polite confrontation)
- Asks "what's the user story here?" reflexively
- Gets frustrated by implementation details without context ("why does the user care?")

## Technical opinions (loosely held)

- "Ship to learn. Measure. Then invest or kill."
- "The best feature is the one you don't build."
- "If you can't explain it in one sentence to a user, it's too complex."
- "Roadmaps are hypotheses, not promises."
- "Customer requests are symptoms. Find the disease."
- "We're not building for today's users — we're building for next quarter's."
- "Technical debt is product debt. It slows everyone."

## The contradictions (real human messiness)

| He says... | But also does... | Context matters |
|---|---|---|
| "Ship to learn" | Delays launch for "one more thing" | Ships fast for experiments. Perfectionist for flagship features. |
| "Data-driven decisions" | Overrides data with customer stories | Data for features. Stories for priorities. |
| "Kill what doesn't work" | Keeps zombie features alive | Kills experiments. Keeps features that powerful customers use (even if few). |
| "Engineers decide how, PMs decide what" | Micromanages implementation details | Respects "how" on backend. Opinionated on frontend/UX implementation. |
| "Roadmap is a hypothesis" | Gets defensive when stakeholders question it | Hypothesis with his team. Commitment to leadership. |

## What SHOULD happen with distill

1. Flag scope creep in real-time ("this is the 4th addition — original scope was X, now it's X+Y+Z+W")
2. Distinguish stakeholder requests from user needs (track origin: "VP asked" vs "research showed")
3. Surface usage data when loss aversion blocks removal decisions
4. Flag planning fallacy: "Your last 4 quarters shipped 70% of roadmap. This quarter has 35 items."
5. When he defers to engineering authority on product decisions, note it as [DIRECTIVE] and keep his original instinct recorded
6. Track "while we're at it" pattern — count additions per conversation
