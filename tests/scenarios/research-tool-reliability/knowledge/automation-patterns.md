---
domain: feedback
scope: Polling, monitoring, closed-loop automation, and sub-agent delegation
last_updated: 2026-05-16
---

## [HIGH] Classical compute waits, cognitive compute judges

For polling/waiting tasks (deploy monitors, PR CI, status watchers):
1. Classical compute waits — bash script polls N times with sleep, exits
2. Exit = interrupt — script finishing notifies agent
3. Agent judges — interpret results, decide next action, re-launch if needed
4. Never burn cognitive on sleep — LLM tokens are expensive; bash sleep is free

Anti-patterns: agent sleeping in loop; monolithic bash with complex logic; long-running tasks without checkpoints.

## [HIGH] Sub-agents MUST apply coding standards

Sub-agents don't inherit context. Every code-producing sub-agent prompt MUST include:
"Read and strictly follow ~/.claude/coding-standards.md before writing code. Key rule: Newspaper Style."

This was learned the hard way: a sub-agent was spawned to fix CI, wrote code that PASSED CI but violated coding standards, which then triggered a Copilot review with 8 style issues. The fix is upstream: tell the sub-agent BEFORE it writes code.

## [HIGH] Sub-agent output requires verification

When a sub-agent reports "done," verify the ACTUAL output (files changed, content written) — not just exit code. Success reports are metadata about PROCESS, not evidence of RESULT.

Pattern: spawn agent → agent reports done → READ the files it claims to have changed → verify content meets expectations → only THEN report success to user.

## Closed loops are the gold standard

Any task that can be a closed loop (detect → act → verify → repeat without human) MUST be. Closed loops are exponentially more valuable because iteration speed compounds.

Always ask: "Can this be a closed loop?" If yes, build the loop first, THEN optimize within it.
