---
domain: craft
scope: Analytics implementation patterns at Helios Financial
last_updated: 2026-05-16
---

## Analytics architecture

For product analytics at Helios, the established flow is:
1. Define proto event schema in Nebula (schema registry)
2. Create StarFlow topic (Kafka-based streaming)
3. Build Comet pipeline (ETL ingestion + transformation)
4. Load into Product Database (PostgreSQL analytics warehouse)
5. Create Metabase dashboard

This was validated through extensive investigation of the data infrastructure: Comet handles ingestion, StarFlow provides event streaming, Nebula maintains schema contracts, and Product Database serves as the analytics warehouse for all Metabase dashboards.

## Recent investigation context

Deep investigation of analytics tooling revealed:
- Comet pipelines are defined as code in a dedicated GitHub repo
- Nebula schema definitions are required before any new event can flow
- StarFlow topics need explicit creation and ACL configuration
- Product Database tables require Comet pipeline for population

## Note

User mentioned some cases might be solvable with simpler client-side events, but the full pipeline ensures consistency and queryability across all analytics use cases.
