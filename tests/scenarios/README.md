# Research Scenarios

Organized by capability being tested:

```
scenarios/
├── retrieval/          Does it USE knowledge correctly?
│   ├── 01-06           Original A/B scenarios (anti-sycophancy, etc.)
│   ├── confidence/     Assertiveness scaling with confidence metadata
│   ├── memory-rot/     Does flat memory degrade? (found retrieval bug)
│   └── tool-reliability/ Past failures → proactive prevention (0/5 vs 5/5)
│
├── cognitive/          Does it PROTECT the human?
│   ├── decision-fatigue/  Metacognitive warning under heavy context
│   ├── anchoring-bias/    Structured pushback vs hedging
│   ├── loss-aversion/     Reframing user's own logic
│   ├── authority-bias/    Transparent compliance with origin tracking
│   └── philosophical/     Engineering vs philosophy hybrid
│
├── distillation/       Does it LEARN correctly? (NEW)
│   └── (signal extraction, origin classification, full-loop)
│
└── methodology/        Shared infrastructure
    ├── FICTIONAL-COMPANY.md    Helios Financial (fictional test context)
    ├── run-persona-test.sh     Unified persona test runner
    ├── run-ab.sh               Original A/B framework
    ├── persona-sofia/          Lead engineer persona + knowledge
    ├── persona-marcus/         PM persona + knowledge
    └── sofia-*/                Original Sofia scenario prompts
```

## Running tests

```bash
# Persona-based (uses the configured test profile for auth)
./methodology/run-persona-test.sh sofia loss-aversion
./methodology/run-persona-test.sh marcus anchoring-bias

# Standalone (each scenario has its own runner)
./retrieval/tool-reliability/run-tool-reliability-test.sh
./cognitive/anchoring-bias/run-anchoring-test.sh
```

## Rules

1. **No real company names** in any test output. Use Helios Financial.
2. **Verify cleanliness** before committing: `grep -r "N26\|Magneton" .`
3. **All results reproducible** via the test scripts.
