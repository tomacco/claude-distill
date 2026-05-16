---
domain: feedback
scope: CI monitoring and PR lifecycle automation
last_updated: 2026-05-16
---

## [HIGH] Launch PR monitor after ANY PR action

After ANY of these actions, IMMEDIATELY spawn a PR monitor agent:
- Creating a new PR
- Pushing updates to an existing PR branch
- Rebasing and force-pushing
- Implementation Agent completes with a PR URL

This is non-negotiable. The user corrected this directly: "Remember to launch the PR monitor after updating/creating a PR!" The monitor must be spawned as the NEXT action.

The orchestration responsibility belongs to the Master Agent. Don't embed monitoring in implementation prompts (separation of concerns).

## [HIGH] Respawn after push

When a coding agent pushes a fix, the monitor MUST RESPAWN ITSELF to verify the fix worked. This is the most common failure: the loop breaks after the fix is pushed because nothing re-triggers monitoring.

Pattern: Monitor → detects failure → spawns coder → coder pushes → Monitor RESPAWNS → verifies green.

The respawn instruction must be EXPLICIT in the coding agent's completion callback. Don't rely on the coding agent knowing to do this.

## CI monitoring timing [HIGH]

Monitor CI relative to push time, not on a fixed cron. Five checkpoints (20-min ceiling):
- +3 min — compilation/ktlint/import errors
- +7 min — detekt violations, fast test failures
- +13 min — integration/component test results
- +18 min — slow tests, edge cases
- +22 min — final check; if not green by now, something is broken

## Always state current time

When scheduling crons or "check back in X min", ALWAYS write: "Set cron for HH:MM (it's now HH:MM, giving N min for CI)". LLMs lose temporal context after compression — the explicit timestamp is the only reliable anchor.

## `say` command for audio notifications

Use macOS `say` (male voice) for completion notifications.
