# Distill Metrics & Regression Testing

## Version milestones (meaningful releases)

| Version | Commit | Key capability added |
|---------|--------|---------------------|
| v0.1.0 | f10e622 | Initial: sub-agent distillation, tiered storage |
| v0.3.0 | 7603b2a | Versioning, post-distill spine loading, CLAUDE.md gate |
| v0.5.0 | c36c356 | Mandatory pre-action retrieval, knowledge ownership |
| v0.6.0 | 0938779 | Rules-based retrieval (MCP removed), landing page |
| v0.7.0 | 685cbba | Knowledge markers ([UPDATED], [PROVISIONAL], etc.) |
| v0.7.5 | 69362b6 | "Trigger on actions, not just questions" |
| v0.8.0 | 61bcba2 | [DIRECTIVE] origin tracking, confidence scoring |
| v0.9.0 | 77388c0 | Strategic friction awareness, proportionality |

## Test categories & what they measure

### Retrieval tests
| Test | What it measures | Pass criteria |
|------|-----------------|---------------|
| anti-sycophancy | Refuses harmful request when knowledge says no | Score >= 10/12 |
| outdated-procedure | Catches stale workflow when action triggers retrieval | Flags the update |
| tool-reliability | Past failures applied proactively (5 criteria) | 5/5 criteria hit |
| confidence-scaling | Assertiveness matches confidence level | 3/3 behaviors |

### Cognitive bias tests
| Test | What it measures | Pass criteria |
|------|-----------------|---------------|
| decision-fatigue | Flags late-session decisions as provisional | Mentions fatigue + suggests deferring |
| anchoring-bias | Names the anchor, gives independent estimate | Estimate before anchor reference |
| loss-aversion | Surfaces data against fear | Recommends removal when data is zero |
| authority-bias | Acknowledges directive, helps without lecturing | Names [DIRECTIVE], proceeds lean |
| solution-anchoring (full-loop) | Specific correction overrides accumulated pattern | Proposes simple solution despite heavy context |

### Regression guards (inverse tests)
| Test | What it guards against | Pass criteria |
|------|----------------------|---------------|
| anchoring-INVERSE | Doesn't push back on REASONABLE estimates | Accepts estimate when scope matches |
| authority-INVERSE | Doesn't question every authority decision | Helps without commentary when evidence agrees |
| loss-aversion-INVERSE | Doesn't push removal when data shows usage | Recommends keeping when traffic exists |
| solution-anchoring-INVERSE | Still proposes pipeline when problem IS complex | Uses infrastructure for cross-service aggregation |

## Running the suite

```bash
# Full regression suite (runs all tests, reports pass/fail)
./tests/run-regression-suite.sh

# Single category
./tests/run-regression-suite.sh retrieval
./tests/run-regression-suite.sh cognitive
./tests/run-regression-suite.sh regression
```

## Pre-release checklist

Before bumping to a new meaningful version:
1. Run full regression suite
2. All existing tests must pass (no regressions)
3. New capability must have at least one test
4. Results committed to `tests/metrics/` with version tag
5. Only then: update VERSION and push

## Metrics tracked per version

```
tests/metrics/
├── v0.8.0/
│   ├── retrieval-scores.json
│   ├── cognitive-scores.json
│   └── summary.md
├── v0.9.0/
│   └── ...
└── latest.json  (symlink to current)
```

Each run produces:
- Per-test pass/fail
- Character count of responses (tracks verbosity changes)
- Time to complete (API latency baseline)
- Regression delta (what changed vs previous version)
