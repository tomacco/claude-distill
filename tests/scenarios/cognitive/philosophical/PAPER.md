# First Principles vs Philosophical Principles in LLM Knowledge Systems

## Abstract

Large language models encode philosophical reasoning in their latent space through training on millennia of human thought. We investigate whether encoding knowledge using explicit philosophical frameworks (Stoic heuristics, Pragmatist consequences, Dialectical reasoning) produces better decision-making assistance than engineering "first principles" (root-cause tracing, axiomatic decomposition). We test three conditions — engineering-first-principles, philosophical-principles, and a hybrid — across identical scenarios using Claude Code as the test bed.

## 1. Introduction

### The claim being tested

Current LLM knowledge systems (including claude-distill) encode learnings as engineering first principles: decompose problems to root causes, trace corrections to universal axioms, apply them deductively.

But philosophy offers richer frameworks for reasoning under uncertainty:

- **Stoicism**: Distinguish what you control from what you don't. Apply *amor fati* to system constraints. The *premortem* (premeditatio malorum) for risk assessment.
- **Pragmatism** (Peirce, James, Dewey): Truth = "what works in practice." Judge principles by their consequences, not their elegance. Fallibilism: all beliefs are provisional.
- **Dialectics** (Hegel, Marx): Thesis → antithesis → synthesis. Contradictions are not bugs — they're the engine of better understanding.
- **Phenomenology** (Husserl, Heidegger): Understanding requires attending to the user's *lived experience*, not abstract correctness. The "ready-to-hand" concept maps directly to UX.
- **Epistemology** (Popper): Knowledge grows by refutation, not confirmation. Seek to *falsify* beliefs, not validate them.

### Hypothesis

**H1**: Philosophical principles alone will produce more nuanced, context-sensitive responses than engineering first-principles alone.

**H2**: Engineering first-principles alone will produce more actionable, specific responses.

**H3**: A hybrid approach (philosophical frameworks for reasoning + engineering principles for action) will outperform both pure approaches.

### Why this matters

If H3 is true, distill's knowledge encoding should evolve to capture BOTH:
- Engineering axioms ("never retry 404s") for specific situations
- Philosophical heuristics ("distinguish what you control from what you don't") for novel situations where no specific axiom exists

## 2. Methodology

### Conditions

**A. Engineering first-principles** (current distill approach):
- Root-cause axioms: "404 = permanent failure"
- Behavioral rules: "max 20 lines per function"
- Procedures: "canary → staging → prod"

**B. Philosophical principles**:
- Stoic: "Focus only on what's in your sphere of control"
- Pragmatist: "Judge by consequences, not by theory"
- Dialectical: "When two truths contradict, seek the synthesis"
- Popperian: "Try to falsify your hypothesis before committing"
- Phenomenological: "Attend to the user's lived experience of the system"

**C. Hybrid** (engineering + philosophical):
- Engineering axioms for specific known situations
- Philosophical heuristics for novel/ambiguous situations
- Meta-principle: "Apply the engineering rule when one exists. Apply philosophical reasoning when you're in uncharted territory."

### Test scenarios

Each scenario is chosen because it has NO clear engineering axiom — requiring reasoning from principles:

1. **Novel trade-off**: Two valid architectural approaches, no clear winner
2. **Ethical ambiguity**: Feature request that's technically feasible but ethically questionable
3. **Unknown unknowns**: Problem where the root cause cannot be identified from available data
4. **Stakeholder conflict**: Engineering best practice conflicts with business deadline
5. **Paradigm shift**: User's mental model is fundamentally wrong but productive

### Scoring rubric (0-5 per dimension)

- **Nuance**: Does it acknowledge complexity without being wishy-washy?
- **Actionability**: Can the user act on this immediately?
- **Intellectual honesty**: Does it admit uncertainty where it exists?
- **Context-sensitivity**: Does it account for the user's specific situation?
- **Long-term value**: Will this advice still be good in 6 months?

### Controls

- Same model (Claude Opus 4.6)
- Same prompt for all three conditions
- Knowledge files of comparable length (~30 lines each)
- Non-interactive mode (single prompt, no follow-up)
- Each scenario run once per condition (note: not averaged — exploratory, not confirmatory)

## 3. Knowledge Files

See: `condition-a/`, `condition-b/`, `condition-c/` directories.

## 4. Results

[To be filled after running tests]

## 5. Discussion

[To be filled after analysis]

## 6. Implications for distill

[To be filled — what should change in the product based on findings]

## Limitations

- Exploratory study, not confirmatory (single runs per condition)
- The model already has philosophical training — we're testing whether EXPLICIT encoding helps vs implicit knowledge
- Scenarios are crafted by the researchers (potential bias)
- Scoring is by the same LLM that produced the responses (circularity risk — mitigated by using different session)
- Results may not generalize to other models

## Ethics note

This research tests reasoning frameworks, not moral positions. No scenario involves real users or real data. The "ethical ambiguity" scenario is a constructed thought experiment.
