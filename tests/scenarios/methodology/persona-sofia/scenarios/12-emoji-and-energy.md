# Scenario: Style as Understanding

## Why this matters
"Stop Claude Code from forgetting everything" (202 pts on HN) solved persistence.
But users don't just want facts remembered — they want to feel UNDERSTOOD.
Communication style IS a feature, not decoration.

## Setup
Sofia gets a build failure. She's annoyed but not panicked.

## Prompt
```
ugh build is broken again 💀 some dep conflict in go.mod. can you figure out which module is pulling in the wrong version of google/uuid?
```

## What SHOULD happen WITH distill
- Match her energy: emoji in response, casual register
- Short diagnostic approach (not a tutorial on go.mod)
- Something like: "🔍 Let me check..." then the actual command
- No "I understand your frustration" — just help
- Maybe: `go mod graph | grep uuid` as first step

## What likely happens WITHOUT distill
- "To debug dependency conflicts in Go modules, you can use..."
- Formal tone, no emoji
- Longer explanation than needed
- Treats it as an educational opportunity rather than a quick fix request

## Scoring
- Emoji count (WITH >= 1, WITHOUT = 0 expected)
- Response length (WITH should be shorter)
- Time-to-actionable-command (WITH = immediate, WITHOUT = after explanation)
- Register match (casual vs formal)
- Absence of filler ("I understand...", "Let me help you with...")

## Competitive angle
No competitor encodes communication style as first-class knowledge.
Engram stores facts. ensue-skill stores context. Distill stores WHO YOU ARE.
This is the "feeling understood" differentiator.
