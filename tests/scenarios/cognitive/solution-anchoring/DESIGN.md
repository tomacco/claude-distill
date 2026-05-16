# Research: Solution Anchoring from Accumulated Memory

## Origin

Real-world case reported by a senior engineer. Their AI assistant (Claude + memory system) had accumulated weeks of knowledge about a data pipeline architecture (Lakehouse, Kafka, proto events, ETL flows). When a simple product analytics question came in ("track 3 UI interactions"), the system automatically framed it through the heavy infrastructure lens — proposing Lakehouse ingestion, Product Database pipelines, GitHub integration, etc.

The actual solution: 3 Braze events. No infrastructure. No pipelines.

## The bias

This is NOT a human cognitive bias being detected. This is the MEMORY SYSTEM ITSELF creating the bias through over-retrieval of dominant knowledge. The system becomes too good at applying what it knows, even when what it knows is disproportionate to the problem.

**Key distinction:** The Lakehouse knowledge is NOT wrong. It's correctly encoded, correctly retrieved, and correctly applied — for problems of the right scale. The failure is a proportionality mismatch: heavyweight solution for a lightweight problem.

## Simulation approach

### Step 1: Reproduce the bug (this test)

Create a simulated "accumulated state" — heavy infrastructure knowledge loaded via system prompt — then present a simple analytics problem. Verify the model proposes the heavy solution.

### Step 2: Verify vanilla is simple

Same problem with NO accumulated knowledge. Verify vanilla Claude proposes something proportionate.

### Step 3: Apply distill fix

Add a "proportionality principle" to distill rules. Test whether it breaks the anchoring from accumulated knowledge.

## Test setup

### Fictional company context (Helios Financial)

Heavy infrastructure knowledge (equivalent to weeks of Lakehouse work):
- "Comet" — data pipeline service (ETL, event ingestion, schema registry)
- "StarFlow" — event streaming platform (Kafka-based)
- Proto schemas stored in "Nebula" schema registry
- Product Database fed from Comet pipelines
- Metabase dashboards sourced from Product Database
- Previous 5 analytics tasks were ALL solved via Comet pipelines

### The simple problem

Product manager asks:
"We changed the portfolio screen — hid the old 'My Portfolio' link and added it to a new options menu instead. Can we track whether users find it? Specifically: (1) do users open the options menu, (2) do they tap the portfolio link from there, (3) how does navigation to portfolio compare before/after."

### The correct answer

This is client-side UI event tracking. The data exists at the moment of user interaction. It should be tracked via the existing analytics/event SDK already in the mobile app (equivalent of Braze events). No pipeline needed. No data warehouse. No ETL. Just emit 3 events from the UI and query them.

## Conditions

### A: No infrastructure knowledge (baseline)
- Clean session, no accumulated context
- Expected: proposes simple event tracking

### B: Heavy infrastructure knowledge loaded (reproducing the bug)
- System prompt includes: weeks of Comet/StarFlow/Nebula context, 5 previous "analytics solved via pipeline" examples
- Expected: proposes Comet pipeline ingestion (reproduces the bug)

### C: Heavy knowledge + proportionality principle (the fix)
- Same heavy context as B
- Plus: distill rule about solution proportionality
- Expected: catches the mismatch, proposes simple events instead

## Scoring

- Proportionality (0-5): Does the solution complexity match the problem complexity?
- First-principles (0-5): Did it reason from "what data exists, where, and what's the cheapest way to query it?"
- Infrastructure avoidance (0-5): Did it avoid proposing pipelines/ETL/ingestion for a client-side tracking problem?
- Explicit reasoning (0-5): Did it explain WHY the heavy approach isn't needed?
