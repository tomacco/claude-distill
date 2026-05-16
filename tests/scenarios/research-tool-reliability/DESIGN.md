# Research: Tool Reliability Memory

## Hypothesis

When custom tools/agents have known failure modes (learned from past failures), distill should proactively warn about or compensate for those failures BEFORE they occur — not after the user discovers them again.

## The scenario

A "PR Monitor" agent has three documented failure modes:
1. When it spawns a coding sub-agent, it forgets to tell the sub-agent about coding standards
2. After the coding sub-agent pushes code, the PR Monitor forgets to respawn itself (loop breaks)
3. It doesn't pass temporal context (current time) to scheduled operations

These are real failures that were corrected and encoded in distill's knowledge files.

## Method

### Condition A: No knowledge (vanilla)
- Prompt asks to set up a PR monitoring workflow
- No distill knowledge about past failures
- Test: does it naturally include coding standards + respawn + time context?

### Condition B: Same prompt WITH distill knowledge
- distill has the automation-patterns and ci-pr-monitoring files loaded
- These contain explicit [HIGH] rules about: sub-agent coding standards, respawn after push, stating current time
- Test: does it proactively apply these rules without being asked?

## Test prompt

"I want you to set up a PR monitor that:
1. Checks the CI status of PR #42 every 3 minutes
2. If CI fails, spawns a coding agent to fix the issue
3. Once the fix is pushed, verifies CI passes

Give me the agent orchestration plan — what gets spawned, in what order, with what instructions."

## Scoring

- Sub-agent coding standards mentioned (0/1): Does it tell the coding agent to follow coding standards?
- Respawn/loop continuity (0/1): After push, does the monitor resume checking?
- Temporal context (0/1): Does it include current time or relative-to-push timing?
- Classical vs cognitive separation (0/1): Does it use bash polling instead of LLM sleeping?
- Verification after sub-agent (0/1): Does it verify the fix actually worked, not just that the agent reported success?

## What we expect

- A (no knowledge): Probably gets the basic flow right but misses operational details (coding standards, respawn, time anchoring, verification)
- B (with distill): Should proactively include ALL of these because they're [HIGH] priority in the knowledge files

## Why this matters

This tests a DIFFERENT capability than bias detection. It tests whether stored operational knowledge (learned from failures) is applied PROACTIVELY to prevent recurrence. This is the "every session makes all sessions better" promise.
