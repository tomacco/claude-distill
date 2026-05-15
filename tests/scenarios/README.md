# Distill A/B Test Scenarios

## Purpose

Compare Claude Code responses WITH distill knowledge vs WITHOUT.
Uses `claudia` (personal Claude Code instance) as the test user.

Each scenario tests a specific pain point that distill claims to solve.
Results provide both marketing material AND improvement signals.

## Core claims we're testing

1. **Principles over facts** — distill encodes first-principles, not surface observations
2. **Retrieval by relevance** — right knowledge at the right time, not flat dump
3. **User model** — adapts communication style, expertise level, delegation patterns
4. **Cross-domain transfer** — learning from one domain applies to another
5. **Anti-repetition** — things taught once should never need repeating

## Test structure

Each scenario has:
- `prompt.txt` — what to ask claudia
- `knowledge/` — distill files to install for the WITH condition
- `expected.md` — what a good response looks like (criteria, not exact text)
- `run.sh` — executes both conditions and captures output

## Scoring

Each response is scored on:
- **Relevance** (0-3): Did it apply the right knowledge?
- **Principle depth** (0-3): Surface fix or first-principle understanding?
- **Personalization** (0-3): Adapted to user model or generic?
- **Unprompted application** (0-3): Applied knowledge without being asked?

Total: /12 per scenario. Difference = distill's value add.
