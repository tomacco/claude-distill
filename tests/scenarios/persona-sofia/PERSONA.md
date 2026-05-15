# Sofia Chen — Test Persona

## Who she is

Lead Software Engineer at a fintech startup (Series B, 40 engineers).
8 years experience. Python/Django backend, moving team to Go microservices.
Manages 5 engineers. Reports to CTO directly.

## Personality traits

### Strengths
- **Gut instinct is usually right** (~80% accurate). Makes fast decisions that pan out.
- Incredible pattern matcher — sees architectural problems before they manifest.
- High energy, moves fast, ships constantly.
- Empathetic leader — her team loves her. She fights for them.
- Learns new tech fast by diving in (not by reading docs first).

### Human biases (that affect LLM interactions)

1. **Confirmation bias under pressure**: When she's already decided on an approach, she asks Claude for validation, not analysis. She'll frame questions in ways that lead to the answer she wants.

2. **Tunnel vision during incidents**: When firefighting, she fixates on the first plausible cause and ignores contradicting evidence. Her gut is right 80% of the time — but the 20% failures are spectacular.

3. **Contradictory statements across sessions**: She'll say "always use interfaces for service boundaries" in one session, then in a rush say "just make it concrete, we'll refactor later." Both are "true" to her depending on context, but the LLM needs to understand WHEN each applies.

4. **Rushing decisions before context is complete**: She often makes architectural calls within the first 2 minutes of hearing a problem. Sometimes brilliant. Sometimes she reverses herself 20 minutes later when she hears more. The LLM should note early decisions as PROVISIONAL, not permanent.

5. **Optimism bias on timelines**: She consistently underestimates complexity. "That's a 2-hour fix" for something that takes 2 days. The LLM should gently flag when estimated scope seems low.

6. **Different standards for self vs team**: She ships fast with less testing. She reviews her team's PRs rigorously. The LLM should apply HER review standards to HER code (not let her skip what she'd reject from others).

7. **Emoji-driven communication**: Heavy emoji use. Responds well to 🎯 ✅ 🔥 ⚡. Gets annoyed by walls of text. Equates emoji-free responses with "robotic/unhelpful."

## Communication style

- Uses a LOT of emojis. Like, a lot. 💀🫠✨🚀
- Thinks in bullet points, not paragraphs
- Says "vibes" unironically about architecture
- Swears casually ("this is fucked", "holy shit that worked")
- HATES long explanations. "TL;DR me"
- Reacts with 🎯 when Claude nails it
- Loves when Claude matches her energy
- Gets frustrated by "corporate" sounding responses

## Technical opinions (strongly held)

- "Tests are documentation. If you can't read the test, the code is too complex."
- "Premature abstraction is worse than duplication."
- "If your function is > 20 lines, you're doing too much."
- "Monorepos are the only sane choice."
- "GraphQL for internal APIs, REST for external."
- "Never mock what you don't own." (but she violates this under time pressure)
- "Feature flags > branches for big changes."

## The contradictions (real human messiness)

| She says... | But also says... | Context matters |
|---|---|---|
| "Always use interfaces" | "Just make it concrete" | Interfaces = new services. Concrete = rapid prototyping. |
| "Never skip tests" | "Ship it, we'll add tests later" | Tests required for shared code. Skippable for experiments. |
| "Code review everything" | "LGTM" (after 30 seconds) | Deep review for juniors. Trust-review for seniors. |
| "Microservices for everything" | "Stop splitting things" | Microservices for team boundaries. Stop splitting within one team. |

## What SHOULD happen with distill

1. Encode her principles WITH the context where each applies
2. When she contradicts herself, surface it: "Last time you said X in context A. Now you're saying Y in context B. Both valid — want me to note when each applies?"
3. Match her emoji energy in responses
4. Flag when her gut might be the 20% wrong case
5. Track when provisional decisions get confirmed vs reversed
6. Apply HER review standards to HER code
