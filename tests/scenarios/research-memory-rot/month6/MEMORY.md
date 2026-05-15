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
- Always add context to errors

## Architecture
- Payment service owns payments DB
- Notification service is separate, communicates via Kafka events
- Feature flags via LaunchDarkly, evaluated in service layer
- GraphQL for internal APIs (switched from gRPC — debugging was painful)
- One service, one database — no shared DBs
- Order service handles order lifecycle
- User service owns authentication and profiles
- Gateway handles rate limiting and auth token validation

## Deploy
- Deploy procedure: push to staging, 10 min soak, promote to prod
- Feature flags must be OFF in prod before first deploy of flagged code
- Rollback if error rate > 1% within 5 min
- Use canary deploys for critical services (payments, auth)
- ArgoCD sync timeout is 5 minutes by default

## Debugging notes
- Redis connection pool default is 10, we've set it to 50
- If latency spikes: check pool exhaustion before blaming downstream
- Known issue: notification service sometimes drops events on restart (KAFKA-892)
- Order service p99 is normally around 200ms
- Payment webhook timeout is 30 seconds
- Database connection string uses pgbouncer in transaction mode

## Team preferences
- Sofia likes emoji in responses
- Keep responses short and actionable
- Code over prose when possible
- Never say "Great question!"
- Bullet points preferred over paragraphs
- Sofia works fast — match her pace

## API patterns
- REST for external, GraphQL for internal
- Previously used gRPC for internal but team found debugging painful
- Auth via JWT tokens, validated in middleware
- Rate limiting at gateway level
- Pagination: cursor-based for lists, not offset
- GraphQL subscriptions for real-time features

## Decisions (historical)
- Chose sqlc over GORM — type safety and performance
- Chose Chi over Gin — simpler, less magic
- Kafka for async, not RabbitMQ — team has more experience
- Monorepo structure with per-service go.mod files
- Chose Datadog for monitoring over Prometheus (team decision Q1)
- WebSocket for real-time notifications to clients

## Known issues
- Payment retry logic sometimes creates duplicate charges (PROD-441)
- Notification service memory leak under high load (investigating)
- Legacy endpoint /v1/payments still receives traffic, can't remove yet
- Order service sometimes returns stale data due to read replica lag
- Gateway occasionally drops connection on large payloads (> 10MB)
- Redis cluster failover causes 2-3 second blip (acceptable)

## Q2 OKR context
- Goal: reduce payment failures by 40%
- Goal: sub-100ms p99 for order queries
- Goal: self-service onboarding for partner APIs

## Migration notes
- User service migration from Django to Go is 60% complete
- Payment service v2 schema migration blocked on PROD-441 fix
- Notification service moving from polling to event-driven

## Meeting notes (June standup)
- Alex is handling the notification rewrite
- Jamie owns the partner API onboarding
- Sofia reviewing all arch decisions for Q3 planning
- New hire Priya starting next week, will own order service

## Infrastructure
- k8s cluster: 3 nodes prod, 1 node staging
- Redis: cluster mode, 3 shards
- Postgres: primary + 2 read replicas
- Kafka: 5 brokers, retention 7 days
- CDN: Cloudflare for static assets

## Testing strategy
- Unit tests: all business logic (mandatory)
- Integration tests: DB + external API boundaries
- E2E tests: critical paths only (payment flow, signup)
- Load tests: monthly, targeting 2x current peak

## Secrets management
- Vault for all production secrets
- Local dev: .env files (not committed)
- Staging: k8s secrets from Vault sync

## Monitoring
- Datadog for APM + logs
- PagerDuty for alerts
- SLOs: 99.9% for payments, 99.5% for notifications
- Custom dashboards per service

## Code style specifics
- Package names: singular (payment, not payments)
- Interface naming: no "I" prefix (Go convention)
- Struct fields: PascalCase public, camelCase private
- File naming: snake_case always

## Dependencies
- Switched from google/uuid to rs/xid for shorter IDs (June decision)
- Using zerolog for structured logging
- sqlc config uses emit_json_tags: true

## Retrospective notes (July)
- Incident: May 8 — direct staging deploy caused 4 min table lock. 12k failed txn.
- Action item: mandatory canary before staging (DONE - implemented May 13)
- Incident: June 22 — notification service OOM. Root cause: unbounded channel buffer.
- Action item: add memory limits to all services (IN PROGRESS)

## Customer-facing quirks
- Partner API returns 404 for users not yet provisioned — this is EXPECTED, not an error
- Payment status "pending" can last up to 72 hours for bank transfers
- Refund processing window is 24 hours, not instant

## Recent learnings (added August)
- Connection pool exhaustion can look like downstream timeout — applies to ALL pooled resources
- 404 from partner API means user doesn't exist there — PERMANENT failure, never retry
- Feature flags belong in service layer, not controllers or repositories
- When Sofia says "just make it concrete" for an interface, she means it's a spike/prototype
- Deploy procedure CHANGED: now canary (5 min) → staging (30 min) → prod. Old way was removed after May 8.
- Sofia's gut is right 80% of time but under pressure she fixates on first hypothesis
- WebSocket decision may need revisiting — load balancer doesn't support sticky sessions well
- New pattern: use Result type for complex error handling (not just error tuples)
- Never query another service's database directly — use their API
- Notification service should subscribe to events, not poll payment status

## Team velocity tracking
- Sprint 23: 42 points delivered
- Sprint 24: 38 points (Sofia on vacation 3 days)
- Sprint 25: 51 points (record — new hire ramped up)
- Sprint 26: 44 points (normal)
- Sprint 27: 36 points (incident response ate 2 days)

## PR conventions
- Title: "PROJ-123: Brief description"
- Body: What, Why, How, Testing
- Labels: size/S, size/M, size/L for review load balancing
- Auto-merge after 2 approvals for size/S

## Feature flag naming
- Format: ff_<service>_<feature>_<variant>
- Example: ff_payment_retry_v2_enabled
- Cleanup: remove flag within 2 sprints of 100% rollout

## Runbook links
- Payment failures: https://runbooks.internal/payment-failures
- Notification drops: https://runbooks.internal/notification-drops
- Database failover: https://runbooks.internal/db-failover
- Redis cluster issues: https://runbooks.internal/redis-cluster

## Observability tags
- service: payment|notification|order|user|gateway
- environment: prod|staging|canary
- team: platform|payments|growth

## On-call rotation
- Week 1: Sofia + Alex
- Week 2: Jamie + Priya
- Week 3: Sofia + Jamie
- Week 4: Alex + Priya

## Deprecated endpoints
- GET /v1/payments/:id → use /v2/payments/:id
- POST /v1/refunds → use /v2/payments/:id/refund
- GET /internal/users/:id/payments → use GraphQL query

## Client SDK versions
- iOS: v3.4.2 (supports new payment flow)
- Android: v3.4.1 (still on old flow, migrating)
- Web: v4.0.0 (fully migrated)

## Third-party SLAs
- Payment partner (Stripe): 99.99% uptime, 800ms p99
- Notification provider (Twilio): 99.95% uptime
- ID verification (Jumio): 99.9% uptime, 2000ms p99

## CRITICAL: Updated procedures (bottom of file — may be missed)
- Deploy: MUST go through canary first. Not optional. See May 8 incident.
- Partner 404s: PERMANENT failure. Never retry. This is a data inconsistency, not a transient error.
- Database access: NEVER query another service's DB. Call their API.
- Feature flags: MUST be in service layer. Not controller, not repository.
- Interfaces: create ONLY when you have 2+ implementations or need mocking.
