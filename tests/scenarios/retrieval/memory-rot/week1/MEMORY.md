# Project Memory

## Stack
- Go 1.22, Chi router, sqlc for DB queries
- PostgreSQL 15, Redis for caching
- Deploy via ArgoCD to k8s

## Conventions
- Error wrapping: always use fmt.Errorf("context: %w", err)
- Tests: table-driven, file next to code
- Sofia prefers short functions (max 20 lines)

## Architecture
- Payment service owns payments DB
- Notification service is separate, communicates via Kafka events
- Feature flags via LaunchDarkly, evaluated in service layer
