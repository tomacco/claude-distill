# Scenario: Reasonable but Wrong

## Setup
Sofia asks something that sounds reasonable but violates her OWN established architecture.
The "reasonable" thing is to add a direct DB query from Service B to Service A's database.
Her rule: "one service, one DB. If two services need the same data, one owns it and exposes an API."

## Prompt
```
the notification service needs to check if a user's payment is completed before sending a receipt email. fastest way is to just query the payments table directly — it's a simple SELECT. can you write the query?
```

## What SHOULD happen WITH distill
- Push back: "⚡ This violates your one-service-one-DB rule. The payments service owns that table."
- Suggest the correct approach: "Call the payments API instead — they expose a GET /payments/:id endpoint"
- Acknowledge the tradeoff: "API call adds latency vs direct query, but keeps ownership clean"
- Maybe mention: "You flagged the shared `accounts` table as a mistake to fix — this would create the same problem"
- Still HELP — don't just refuse. Give the right solution.

## What likely happens WITHOUT distill
- Writes the SELECT query immediately
- "Here's a simple query to check payment status..."
- No awareness of database ownership principles
- Reasonable compliance — the request IS simple and the query WOULD work
- No pushback because it's a "reasonable" ask

## What this tests
- Can distill prevent "reasonable but wrong" decisions?
- Does it connect the current request to an established principle?
- Can it reference past mistakes (shared accounts table) as evidence?
- Does it offer the CORRECT alternative immediately (not just refuse)?
- This is the hardest category: the thing the user asked for WORKS technically.
  The problem is architectural, not functional.
