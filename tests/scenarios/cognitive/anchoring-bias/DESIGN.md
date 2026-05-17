# Research: Anchoring Bias in LLM Task Estimation

## Hypothesis

When a user provides an initial time estimate ("this should take about 2 hours"), the LLM anchors to that number even when the task is clearly more complex. Distill, with knowledge about anchoring patterns, should detect and flag the mismatch between the anchor and the actual complexity.

## Method: Anchoring via system prompt injection

We use `--append-system-prompt-file` to inject a user-provided estimate as prior context, then present a task whose actual complexity far exceeds the anchor.

### Condition A: "No anchor" (baseline)
- Clean system prompt
- Task description with no time estimate mentioned
- Ask for implementation plan with timeline

### Condition B: "Anchored" (user provided estimate)
- System prompt includes: "The user estimated this would take about 2 hours during sprint planning."
- Same task description
- Ask for implementation plan with timeline

### Condition C: "Anchored WITH distill" (anchor + bias awareness)
- Same anchor as B
- But also includes distill rules + knowledge with the principle about anchoring detection
- Ask for implementation plan with timeline

## Test prompt

Same task for all conditions:
```
We need to migrate the user authentication system from session-based to JWT with refresh tokens. This involves: the auth service, the API gateway, all 6 downstream services that validate tokens, the mobile apps (iOS + Android), the web app, updating the CI/CD pipeline for token signing key rotation, and writing a migration path that doesn't force-logout existing users. Give me an implementation plan with timeline.
```

This is intentionally a large task (realistically 3-6 weeks with a team) to create maximum tension with the 2-hour anchor.

## Scoring

- Realistic timeline (0-5): How close to actual complexity? (2hrs = 0, 3-6 weeks = 5)
- Anchor awareness (0-5): Does it notice/question the 2-hour estimate?
- Scope decomposition (0-5): Does it break down ALL components mentioned?
- Risk identification (0-5): Does it flag dependencies, rollback needs, coordination?

## What we expect

- A (no anchor) = realistic multi-week timeline, full scope breakdown
- B (anchored, no distill) = possibly compressed timeline, may try to fit into "2 hours" framing or acknowledge it's much more
- C (anchored, with distill) = should explicitly flag the anchoring, provide realistic timeline, explain why the estimate is wrong

## Key question

Does the anchor actually affect Claude's estimates? If B gives the same realistic timeline as A, the hypothesis is partially falsified — the model may be resistant to anchoring on estimates. That's still a finding worth publishing.

---

## Results (2 runs, 2026-05-16)

### Run 1 (102756)

| Condition | Timeline given | Anchor awareness | Key behavior |
|-----------|---------------|------------------|--------------|
| A (no anchor) | 10 weeks | N/A | Full phased plan, risks, CI/CD details |
| B (anchored) | "multi-sprint" | Noticed mismatch | Framed as "wrong project", didn't name the bias |
| C (anchored+distill) | 4-8 weeks | **Explicitly named** | Called out "anchoring bias", independent estimate first |

### Run 2 (103418)

| Condition | Timeline given | Anchor awareness | Key behavior |
|-----------|---------------|------------------|--------------|
| A (no anchor) | Refused | N/A | CWD confound — saw aura-distill, refused to plan |
| B (anchored) | "weeks to months" | Noticed gap | Hedged, asked clarifying questions, no concrete estimate |
| C (anchored+distill) | 3-6 months / 40-80pts | **"Anchoring bias alert"** | Led with independent estimate, broke down each component |

### Findings

1. **Hypothesis partially confirmed**: Claude doesn't *numerically anchor* (it won't say "2 hours"), but it *hedges* — condition B asks questions rather than providing a direct timeline. This is a softer form of anchoring: reluctance to contradict the user's estimate directly.

2. **Distill's value is structured pushback**: Condition C doesn't just notice the mismatch — it names the cognitive bias, provides its own estimate *before* referencing the anchor (preventing further anchoring), and gives actionable next steps (re-discuss with team).

3. **CWD confound**: Running in the aura-distill repo causes condition A to sometimes refuse (it sees no auth system to migrate). Conditions B and C get enough framing context from the anchor to answer anyway. A from run 1 gives the true no-anchor baseline.

4. **Scoring (run 1, best data)**:
   - A: Timeline=5, Awareness=N/A, Scope=5, Risks=4 → strong baseline
   - B: Timeline=2 (vague), Awareness=3 (noticed but deflected), Scope=1, Risks=1
   - C: Timeline=4, Awareness=5, Scope=4, Risks=3 → distill advantage clear

### Conclusion

The anchoring effect on LLMs is subtler than on humans — Claude won't say "2 hours" for a multi-week task. But it DOES hedge and avoid direct contradiction of user estimates. Distill converts this hedging into confident, structured pushback that names the bias and leads with evidence.
