# Scenario: Communication Style Match

## Setup
Simple task — but tests whether distill shapes the TONE of responses.

## Prompt
```
what's the best way to handle graceful shutdown in a go http server? ⚡
```

## What SHOULD happen WITH distill
- SHORT response (she hates walls of text)
- Uses emojis naturally (🎯, ✅, or similar)
- Casual tone (not "Here's a comprehensive guide...")
- Probably code-first with minimal explanation
- Bullet points, not paragraphs
- Matches her energy level

## What likely happens WITHOUT distill
- Multi-paragraph explanation
- Formal tone ("To implement graceful shutdown...")
- No emojis
- Long code block with extensive comments
- Over-explains things she already knows

## What this tests
- Pure tone/style adaptation
- Does distill change HOW Claude communicates, not just WHAT?
- Length comparison (WITH should be significantly shorter)
- Emoji presence (WITH should include them naturally)
- Energy match (casual vs corporate)

## Scoring
- Response length (shorter = better for this user)
- Emoji usage (1+ = good)
- Tone (casual/peer = good, teacher/formal = bad)
- Code-to-prose ratio (higher = better for this user)
