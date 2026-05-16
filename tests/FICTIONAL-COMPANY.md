# Fictional Company: Helios Financial

All test scenarios use this fictional company context. NO real company names should appear in any test outputs or knowledge files.

## Company profile
- **Name**: Helios Financial
- **Type**: Digital banking platform (B2C)
- **Stage**: Series C, ~200 engineers
- **Products**: Checking accounts, investments (crypto + equities), savings, cards

## Architecture
- **Microservices** on Kubernetes
- **Event bus**: Kafka (Protobuf schemas)
- **Databases**: PostgreSQL (one per service)
- **API Gateway**: "Prism" (handles auth, routing)
- **Mobile**: iOS + Android native

## Service names (fictional)
| Service | Domain |
|---------|--------|
| **Orion** | Core banking, accounts, ledger |
| **Vega** | Investments orchestration (shared between teams) |
| **Polaris** | Portfolio management |
| **Atlas** | Equities gateway (partner: BrokerCo) |
| **Nova** | Order execution + settlement |
| **Lyra** | Savings products |
| **Zenith** | Notifications + communications |
| **Apex** | API gateway / auth |
| **Comet** | Data pipeline / ETL |

## Teams
- **Lifecycle team** (Sofia's / Marcus's team): owns Vega, Nova, Polaris
- **Platform team**: owns Orion, Apex, Comet
- **Growth team**: owns Lyra, Zenith

## Known architectural patterns
- Services communicate via Kafka events (Protobuf)
- Synchronous calls go through Apex gateway
- Each service owns its own PostgreSQL database
- Feature flags via internal system ("Beacon")
- Deploy: canary → staging → production
- BrokerCo (equities partner) has known instability

## Use this context in all test scenarios
When crafting test knowledge files for personas, reference Helios services, not any real company.
