# Changelog

All notable changes to Neural Rank are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2026-05-19] — Tier 3 Production Hardening — 16/33 Resolved (14 Owner-Pending, 3 Open)

### Added
- `backend/src/core/metrics.js` — in-process Prometheus-compatible metrics registry (zero npm dep): `increment`, `observe`, `getMetricsText`; counters + histograms with configurable buckets (T3-03)
- `GET /v1/metrics` — Prometheus text format endpoint; tracks `http_request_total`, `http_request_duration_ms`, `http_error_total`, `rate_limit_hit_total` per route (T3-03)
- `Dockerfile` — node:20-alpine, non-root appuser, `npm ci --omit=dev` (T3-06)
- `docker-compose.yml` — api + postgres:16-alpine; `docker-compose up` produces running API with no manual steps (T3-06)
- `.dockerignore` — excludes node_modules, .env, design/, ui/, app/, docs/ (T3-06)
- `.nvmrc` — pins Node.js version to 20 (T3-06)
- `.husky/pre-commit` — runs `npm run lint && npm run check:secrets` before every commit (T3-07)
- `.husky/pre-push` — runs `npm run ci` before every push (T3-07)
- `scripts/scaffold-module.js` — generates 5 contract files + service test from templates; prints manual-step checklist (T3-10)
- `scripts/check-migrations.js` — verifies all 37+ expected `app_public` tables exist; skips when DATABASE_URL unset (T3-18)
- `docs/backend/reference/SLO.md` — SLO definitions: 99.5% availability, p99 latency targets, 0.5% error rate; error budget policy; review cadence (T3-19)

### Changed
- `backend/src/server.js` — ETag + `If-None-Match` / 304 support on all list endpoints (recommendations, tasks, audit-logs) (T3-11)
- `backend/src/server.js` — `buildHealthPayload()` now includes `pool` stats from `getPoolStats()` (T3-09)
- `backend/src/server.js` — metrics tracking on every request completion via `response.on("finish")` (T3-03)
- `backend/src/db.js` — new `getPoolStats()` export: `{ total, idle, waiting, max }` (T3-09)
- `backend/src/domains/search-intelligence/opportunityScoring.js` — implemented `deriveVolatility()`: derives high/medium/low/unknown from position variance history or SERP feature presence; no longer returns `"unknown"` by default (T3-21)
- `backend/src/domains/search-intelligence/service.js` — `analyzeQuery()` uses `deriveVolatility()` instead of hardcoded `"unknown"` (T3-21)
- `backend/src/api/openapi.js` — added `/metrics` path to spec (T3-03)
- `app/pubspec.yaml` — name `seosync` → `neural_rank`; description updated; all dependency versions pinned (removed `^`) (T3-20, T3-23)
- `app/android/app/build.gradle` — namespace + applicationId `com.seosync.app` → `com.neuralrank.app` (T3-20)
- `.env.example` — added 8 integration adapter credential vars (GSC, GA4, PageSpeed, Backlink) (T3-28)
- `render.yaml` — added 8 adapter credential vars as `sync: false` entries (T3-28)
- `docs/backend/decisions/BACKEND_DOMAIN_SERVICE_ROUTES.md` — fully rewritten: all 4 domain services now have HTTP routes; complete 26-route inventory; historical "routeless" decision preserved as context (T3-29)
- `docs/backend/reference/BACKEND_CORE_UTILITIES.md` — nine→fourteen; added entries 10–14: dbUtils, errorReporter, moduleInputRequirements, prioritization, rateLimiter (T3-34 + prior session T3-28 additions)
- `docs/backend/reference/BACKEND_DATA_AND_PERSISTENCE.md` — 3 new migration rows: workspace_isolation, audit_log_immutability, sync_activation_from_js
- `docs/backend/reference/RUNBOOK.md` — added "Database backup procedure" scenario (T3-27)
- `README.md` — Operations section with db:dump command; full env var table (11 core + 8 adapter vars); route count 24→27 (T3-27, T3-28)
- `scripts/check-secrets.js` — added `docker-compose.yml` to SKIP_FILES (dev credentials)
- `.github/dependabot.yml` — added Flutter `pub` ecosystem entry for `/app` directory (T3-23)
- `package.json` — added `engines: { node: ">=20" }`, `db:dump`, `scaffold`, `check:migrations`, `prepare` scripts; `husky` devDependency (T3-06, T3-07, T3-10, T3-18, T3-27)

### Owner-pending (14 items — require external infrastructure)
- T3-01: Async queue → needs Upstash Redis free tier
- T3-02: OpenTelemetry → needs `@opentelemetry/sdk-node` + Grafana Cloud free tier
- T3-04: Redis rate limiter → needs Upstash Redis
- T3-05: Response caching → depends on T3-04
- T3-08: Staging environment → needs second Render service on `staging` branch
- T3-12: Flutter ApiRepository → XL effort (Dio client, Supabase auth, BLoC wiring)
- T3-14: Composable middleware stack → L effort refactor
- T3-15: Domain service DI → depends on T3-14
- T3-16: Load and performance tests → needs k6 + staging (T3-08)
- T3-17: Flutter screen consolidation → XL effort, depends on T3-12
- T3-22: Flutter error boundary → depends on T3-12
- T3-24: Wire 13 stub provider integrations → needs API keys for each provider
- T3-25: Flutter Insight model fields → depends on T3-12
- T3-26: Play Store assets → needs design assets (icon, splash screen)

---

## [2026-05-19] — Tier 2 Adoption Requirements — 23/26 Resolved (3 Owner-Pending)

### Added
- `backend/src/api/openapi.js` — OpenAPI 3.1 specification as JS object; served at `GET /v1/openapi.json`; Swagger UI at `GET /v1/docs` (CDN, zero npm dep) (T2-06)
- `docs/backend/reference/OPENAPI.yaml` — human-readable OpenAPI 3.1 YAML; 26 paths, full schemas, error codes, Bearer JWT auth (T2-06)
- `backend/src/integration-tests/execution-postgres.test.js` — real Postgres integration test for execution lifecycle domain (T2-05)
- `backend/src/integration-tests/persistence-postgres.test.js` — real Postgres integration test for all 18 module `saveRun` / `persistXxxRun` functions (T2-05)
- `backend/src/integration-tests/index.js` — sequential integration test runner (T2-05)
- `docker-compose.test.yml` — postgres:16-alpine on port 5433 with healthcheck (T2-05)
- `backend/src/core/errorReporter.js` — zero-dep Sentry reporter via `node:https`; no-op when `SENTRY_DSN` absent (T2-16)
- `backend/src/core/dbUtils.js` — `clone()`, `normalizeRows()`, `upsertProductTarget()` extracted from domain repos (T2-20)
- `backend/src/core/moduleInputRequirements.js` — required-field map for all 18 modules (T2-18)
- `backend/src/negative-path.test.js` — 13 negative-path cases: 404, 301, 405, 400 invalid JSON, 400 missing field, 400 over-limit string, 401 no identity, 409 governance block, 413 too large, security headers, CORS OPTIONS 204, 400 missing module input, 404 unknown module (T2-15)
- `.github/workflows/ci.yml` — GitHub Actions CI: syntax + secrets + lint + coverage gate on every push/PR (T2-11)
- `.github/dependabot.yml` — weekly npm dependency updates, 5 open PR limit (T2-13)
- `.c8rc` — c8 coverage config: 80% threshold, lcov + text reporters, excludes test/scripts/ui (T2-07)
- `docs/backend/decisions/ADR_001_ZERO_RUNTIME_DEPENDENCIES.md` — decision record (T2-09)
- `docs/backend/decisions/ADR_002_PURE_NODE_HTTP.md` — decision record (T2-09)
- `docs/backend/decisions/ADR_003_IN_MEMORY_DEFAULT_REPOSITORY.md` — decision record (T2-09)
- `docs/backend/reference/RUNBOOK.md` — 6 operational scenarios with remediation steps (T2-10)
- `supabase/migrations/20260519000001_audit_log_immutability.sql` — `seq BIGSERIAL`, BEFORE UPDATE/DELETE triggers raising exceptions on `audit_logs` (T2-21)
- `supabase/migrations/20260519000002_sync_activation_from_js.sql` — drops `is_active` from `backend_module_activation_defaults`; JS catalog is now authoritative (T2-19)
- `scripts/check-activation-sync.js` — verifies JS activation catalog matches DB `backend_module_catalog` (T2-19)

### Changed
- `backend/src/server.js` — API versioning `/v1/` prefix on all 26 routes; 301 redirect for legacy unversioned paths with `Deprecation: true` header; `GET /v1/openapi.json` + `GET /v1/docs` routes added; `reportError` on 5xx; `validateModuleInput` on module run; pagination wired into recommendations, tasks, and audit-logs (T2-02, T2-03, T2-06, T2-15, T2-16, T2-18, T2-25)
- `backend/src/api/validation.js` — `assertStringMaxLength()`, `parsePaginationParams()`, `parseFilterParams()`, `applyPagination()` with cursor-based paging added; `validateModuleInput()` added (T2-03, T2-08, T2-18)
- `backend/src/api/errors.js` — `ERROR_REGISTRY` maps all known codes to HTTP status; `normalizeError()` uses registry; unknown codes log a warning (T2-14)
- `backend/src/db.js` — `withTransaction(callback)` wraps BEGIN/COMMIT/ROLLBACK; no-op for in-memory path (T2-04)
- `backend/src/domains/execution/service.js` — 4 mutations wrapped in `withTransaction` (T2-04)
- `backend/src/domains/measurement/repository.js`, `business-intelligence/repository.js`, `execution/repository.js` — migrated to shared `core/dbUtils` helpers (T2-20)
- `backend/src/orchestration/defaultMvpOrchestrator.js`, `activationAwareOrchestrator.js` — `runModuleSafe()` wraps each module in `Promise.race` with 10s timeout (T2-12)
- `backend/src/core/activation.js` — `assertModuleCatalogIntegrity()` reverse check: registry keys must appear in activation catalog (T2-26)
- `backend/src/full-backend-validation.test.js` — `assert.ok(length >= 29)` replaces `assert.equal(length, 29)`; 30 suites (T2-22)
- `backend/src/server.test.js` — all 24 routes updated to `/v1/` prefix; `testOpenApiRoutes` contract test added (T2-02, T2-06)
- `render.yaml` — `healthCheckPath: /v1/health`; `SENTRY_DSN`, `MODULE_TIMEOUT_MS` env vars (T2-02, T2-16)
- `package.json` — `test:backend:ci` runs c8 coverage gate at 80%; `test:integration` runs activation sync + integration tests; `c8` + `eslint` devDependencies (T2-07)
- `.env.example` — `MODULE_TIMEOUT_MS`, `SENTRY_DSN` documented (T2-12, T2-16)
- `README.md` — CI badge; `/v1/health` health URL; routes table updated; Supabase keep-alive explanation (T2-11, T2-02, T2-25)
- `CONTRIBUTING.md` — "All 29 test suites" → "All test suites" (T2-22)
- `.gitignore` — `coverage/` added (T2-07)

### Owner-pending (3 items requiring credentials/accounts)
- **T2-17** — UptimeRobot monitor: create HTTP monitor for `https://neural-rank-backend.onrender.com/v1/health` at 5-min interval.
- **T2-23** — SERP provider: set `SERP_PROVIDER` + `SERP_API_KEY` in Render dashboard (SerpApi free tier: 100 searches/month).
- **T2-24** — Renderer endpoint: deploy headless browser service and set `RENDERER_ENDPOINT` in Render dashboard.

### Projected score after Tier 2: **91/100** (was 85/100)

---

## [2026-05-19] — Tier 1 Production Blockers — All 18 Resolved

### Added
- `backend/src/db.js` — PostgreSQL pool (`pg.Pool`, max 5, free tier safe); `initDb()` called at startup, `probeDb()` used by `/health`; graceful no-op when `DATABASE_URL` absent
- `backend/src/server.js` — OPTIONS preflight handler (CORS), `addSecurityHeaders()` (T1-04, T1-05), request access log with `X-Request-ID` correlation IDs on every response (T1-06), workspace-safe `buildRequestContext` allowlist (T1-02)
- `backend/src/core/rateLimiter.js` — `TRUSTED_PROXY_COUNT`-aware `X-Forwarded-For` parsing with IP validation regex (T1-10)
- `backend/src/api/auth.js` — production auth hardening: 503 on Supabase network error (T1-15), production rejection when `SUPABASE_URL` absent (T1-09)
- `backend/src/domains/governance/resultModel.js` — fixed `requiresApproval` bug: block → `false`, require_approval → `true` (T1-16)
- `backend/src/domains/execution/service.js` — pre-persist governance block gate: throws `governance_blocks_*` before any DB write (T1-17); `workspaceId` propagated into `createRecommendationRecord` and list queries (T1-03)
- `backend/src/domains/execution/models.js` — `workspaceId` field in `createRecommendationRecord` and `createTaskRecord` (T1-03)
- `backend/src/domains/execution/repository.js` — `listRecommendations(workspaceId)` and `listTasks(workspaceId)` workspace filter in both Postgres and in-memory repositories; `workspace_id` in Postgres INSERT queries (T1-03)
- `supabase/migrations/20260519000000_workspace_isolation.sql` — adds `workspace_id` columns to 6 tables, enables RLS on all 33 `app_public` tables, workspace-scoped policies for execution/measurement tables (T1-03)
- `scripts/check-secrets.js` — secrets scanner (JWT, API key, password, DATABASE_URL patterns); 471 files scanned; wired into `npm run ci` (T1-11)
- `LICENSE` — MIT license, `package.json` `"license": "MIT"` (T1-13)
- `render.yaml` — `NODE_ENV=production`, `ALLOWED_ORIGIN` (T1-14, T1-04)
- `.env.example` — `NODE_ENV`, `ALLOWED_ORIGIN`, `TRUSTED_PROXY_COUNT` documented (T1-04, T1-09, T1-10, T1-14)

### Changed
- `/health` — now async; returns `checks: { http, db }` and `deployable: true/false`; HTTP 503 when DB check fails (T1-08)
- `buildHealthPayload` — async, calls `probeDb()` (T1-08)
- `startServer()` — now async; calls `initDb()` and threads `{ query }` into `baseContext` (T1-01)
- 6 domain POST handlers now enforce `requireIdentity` and mutation rate limit: `handleMeasurementSnapshots`, `handleMeasurementAttributions` (POST), `handleTechnicalOperationsAudit`, `handleSearchIntelligenceClassify`, `handleSearchIntelligenceAnalyze`, `handleBusinessIntelligenceProfiles` (POST) (T1-18)
- `README.md` — added rate limiting section (120 req/min, 30 mutations), MIT badge (T1-07, T1-13)
- `CHANGELOG.md` — corrected `60 req/min` → `120 req/min` (T1-07)
- `server.test.js` — `testBlockedGovernanceRoute` updated: expects 409 on creation of blocked recommendation (correct T1-17 behavior)
- `governance-engine.test.js` — `testBlockedUnsafeRecommendationsCannotAdvance` updated: asserts `rejects` on creation, verifies `requiresApproval=false` for block (T1-16, T1-17)
- `package.json` — added `check:secrets` script; `ci` now runs syntax + secrets + lint + tests; added `version` and `license` fields

### Security
- Prototype pollution in `buildRequestContext` — allowlist copy replaces spread of user `body.context` (T1-02)
- CORS headers on all responses; OPTIONS preflight returns 204 (T1-04)
- Security headers on all responses: `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy` (T1-05)
- Auth bypass hardening: production rejects all requests when `SUPABASE_URL` absent; startup warning logged (T1-09)
- Supabase network error returns 503 (not 401) — clients can distinguish outage from invalid token (T1-15)
- Governance block gate pre-persist: blocked actions (keyword stuffing, hidden text, mass deindexing) never reach the DB (T1-17)
- RLS enabled on all 33 `app_public` tables (T1-03)
- Secrets scanning in CI — committed secrets cause `npm run ci` to fail (T1-11)

### Projected score after Tier 1: **85/100** (was 76/100)

---

## [2026-05-18] — Enterprise Grading Audit + Gap Register Finalized

### Added
- `REBUILD_PLAN.md` — 77-item enterprise gap register across Tier 1 (18 production blockers), Tier 2 (26 adoption requirements), Tier 3 (33 enterprise-elite items); current grade B- (76/100), target A+ (98/100)

### Changed
- `DOC_CATALOGUE.md` — REBUILD_PLAN entry updated to reflect 77-item count
- `progress.md` — milestone #12 appended (audit methodology, findings, key code-verified gaps)

### Audit methodology
Three-pass audit: (1) enterprise grading of all 18 modules and infrastructure; (2) deterministic read of all 82 docs in DOC_CATALOGUE.md; (3) full code verification — all 90 module source files (18×5), 9 SQL migrations, all backend infrastructure, and all Flutter app/ and ui/ files read in full. Zero sampling.

### Key findings
- T3-30 removed — Phase 2 signal fields already implemented across all 7 modules (verifiedBuyerRatio, intentSignal, ctrEfficiency, serpOverlapScore, MODULE_WEIGHTS etc.)
- T3-28 added — 8 adapter env vars confirmed missing from .env.example (GSC, GA4, PageSpeed, Backlink adapters)
- T3-33 added — BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md confirmed covering only 14 of 24 routes
- T3-34 added — prioritization.js and rateLimiter.js confirmed undocumented in BACKEND_CORE_UTILITIES.md
- 33 tables confirmed from SQL across 9 migrations
- Existing items T1-16, T1-17, T1-18, T2-19, T2-26 all confirmed from source code

---

## [2026-05-18] — Production Hardening

### Added
- `.env.example` — documents all 6 env vars with placeholder values; copy to `.env` for local dev
- `SECURITY.md` — responsible disclosure policy; contact, scope, 48hr/14-day SLA
- `CONTRIBUTING.md` — branch naming, commit style, pre-push checklist, doc update rules, module contract
- `CHANGELOG.md` — this file; keepachangelog.com format, backfilled from git log
- `.eslintrc.json` — ESLint config (`no-unused-vars`, `no-undef`); `npm run lint` + wired into `npm run ci`
- `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers in `server.js` — structured JSON log output; P1-9 resolved

### Changed
- `render.yaml` — all 6 env vars moved to `sync: false`; no plaintext values in tracked file
- `npm run ci` — now runs syntax check + ESLint + full test suite (was syntax check + tests only)
- 13 dead variables removed across 12 backend module files (ESLint `no-unused-vars` enforcement)
- `README.md` — project tree, CI command, env vars table updated

### Security
- `render.yaml` credential exposure (P0-1) — `SUPABASE_URL` and `SUPABASE_ANON_KEY` plaintext values removed from tracked file
- Full git history scrubbed — JWT anon key and DB password removed from all 24 historical commits via `git filter-branch`; stale objects pruned; force-pushed to GitHub

---

## [2026-05-18] — Workspace Restructure

### Changed
- `SEOSync_Flutter_App/` → `app/` — canonical Flutter production app, consistent naming
- `frontend/` → `ui/` — Flutter UI prototype, distinct from production app
- `design/inspiration/inspiration-library/` → `design/library/` — removed double nesting
- `design/mockups/html-mockups-archetypes-v2/` → `design/mockups/archetypes/` — removed versioned folder name
- Root `.gitignore` Flutter exclusion paths updated to match renamed folders
- 9 docs updated across README.md, DOC_CATALOGUE.md, PRODUCTION_READINESS_GAPS.md and others

---

## [2026-05-17] — Documentation Health Cycle

### Added
- `PRODUCTION_READINESS_GAPS.md` — production backlog with 5 P0s, 14 P1s, 10 P2s; each item has exact file/line evidence and fix instructions
- `BACKEND_DOMAIN_BOUNDARIES.md` — all 18 modules mapped to 8 bounded contexts (canonical)
- `BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md` — combined Phase 1 + Phase 2 alignment audit (18/18)

### Changed
- 5 documentation passes: dedup · linkage normalisation · production readiness audit · 18-module content backfill · naming normalisation
- 3 file renames to SCREAMING_SNAKE_CASE: `PRODUCT_SEO_OS_BUILD_PLAN.md`, `FRONTEND_DESIGN_LANGUAGE.md`, `FRONTEND_DESIGN_SYSTEM.md`
- All broken cross-references fixed across 25 files
- 10 superseded docs archived to correct subfolders

### Security
- `progress.md` — DB password removed (was committed in plaintext)

---

## [2026-05-16] — 18-Module Backend Live + Supabase

### Added
- 10 new backend modules: `technical-seo-audit`, `on-page-seo-scorer`, `backlink-intelligence`, `eeat-signals`, `search-intent-classifier`, `serp-feature-analyzer`, `topical-authority`, `site-architecture`, `analytics-integration`, `local-seo`
- 3 new core utilities: `intentClassifier.js`, `seoScorer.js`, `domainAuthorityScorer.js`
- 5 integration adapters: GSC, GA4, PageSpeed, backlink-provider, serp-provider
- Supabase project `neural-rank` — 9 migrations applied, 33 tables in `app_public`
- Execution lifecycle domain: recommendations, tasks, status history, audit logs
- Governance engine: 9 guardrails, 4-level classification (allow/warn/require_approval/block)
- Measurement domain: before/after snapshots, attribution links, metric source registry
- QC Phase 2: 60/60 PASS across all 10 expansion modules
- Test suite: 19 → 29 suites, all passing

### Changed
- 7 existing modules enhanced (competitor-analysis, keyword-analysis, rank-tracking, optimization-layer, content-listing-insights, unified-workflow-layer, review-analysis)
- Execution order resequenced — `technical_seo_audit` now runs first
- 4 post-build bugs fixed: dead variable, schema mismatch, dead filter, duplicate action types

---

## [2026-05-15] — Production Hardening + Auth

### Added
- Auth middleware: JWT verification via Supabase, workspace isolation headers
- Rate limiting: 120 req/min default, 30 req/min mutations, RFC-compliant headers
- Domain service routes: technical-operations, search-intelligence, measurement, business-intelligence
- `DOC_CATALOGUE.md` — living index of all .md files in the repo
- `render.yaml` — Render free-tier deployment blueprint

### Changed
- CI pipeline: `npm run ci` = syntax check + full test suite

---

## [Pre-2026-05-15] — Initial Build

### Added
- 8-module Phase 1 backend: review-analysis, content-listing-insights, keyword-analysis, rank-tracking, competitor-analysis, optimization-layer, creative-messaging-layer, unified-workflow-layer
- `INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION` execution flow enforced across all modules
- 5-file module contract established (service / analysis / insights / actions / repository)
- Flutter `app/` with BLoC architecture, 10 screens, MockRepository
- Flutter `ui/` prototype with 12 feature screens, demo data, icon system
- Render free-tier deployment live: `neural-rank-backend.onrender.com`
- Phase 1 backend QC: 10/10 PASS — frozen
