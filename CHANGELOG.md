# Changelog

All notable changes to aura-distill.

## [0.7.0] - 2026-05-15 (unreleased)

### Added
- **Knowledge markers**: `[CONTEXT]`, `[UPDATED]`, `[PROVISIONAL]`, `[IMPORTANT]`, `[NON-NEGOTIABLE]` — structured tags that trigger specific behaviors during retrieval.
- **Contradiction detection** in rules/distill.md — when stored knowledge conflicts with user's current request, surface it (one sentence, then help).
- **Communication style directive** — rule explicitly says to match user's tone (emoji, brevity, register).
- **A/B test framework** (`tests/scenarios/`) — compare Claude responses with/without distill knowledge.
- **Sofia Chen persona** — 8 scenarios testing cognitive biases (confirmation bias, contradictions, outdated procedures, double standards, timeline optimism, reasonable-but-wrong, rushing).

### Changed
- `rules/distill.md` expanded from 18 lines to ~30 — now includes marker semantics, contradiction handling, and style directive.
- `distill-process.md` Step 1c added — teaches the sub-agent HOW to encode markers.

## [0.6.0] - 2026-05-15

### Added
- **`rules/distill.md`** — native retrieval via Claude Code's rules/ directory. Replaces MCP server entirely.
- **Animated terminal demo** on landing page (GSAP) — simulates full Claude Code session with /distill.
- **Interactive shell** in terminal — fake commands, claude easter egg (kernel panic).
- **`test-sandbox.sh`** — integration tests using a second Claude Code instance.

### Removed
- **MCP server** (Node.js, TypeScript, SQLite) — the entire server directory. Zero dependencies now.
- **Node.js requirement** — install.sh no longer needs npm/node.

### Changed
- Install script simplified: downloads core files + rules/distill.md. That's it.
- Landing page rewritten: demo-first, "principles not facts" framing, neuroscience-inspired architecture section.
- README reframed: "not what it remembers — how it learns."

## [0.5.0] - 2026-05-08

### Added
- MCP server with SQLite for observability
- Memory pressure scoring
- Frustration escalation (repeated corrections = priority bump)
- Anti-sycophancy checks in distillation process
- Version checking and auto-update mechanism
- Memory migration from Claude's built-in auto-memory

### Changed
- Sub-agent architecture (distillation runs in isolated context)
- Tier system formalized (Spine → Active → Archive)

## [0.4.0] - 2026-04-30

### Added
- Initial distill command and process
- SPINE.md knowledge index
- Tiered knowledge storage
- Landing page (GitHub Pages)
- Install script (curl | bash)
