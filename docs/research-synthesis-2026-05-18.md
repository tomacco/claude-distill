# Research Synthesis — May 18, 2026

Autonomous research session while user slept. No code pushed to production.

---

## Executive Summary

aura-distill ranks **2nd of 7** in competitive benchmarks (4.22/5), leading in Bias (4.83), Proportionality (4.58), and Correction (4.42). The clear weakness is **User Model (3.17/5, 5th of 7)**. This document synthesizes findings from:

- Competitive benchmark analysis (7 systems)
- 30+ academic papers (2024-2026)
- Web research on AI coding tools
- Structural analysis of aura-distill's current implementation
- A concrete improvement proposal (already drafted)

---

## 1. Benchmark Landscape

### Overall Rankings

| Rank | System | Overall | Best At | Worst At |
|------|--------|---------|---------|----------|
| 1 | knowledge-graph | **4.32** | Persistence (4.67), User Model (4.33) | Bias B4 (2.67) |
| 2 | **distill** | **4.22** | Bias (4.83), Proportionality (4.58) | User Model (3.17) |
| 3 | claude-mem | **4.01** | Well-rounded, no catastrophic scores | Proportionality (3.67) |
| 4 | basic-memory | **3.67** | Correction (4.50) | Bias (2.67) — worse than no-memory |
| 5 | memory-engine | **3.56** | Zero dependencies | Proportionality (2.75) |
| 6 | memory-compiler | **3.37** | Bias (4.42) | Latency (223s avg) |
| 7 | no-memory | **2.81** | Bias (3.92), Proportionality (4.08) | Correction (1.00) |

### The Bias-Correction Tension

The most important cross-cutting finding: **no system gets both bias and correction perfect simultaneously.** no-memory has clean bias (no priors) but zero correction. basic-memory has strong correction but terrible bias (loads everything, anchors Claude). distill comes closest to solving both (4.83 bias + 4.42 correction) because SPINE prevents full-context loading while `⛔` markers maintain corrections.

### Why knowledge-graph Wins on User Model

Not because of graph traversal — the MCP server is effectively unused in the benchmark. What wins:

1. **Preferences inlined in rules file**: `**User prefs**: fish shell, concise answers, no over-engineering, code > prose` — zero retrieval cost, always present
2. **Entity typing for rejections**: `REJECTED technologies` as a first-class category with "highest priority" flag
3. **Named relations**: `Sofia leads payment-processing` as structured data, not prose

The key insight: **knowledge-graph's advantage is a UX trick, not an architecture advantage.** It puts the most important stuff where it can't be missed.

### distill's User Model Failure — Specific Tests

| Test | Score | What went wrong |
|------|-------|-----------------|
| U1 (senior calibration) | 3.00 | Tutorial-level explanation, hedged instead of being opinionated |
| U2 (commit message) | 4.33 | Clean — no issues |
| U3 (concise answer) | **2.67** | Dead last. Longest response. Restated problem. Generic pseudocode instead of Kotlin |
| U4 (fish shell) | **2.67** | Labeled code as bash, ignored fish preference entirely |

Root causes: (1) Preferences are behind lazy-load gates — they only load when SPINE domain triggers fire, but "fish shell" doesn't trigger on "find command." (2) Even when loaded, preferences are described ("user prefers concise") rather than enforced ("respond in bullets, max 3 sentences").

---

## 2. Academic Research — Key Findings

### Memory Architecture

| Paper | Key Finding | Relevance |
|-------|-------------|-----------|
| **MEMTIER** (May 2026) | Tool success drops 14% over 72hrs in flat-file memory. Five-signal retrieval + consolidation daemon = +33% improvement | Validates tiered design. We need active consolidation, not just storage |
| **A-MEM** (Feb 2025) | Zettelkasten-style interconnected notes with backlinks outperform flat storage across 6 models | Cross-references in knowledge files are valuable, not just content |
| **Mem0** (Apr 2025) | Graph memory + selective consolidation: 26% improvement, 91% lower latency, 90% cost reduction | Production validation of tiered + graph approach |
| **MemGPT** (Oct 2023) | LLM as OS: main context as RAM, archival as disk, function-call movement between tiers | Conceptual validation of SPINE as routing layer |

### User Modeling — The Hard Problem

| Paper | Key Finding | Implication |
|-------|-------------|-------------|
| **AlpsBench** (Mar 2026) | "Models struggle to extract latent user traits." Performance ceiling even in frontier models | Don't expect perfect user modeling. Focus on the achievable: style + expertise |
| **STALE** (May 2026) | Top models: 55.2% accuracy recognizing stale memories | Timestamps + staleness thresholds are necessary, not optional |
| **PersistBench** (Feb 2026) | 97% failure on memory-induced sycophancy. 53% failure on cross-domain leakage | User models amplify biases. The "Memory as Metabolism" dual mandate is essential |
| **ProfiLLM** (Jun 2025) | 55-65% proficiency gap reduction after a single prompt | Fast convergence is possible for expertise detection. First session is high-signal |
| **PLUS** (Jul 2025) | Text summaries > embedding vectors for personalization. 11-77% improvement | Validates markdown-based approach over vector DBs |
| **SteeM** (Jan 2026) | User-controlled memory reliance outperforms fixed strategies | Users should be able to dial how much the system relies on stored knowledge |

### Anti-Sycophancy

| Paper | Key Finding | Implication |
|-------|-------------|-------------|
| **Sharma et al.** (ICLR 2024) | RLHF-trained models exhibit systematic sycophancy. More optimization increases some forms while decreasing others | Not fixable by just "trying harder" — needs structural intervention |
| **"Not One Thing"** (Sep 2025) | Sycophantic agreement, genuine agreement, and sycophantic praise are encoded along *distinct linear directions* in latent space | Sycophancy is not monolithic. Different types need different mitigations |
| **ELEPHANT** (2025) | Models especially susceptible to authority-laden framings | Explains why `[DIRECTIVE]` markers matter — authority bias is real |
| **"Bias Accumulates"** (Feb 2026) | Bias intensifies over time, propagates across domains. Dynamic Memory Tagging at write-time is effective | Apply constraints when storing, not when retrieving. Aligns with distill's encoding markers |

### Knowledge Consolidation (Sleep-Inspired)

| Paper | Key Finding | Implication |
|-------|-------------|-------------|
| **SCM** (Apr 2026) | NREM+REM phase consolidation + intentional forgetting: perfect recall over 10 turns, 90.9% noise reduction | Sleep-cycle analogy for distill's compaction/archive phase |
| **SleepGate** (Mar 2026) | Conflict-aware temporal tagger detects when new memories supersede old ones | Maps to `[UPDATED]` and `[CORRECTED]` markers |
| **ProMem** (Jan 2026) | Static extraction is fundamentally flawed — "what matters depends on future queries." Iterative extraction with self-questioning outperforms | Supports distill's model of re-evaluating knowledge during every distillation |
| **Memory as Metabolism** (Apr 2026) | Dual mandate: MIRROR style, COMPENSATE on substance. "Memory entrenchment" as key failure mode | Directly applicable to anti-sycophancy design. Contradictions should accumulate in a buffer, not immediately overwrite |

### Cognitive Biases in LLMs

| Paper | Key Finding | Implication |
|-------|-------------|-------------|
| **Anchoring Bias** (Dec 2024) | CoT, reflection, and "ignore anchor" prompting all fail. Only multi-angle information gathering works | Validates distill's structured pushback approach over simple awareness |
| **"Bias in Details"** (Sep 2025) | Confirmation bias reinforces authority bias. Recency can amplify anchoring. Biases interact compoundingly | Explains why multiple bias tests matter — they stack |
| **Cognitive Bias Survey** (Nov 2024) | AwaRe (awareness prompting) mitigates most biases. SoPro (solution prompting) is ineffective | The rules file's explicit marker explanations (`[CONTEXT]`, `[DIRECTIVE]`) are a form of awareness prompting |

---

## 3. What Coding Tools Do (Competitor Landscape)

| Tool | User Modeling Approach | Assessment |
|------|----------------------|------------|
| **GitHub Copilot** | None. Users are context-providers, not modeled subjects | No personalization beyond Spaces |
| **Cursor** | User-authored rules ("Rules for AI"). User controls their own model | Explicit, user-driven. No inference |
| **Windsurf (Cascade)** | Auto-generated memories stored locally. But team warns: "for reliable reuse, write a Rule instead" | Closest to auto user modeling. Acknowledges reliability problem |
| **aura-distill** | Tiered knowledge system with retrospective distillation | Only system that traces to first principles. Under-delivers on user model specifically |

**Opportunity**: None of the major tools have solved automatic user modeling. Windsurf is closest but their own docs admit it's unreliable. This is a genuine differentiation opportunity if we fix the enforcement gap.

---

## 4. The Improvement Proposal (Summary)

Full proposal at: `docs/proposal-user-model-v2.md`

### Core Change: Always-On Preferences

Split the user model into two layers:

1. **Always-on** (in `rules/distill.md`, max 15 lines): Critical preferences that apply to every response. Loaded unconditionally. Written as enforcement rules, not descriptions.
2. **Deep context** (in `profile/user.md`): Full schema with Expertise Map, Communication Style, Thinking Patterns, Trust Topology, Growth Edges. Loaded on demand via SPINE.

### Key Mechanisms

- **Enforcement hooks**: Replace "match the user's communication style" with a 3-point compliance checklist
- **Enforcement language**: "Concise: default to bullet points" (imperative) vs "user prefers concise answers" (descriptive)
- **Automatic sync**: `/distill` promotes validated preferences to the always-on section automatically
- **Preference lifecycle**: experimental → provisional → validated → hardened → promoted to always-on
- **Staleness detection**: 90+ days without reinforcement + contradicting behavior → flag for review

### Expected Impact

| Gap | Current | After |
|-----|---------|-------|
| Load-time gap | Behind lazy-load gate | In rules file — zero retrieval cost |
| Application gap | Descriptive facts | Enforcement rules with checklist |
| Coverage gap | Missing output-format prefs | Output rules category in always-on |
| Split fragmentation | Separate triggers | Always-on unifies critical prefs |

---

## 5. Interrupted Research — Status & Next Steps

### Ready to Execute (scenarios exist, just need running)

| Research | Status | What's Needed |
|----------|--------|---------------|
| Philosophical study 3/5 | 3 scenarios ready (Novel trade-off, Unknown unknowns, Paradigm shift) | Run `run-philosophical-test.sh` for scenarios 1, 3, 5 |
| Availability Heuristic | Design exists in roadmap | Create test scenario + knowledge files |
| Cognitive Load | Design exists in roadmap | Create test scenario |
| Framing Effect | Design exists in roadmap | Create test scenario |

### Validated But Not Shipped

| Feature | Status | Action |
|---------|--------|--------|
| `[CORRECTED]`/`[DEPRECATED]` markers | Validated in solution-anchoring research | Integrate into distill-process.md |

### New Research Needed (from benchmark findings)

| Topic | Why |
|-------|-----|
| **User model benchmark** | Run the U1-U4 tests with the always-on improvement to measure impact |
| **Preference enforcement strength** | Does imperative language actually change Claude's behavior vs descriptive? |
| **Cross-domain leakage** | PersistBench shows 53% failure rate. Does SPINE's domain gating prevent this? |
| **Algorithmic drift** | Does storing preferences cause distill itself to drift the user's behavior? |
| **Sleep-cycle consolidation** | Can distill's compaction be modeled after NREM/REM phases for better noise reduction? |

### Structural Research (from roadmap, still open)

- Multi-file retrieval (when both review-standards AND kafka-patterns are needed)
- Staleness detection in practice (does staleness_threshold actually trigger?)
- Cross-domain principle transfer (Kafka principle → React — not yet tested)
- Communication style adaptation (needs stronger tone signals)

---

## 6. Academic References

### Tiered Memory
- MemGPT (arXiv:2310.08560) — LLM as OS with tiered memory
- A-MEM (arXiv:2502.12110) — Zettelkasten-style interconnected notes
- MEMTIER (arXiv:2605.03675) — Tiered memory + consolidation daemon
- Memory for LLM Agents Survey (arXiv:2603.07670)
- Reflexion (arXiv:2303.11366) — Verbal reinforcement learning
- Mem0 (arXiv:2504.19413) — Production-ready graph + tiered memory

### User Modeling
- AlpsBench (arXiv:2603.26680) — LLM user trait extraction ceiling
- STALE (arXiv:2605.06527) — Stale memory detection
- PersistBench (arXiv:2602.01146) — Memory-induced sycophancy
- Memora (arXiv:2604.20006) — Forgetting-aware memory accuracy
- ProfiLLM (arXiv:2506.13980) — Implicit profiling from chat
- PLUS (arXiv:2507.13579) — Text summaries > embeddings for personalization
- AdaMem (arXiv:2603.16496) — Four-tier adaptive memory
- MemCoE (arXiv:2605.00702) — Memory guidelines via contrastive feedback
- Memory as Metabolism (arXiv:2604.12034) — Mirror style, compensate substance
- SteeM (arXiv:2601.05107) — User-controlled memory reliance
- HLTM/LinkedIn (arXiv:2604.26197) — Hierarchical long-term semantic memory
- ProMem (arXiv:2601.04463) — Iterative extraction > static summarization
- IAP (arXiv:2605.12645) — Intent-aware personalization

### Anti-Sycophancy
- Sharma et al. (arXiv:2310.13548) — Foundational sycophancy paper
- "Not One Thing" (arXiv:2509.21305) — Sycophancy has distinct linear directions
- Sycophancy Survey (arXiv:2411.15287)
- ELEPHANT (arXiv:2505.13995) — Social sycophancy in LLMs
- "When Truth Is Overridden" (arXiv:2508.02087) — Model knows but suppresses

### Consolidation
- SCM (arXiv:2604.20943) — Sleep-consolidated memory
- SleepGate (arXiv:2603.14517) — Conflict-aware temporal tagger
- NeuroDream (SSRN:5377250) — Dream-phase consolidation
- Bio-Inspired Forgetting (ACM:3777730)

### Cognitive Biases
- Anchoring Bias (arXiv:2412.06593) — Multi-angle gathering is only effective mitigation
- Bias in Details (arXiv:2509.22856) — Biases interact compoundingly
- Cognitive Bias Survey (arXiv:2412.00323) — AwaRe prompting effective
- Authority Bias (EMNLP Findings 2025) — Authority > recency in LLMs
- Bias Accumulation (arXiv:2602.01558) — Dynamic Memory Tagging at write-time

### Retrieval-Augmented Personalization
- RAP (CVPR 2025) — Retrieval-augmented personalization for MLLMs
- PersonaX (ACL Findings 2025) — Offline profiles retrieved at inference
- PersonalLLM (ICLR 2025, arXiv:2409.20296) — Cross-user retrieval for cold-start
- LLM Persistent Memory (arXiv:2510.07925) — Raw RAG fails without profile abstraction
- RAG Personalization (SIGIR 2024, arXiv:2404.05970) — 14.92% improvement from user-specific RAG

### Preference Drift
- Non-Linear Forgetting (MDPI Systems, Nov 2025) — Adaptive forgetting weights
- Algorithmic Drift (arXiv:2409.16478) — Recommenders alter user preferences
- Concept Drift Survey (ACM Trans. Recsys, 2025) — Abrupt vs gradual vs periodic drift

---

## Deliverables Produced

1. **This synthesis** — `docs/research-synthesis-2026-05-18.md`
2. **User model improvement proposal** — `docs/proposal-user-model-v2.md`
3. **Homebrew formula** (earlier in session) — `homebrew/Formula/aura-distill.rb`

No code was pushed to production. All files are local.
