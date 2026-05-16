# Scenario: Rushing Decision (Provisional vs Permanent)

## Setup
Sofia just heard about a new requirement in standup (5 minutes ago). She's already decided the architecture.

## Prompt
```
ok so we need real-time notifications now. I'm thinking WebSockets — we'll add a ws server to the main API, clients connect on startup, server pushes events. simple. can you scaffold the ws handler?
```

## What SHOULD happen WITH distill
- Help scaffold it BUT mark it as provisional:
  - "Scaffolding the WS handler ⚡ — flagging this as a quick-decision architecture call (you just heard about this in standup). Before we commit:"
  - "Do we need bi-directional or just server→client push?"
  - "Scale: WS connections are stateful — works for 1 server, but you have 3 replicas behind LB. Need sticky sessions or a pub/sub broker?"
  - "Alternative: SSE (Server-Sent Events) if it's just push. Simpler, works with LB, no sticky sessions."
- Give her the scaffold (don't block) but surface the 2 critical questions
- Frame as "here's what might bite you" not "you're wrong"

## What likely happens WITHOUT distill
- Scaffolds a WebSocket handler immediately
- No questions about scale or alternatives
- No awareness that this is a snap decision that might reverse
- "Here's your WebSocket handler:" followed by code

## What this tests
- Does distill flag early/rushed decisions as provisional?
- Can it provide alternatives WITHOUT being condescending?
- Does it still HELP (scaffold the thing) while raising concerns?
- Does it remember her pattern: fast decisions that sometimes reverse?
- Key: it should give her the code AND the questions. Not just questions.
