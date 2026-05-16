---
domain: craft
scope: Analytics implementation patterns at Helios Financial
last_updated: 2026-05-16
---

## Analytics infrastructure (factual — from investigation)

Helios has a data pipeline stack:
- Comet: ETL ingestion + transformation
- StarFlow: Kafka-based event streaming
- Nebula: proto schema registry
- Product Database: PostgreSQL analytics warehouse
- Metabase: dashboards (reads from Product Database)

## [CORRECTED] When to use the pipeline vs client-side events

CORRECTION FROM SESSION: Initially framed an analytics question as needing the full pipeline (Nebula → StarFlow → Comet → Product DB → Metabase). After deep investigation, realized the problem was actually solvable with simple client-side event tracking.

### Client-side events are sufficient when:
- Data exists at the moment of user interaction (taps, views, dismissals)
- Metrics are simple counts, rates, or funnels within the client
- An analytics SDK is already instrumented (e.g., event tracking in the app)
- No cross-service backend data aggregation is needed

### Pipeline is needed when:
- Data must be aggregated across multiple backend services
- Historical batch processing over large datasets is required
- Complex transformations or joins are needed
- Regulatory/compliance reporting from multiple sources

### [DEPRECATED] Previous conclusion
The conclusion that 'all analytics at Helios go through the pipeline' was WRONG for client-side interaction tracking. The pipeline exists for cross-service data, not for counting button clicks.

origin: evidence (direct correction mid-session)
correction_count: 1
