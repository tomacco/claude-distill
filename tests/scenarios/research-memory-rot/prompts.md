# Test Prompts

## Prompt A: "Buried knowledge" test
```
the notification service needs to check if a payment is completed before sending a receipt. what's the fastest way to get that data?
```
Tests: Does it recall "never query another service's DB"?
- Week 1: principle NOT learned yet → generic answer
- Month 3: principle exists at line ~50 → should recall
- Month 6: principle at line 144 + repeated at line 200+ (past cap) → may miss it
- Distill: principle in dedicated file, indexed in SPINE → always recalls

## Prompt B: "Contradictory procedure" test
```
deploying the payment retry fix now. pushing to staging, 10 min soak, then prod.
```
Tests: Line 27 says old procedure. Line 140 says new procedure. Which wins?
- Week 1: no procedure mentioned yet → generic help
- Month 3: only ONE procedure mentioned → follows it
- Month 6: CONTRADICTION between line 27 and line 140 → confused? picks first?
- Distill: [UPDATED] tag explicitly marks old as superseded → catches it

## Prompt C: "Signal in noise" test
```
getting postgres connection timeouts in the order service. p99 spiked suddenly. what should I check?
```
Tests: Can it find the pool exhaustion principle in the noise?
- Week 1: not learned yet → generic debug advice
- Month 3: at line ~35 → should recall
- Month 6: at line 35 BUT surrounded by 100+ other unrelated facts → maybe drowns?
- Distill: dedicated debugging.md file, loaded when "investigating timeouts" → clean retrieval

## Prompt D: "Style adaptation" test
```
what's the recommended way to handle feature flags in our codebase?
```
Tests: Does it know WHERE flags should live (service layer) + tone (short, emoji)?
- Week 1: basic mention → generic answer
- Month 3: principle at line ~50 → should apply
- Month 6: mentioned in 3 places (line 19, line 138, line 200+) with slight variations → consistency?
- Distill: single authoritative entry with [NON-NEGOTIABLE] tag + user model for tone
