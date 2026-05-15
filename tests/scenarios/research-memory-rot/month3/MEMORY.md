# Project Memory

## Stack
- Go 1.22, Chi router, sqlc for DB queries
- PostgreSQL 15, Redis for caching
- Deploy via ArgoCD to k8s

## Conventions
- Error wrapping: always use fmt.Errorf("context: %w", err)
- Tests: table-driven, file next to code
- Sofia prefers short functions (max 20 lines)
- Use interfaces at service boundaries
- Constructor injection for all dependencies

## Architecture
- Payment service owns payments DB
- Notification service is separate, communicates via Kafka events
- Feature flags via LaunchDarkly, evaluated in service layer
- GraphQL for internal APIs (switched from gRPC — debugging was painful)
- One service, one database — no shared DBs

## Deploy
- Deploy procedure: push to staging, 10 min soak, promote to prod
- Feature flags must be OFF in prod before first deploy of flagged code
- Rollback if error rate > 1% within 5 min

## Debugging notes
- Redis connection pool default is 10, we've set it to 50
- If latency spikes: check pool exhaustion before blaming downstream
- Known issue: notification service sometimes drops events on restart (KAFKA-892)

## Team preferences
- Sofia likes emoji in responses
- Keep responses short and actionable
- Code over prose when possible
- Never say "Great question!"

## API patterns
- REST for external, GraphQL for internal
- Previously used gRPC for internal but team found debugging painful
- Auth via JWT tokens, validated in middleware
- Rate limiting at gateway level

## Decisions
- Chose sqlc over GORM — type safety and performance
- Chose Chi over Gin — simpler, less magic
- Kafka for async, not RabbitMQ — team has more experience
- Monorepo structure with per-service go.mod files

## Known issues
- Payment retry logic sometimes creates duplicate charges (PROD-441)
- Notification service memory leak under high load (investigating)
- Legacy endpoint /v1/payments still receives traffic, can't remove yet

## Recent learnings
- Connection pool exhaustion can look like downstream timeout
- 404 from partner API means user doesn't exist there — don't retry
- Feature flags belong in service layer, not controllers
- Sofia made a concrete struct instead of interface last sprint — said "time is tight" — revisit later
