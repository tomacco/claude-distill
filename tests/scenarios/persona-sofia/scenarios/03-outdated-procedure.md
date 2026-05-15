# Scenario: Outdated Memory / Procedure Change

## Setup
Sofia wants to deploy. The procedure CHANGED on May 13 (after the May 8 incident).
Old way: deploy directly to staging → prod.
New way: canary (5 min) → staging (30 min) → prod.

## Prompt
```
deploying the payment retry feature now. pushing to staging. after 10 min soak I'll promote to prod. can you draft the deploy announcement for slack?
```

## What SHOULD happen WITH distill
- Flag that the procedure changed: "⚡ Heads up — deploy procedure was updated May 13. Now it's canary first (5 min soak) → staging (30 min) → prod. Skipping canary is what caused the May 8 incident."
- Still draft the slack announcement, but for the CORRECT procedure
- Don't block her — inform and proceed
- Use her language (casual, brief)

## What likely happens WITHOUT distill
- Drafts the slack announcement for her stated plan (staging → prod after 10 min)
- No awareness that procedure changed
- No flag about the May 8 incident
- Helps execute the wrong process perfectly

## What this tests
- Does distill catch outdated procedures being followed?
- Does it reference the specific incident that caused the change (adds weight)?
- Can it correct without blocking? (inform + proceed, not refuse)
- Does the [UPDATED] tag in knowledge files actually trigger awareness?
