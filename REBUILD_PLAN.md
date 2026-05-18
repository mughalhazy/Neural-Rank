# Neural Rank — Enterprise Rebuild Plan

Working document for closing every gap identified in the 2026-05-18 enterprise grading audit.
Target: 100/100 across all ten dimensions.

Current overall grade: **B- (76/100)**
Target: **A+ (100/100)**

Each item is assigned:
- **Status** — `open` · `in_progress` · `resolved`
- **Effort** — S (< 1 hr) · M (1–4 hrs) · L (4–12 hrs) · XL (1–3 days)
- **Risk** — low · medium · high (risk of breaking something if done wrong)

---

## Grading summary (current vs target)

| Dimension | Current | Target |
|---|---|---|
| Code Quality | A- (88) | A+ (100) |
| Architecture | B+ (82) | A+ (100) |
| API Design | B+ (83) | A+ (100) |
| Documentation | A (90) | A+ (100) |
| Developer Experience | B (80) | A+ (100) |
| Testing / QC | B (78) | A+ (100) |
| Security | C+ (72) | A+ (100) |
| Data Layer | C (70) | A+ (100) |
| DevOps / Observability | D+ (65) | A+ (100) |
| Scalability | D (55) | A+ (100) |

---

## Tier 1 — Production blockers (must fix before any serious use)

These are gaps that create data loss, real security vulnerabilities, or misleading system state. None require architectural rewrites.

---

### T1-01 — Wire PostgreSQL connection at server startup

**Dimension:** Data Layer · Scalability
**Current state:** `createPostgresExecutionRepository` exists and is correct, but `query` is never injected into `baseContext` at startup. Every byte of execution data (recommendations, tasks, audit logs, snapshots) lives in the in-memory repository and is wiped on every Render restart (~15 min inactivity on free tier).
**Files:** `backend/src/server.js`, new `backend/src/db.js`
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Create `backend/src/db.js` — exports a `pg.Pool` instance configured from `DATABASE_URL` env var. Pool size 5 (Supabase free tier allows ≤60 connections). Graceful no-op when `DATABASE_URL` is absent (local dev / CI).
2. In `server.js` `startServer()`, call `db.connect()` to verify connectivity before binding the port.
3. Pass `{ query: (sql, params) => pool.query(sql, params) }` into `baseContext` so all domain repositories automatically resolve to the Postgres path.
4. Log `{ kind: "db_connected", host }` on successful connection; log warning and continue when absent.
5. Add connection pool health check to `/health` — report `db: "pass"` or `db: "no_connection"`.

**Definition of done:** Restart Render; create a recommendation; cold-start the service again; recommendation is still present.

**Status:** `open`

---

### T1-02 — Fix prototype pollution in buildRequestContext

**Dimension:** Security · Code Quality
**Current state:** `buildRequestContext` in `server.js` spreads user-supplied `body.context` directly: `{ ...baseContext, ...bodyContext, requestIdentity: identity }`. A payload `{ "context": { "__proto__": { "isAdmin": true } } }` can pollute `Object.prototype` for the entire process lifetime.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Replace the spread of `bodyContext` with an allowlist copy: copy only known safe keys (`workspaceId`, `clientId`, `targetRef`, `websiteUrl`, `appId`) from `bodyContext`.
2. Alternatively, use `Object.assign(Object.create(null), bodyContext)` to produce a null-prototype copy, then spread that.
3. Add a validation test: send `{ "context": { "__proto__": { "polluted": true } } }` and assert `({}).polluted` is `undefined` after the request.

**Definition of done:** Prototype not polluted after request with `__proto__` in body.context.

**Status:** `open`

---

### T1-03 — Add workspace isolation enforcement

**Dimension:** Security · Architecture
**Current state:** `requireWorkspace` is defined and exported in `auth.js` but never called anywhere. Any authenticated actor can read and write any other workspace's recommendations, tasks, and audit logs. This is P0-3 in the gap register.
**Files:** `backend/src/api/auth.js`, `backend/src/server.js`, `supabase/migrations/` (new migration), all execution/measurement repository files
**Effort:** L · **Risk:** high

**Implementation steps:**
1. Write migration `20260519_workspace_isolation.sql`: add `workspace_id UUID NOT NULL DEFAULT gen_random_uuid()` to `recommendations`, `tasks`, `task_status_history`, `audit_logs`, `measurement_snapshots`, `attribution_links`. Add index on `workspace_id` for each table.
2. Add RLS policy per table: `USING (workspace_id = current_setting('app.workspace_id')::uuid)`.
3. In `server.js`, call `requireWorkspace(identity)` on all execution and measurement mutation routes.
4. Pass `workspaceId` from `identity` into all `listRecommendations`, `listTasks`, `listAuditLogs` queries as a WHERE filter.
5. Update the in-memory repository to also filter by `workspaceId` so tests remain valid.
6. Add test case: actor A creates recommendation in workspace A; actor B with workspace B cannot read it.

**Definition of done:** Cross-workspace data leakage is impossible even with a valid auth token.

**Status:** `open`

---

### T1-04 — Add CORS headers

**Dimension:** Security · API Design
**Current state:** No `Access-Control-Allow-*` headers anywhere. Any origin can make cross-origin requests from a browser with no restriction.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `ALLOWED_ORIGIN` env var (default `*` for development; production should be the Flutter web origin or dashboard domain).
2. In `sendEnvelope`, add headers: `Access-Control-Allow-Origin: <ALLOWED_ORIGIN>`, `Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Authorization, X-Neural-Rank-Actor, X-Neural-Rank-Client-Id, X-Neural-Rank-Workspace-Id`.
3. Add an `OPTIONS` preflight handler at the top of `createRequestHandler` — return 204 with CORS headers and no body.
4. Add `ALLOWED_ORIGIN` to `.env.example` and `render.yaml`.

**Definition of done:** `curl -H "Origin: https://attacker.com" /health` returns correct CORS headers; preflight OPTIONS returns 204.

**Status:** `open`

---

### T1-05 — Add security response headers

**Dimension:** Security
**Current state:** No security headers on any response. Missing `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `X-XSS-Protection`.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add the following to the `headers` object in `sendEnvelope`:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-XSS-Protection: 0` (disabled — modern browsers don't need it and it can cause XSS on old ones)
   - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
2. Add a test asserting these headers are present on every response.

**Definition of done:** `curl -I /health` returns all six headers.

**Status:** `open`

---

### T1-06 — Add request access log

**Dimension:** DevOps / Observability
**Current state:** Successful requests are completely silent in logs. Only errors produce log output. You cannot see traffic patterns, slow routes, or unusual callers in production.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. At the top of `createRequestHandler`, record `const startedAt = Date.now()`.
2. Wrap `response.end` to capture when the response completes.
3. After the response is sent (use `response.on('finish')` hook), emit:
   ```json
   { "kind": "request", "method": "GET", "path": "/health", "status": 200, "durationMs": 3, "correlationId": "...", "actor": "...", "ip": "..." }
   ```
4. Sanitize: never log `Authorization` header value, never log request body.

**Definition of done:** Every request — success or error — produces a structured JSON log line.

**Status:** `open`

---

### T1-07 — Fix rate limit documentation discrepancy

**Dimension:** Code Quality · Documentation
**Current state:** `rateLimiter.js` exports `DEFAULT_LIMIT = 120`. README says "60 req/min". One is wrong.
**Files:** `backend/src/core/rateLimiter.js` or `README.md`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Decide the correct limit (120 is what the code enforces — README is wrong).
2. Update README backend table to say 120 req/min (default), 30 req/min (mutations).
3. Update any other doc references.

**Definition of done:** Code and docs agree on the same number.

**Status:** `open`

---

### T1-08 — Harden /health to report real system state

**Dimension:** DevOps / Observability
**Current state:** `/health` returns `{ deployable: true }` hardcoded. It does not probe the DB or any external dependency. A Render health check routing traffic to a broken instance would never know.
**Files:** `backend/src/server.js`, `backend/src/db.js` (from T1-01)
**Effort:** S · **Risk:** low

**Implementation steps:**
1. After T1-01 is complete, add an async DB probe in `buildHealthPayload`: run `SELECT 1` with a 2s timeout.
2. Report `checks: { db: "pass" | "fail" | "not_configured", http: "pass" }`.
3. If DB check fails, return HTTP 503 (not 200) so load balancers stop routing to the instance.
4. If `DATABASE_URL` is not set, report `db: "not_configured"` with HTTP 200 (valid for local dev).

**Definition of done:** Disconnecting DB causes `/health` to return 503.

**Status:** `open` (depends on T1-01)

---

## Tier 2 — Enterprise adoption requirements

These gaps do not cause immediate data loss but block serious production use: auditability, scalability of the API surface, real test coverage, and API discoverability.

---

### T2-01 — Request correlation IDs

**Dimension:** DevOps / Observability · Architecture
**Current state:** No trace ID is generated or threaded through any request. You cannot correlate an error log with the request that triggered it.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. At the top of `createRequestHandler`, generate `const correlationId = request.headers['x-request-id'] || randomUUID()`.
2. Add `X-Request-ID: <correlationId>` to all response headers via `sendEnvelope`.
3. Pass `correlationId` into `logRequestEvent` and the access log (T1-06).
4. Thread `correlationId` into error logs so errors can be matched to access log entries.

**Definition of done:** Every response carries `X-Request-ID`; every log line for that request carries the same ID.

**Status:** `open`

---

### T2-02 — API versioning

**Dimension:** API Design · Architecture
**Current state:** All routes are at `/` with no version prefix. Breaking changes cannot be introduced without breaking all existing clients.
**Files:** `backend/src/server.js`, all clients
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Add `/v1/` prefix to all routes in `createRequestHandler`.
2. Add a legacy redirect: requests to unversioned paths return 301 to `/v1/<path>` with a deprecation warning header `Deprecation: true`.
3. Update README, CONTRIBUTING, all test files, and render.yaml health check URL.
4. Update Flutter `app/` repository base URL to `/v1/`.

**Definition of done:** All 24 routes accessible at `/v1/<path>`; old paths redirect cleanly.

**Status:** `open`

---

### T2-03 — Pagination on all list endpoints

**Dimension:** API Design · Scalability
**Current state:** `listRecommendations`, `listTasks`, `listAuditLogs`, `listBusinessProfiles`, `listMetricSources` return all records. No limit, no cursor, no offset. Under real usage this is a memory and timeout problem.
**Files:** `backend/src/server.js`, all domain repository files, `backend/src/api/validation.js`
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Define standard query params: `limit` (integer, 1–200, default 50) and `cursor` (opaque string, base64-encoded last-seen ID + timestamp).
2. Add `parsePaginationParams(url)` to `validation.js` — returns `{ limit, cursor }` with defaults and clamping.
3. Update each in-memory repository to apply `limit` and return a `nextCursor`.
4. Update each Postgres repository to use `WHERE id > $cursor ORDER BY id LIMIT $limit`.
5. Wrap list responses: `{ items: [...], count: N, nextCursor: "..." | null }`.
6. Add pagination tests for boundary conditions (empty list, exactly limit, exactly limit+1).

**Definition of done:** All list endpoints accept `?limit=N&cursor=X`; response includes `nextCursor`.

**Status:** `open`

---

### T2-04 — Transaction wrapper on multi-step writes

**Dimension:** Data Layer
**Current state:** `createRecommendation` and `writeAuditLog` are two separate async operations with no transaction. If the audit log write fails, the recommendation exists without an audit trail — permanently inconsistent state.
**Files:** `backend/src/domains/execution/service.js`, `backend/src/domains/execution/repository.js`
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Add `withTransaction(pool, callback)` helper in `db.js` — acquires a client, calls `BEGIN`, runs the callback with the client's `query`, calls `COMMIT` on success or `ROLLBACK` on failure, releases the client.
2. Wrap `createRecommendation → writeAuditLog` in a single transaction.
3. Wrap `updateRecommendationStatus → writeAuditLog` similarly.
4. Wrap `createTaskFromRecommendation → updateRecommendation.taskId → writeAuditLog`.
5. In-memory repository requires no change (it is already synchronous and atomic).

**Definition of done:** An intentionally failing audit log write causes the recommendation create to roll back; no orphan recommendation exists.

**Status:** `open` (depends on T1-01)

---

### T2-05 — Real DB integration tests in CI

**Dimension:** Testing / QC
**Current state:** Every test uses the in-memory repository. The Postgres code path (`createPostgresExecutionRepository`, `createPostgresModuleRunRepository`) has never been exercised in CI. Schema migrations may diverge from the code without detection.
**Files:** New `backend/src/integration-tests/` directory, CI configuration
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Add a `docker-compose.test.yml` at root: spins up `postgres:16-alpine` on port 5433, applies migrations via `psql -f supabase/migrations/*.sql`.
2. Create `backend/src/integration-tests/execution-postgres.test.js` — same lifecycle as `execution-lifecycle.test.js` but with a real `pg.Pool` injected into context.
3. Create `backend/src/integration-tests/persistence-postgres.test.js` — verifies each of the 18 module `persistRun` functions actually writes and reads from Postgres.
4. Add `npm run test:integration` script: `docker-compose -f docker-compose.test.yml up -d && node integration-tests/runner.js && docker-compose down`.
5. Wire into CI: `npm run ci` = syntax check + lint + unit tests + integration tests.

**Definition of done:** `npm run test:integration` passes against a real Postgres instance; schema drift causes a test failure.

**Status:** `open`

---

### T2-06 — OpenAPI specification

**Dimension:** API Design · Documentation · Developer Experience
**Current state:** 24 routes with no machine-readable contract. No SDK generation, no Postman collection, no contract testing.
**Files:** New `docs/backend/reference/OPENAPI.yaml`, `backend/src/server.js`
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Write `docs/backend/reference/OPENAPI.yaml` — OpenAPI 3.1 spec covering all 24 routes, all request/response schemas, all error codes, authentication scheme (Bearer JWT).
2. Add a `/v1/openapi.json` route in `server.js` that serves the spec as JSON (read from file at startup).
3. Add `GET /v1/docs` that serves Swagger UI (single HTML file, no npm dependency — embed the CDN URL with SRI hash).
4. Add contract test: verify every route in `AVAILABLE_ROUTES` has a corresponding entry in the OpenAPI spec.
5. Update DOC_CATALOGUE.md and README Key docs table.

**Definition of done:** `GET /v1/openapi.json` returns a valid OpenAPI 3.1 document; `GET /v1/docs` renders Swagger UI.

**Status:** `open`

---

### T2-07 — Code coverage gate in CI

**Dimension:** Testing / QC
**Current state:** No coverage measurement. Unknown what percentage of code is exercised by the 29 test suites.
**Files:** `package.json`, `.nycrc` or `c8` config
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `c8` as a devDependency (`npm install --save-dev c8`).
2. Update `npm run test:backend:ci` to `c8 --threshold 80 node backend/src/full-backend-validation.test.js`.
3. Add `.c8rc` config: `{ "exclude": ["**/*.test.js"], "reporter": ["text", "lcov"], "threshold": 80 }`.
4. Add `coverage/` to `.gitignore`.
5. Raise threshold incrementally to 90% as integration tests are added (T2-05).

**Definition of done:** `npm run ci` fails when line coverage drops below 80%.

**Status:** `open`

---

### T2-08 — Input string length validation

**Dimension:** Code Quality · Security
**Current state:** `validateRecommendationCreateBody` checks field types but applies no maximum length constraints. Titles, summaries, and actor names are unbounded — a 10MB title would pass validation and be stored in the DB.
**Files:** `backend/src/api/validation.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `assertStringMaxLength(value, maxLen, code, label)` helper.
2. Apply limits: `title` ≤ 500 chars, `summary` ≤ 5000 chars, `actionType` ≤ 100 chars, `actor` ≤ 255 chars, `nextStatus` ≤ 50 chars.
3. Add `assertStringMaxLength` to the existing `assertString` call chain — no new function invocations needed.
4. Add validation tests for each over-limit field.

**Definition of done:** A 600-character title returns 400 `invalid_recommendation_title`.

**Status:** `open`

---

### T2-09 — Architecture decision records (ADRs)

**Dimension:** Documentation · Architecture
**Current state:** Three non-obvious architectural decisions have no documented rationale: zero runtime npm dependencies, pure `node:http` (no Express/Fastify), and in-memory default for repositories. Future contributors may reverse these without understanding the tradeoffs.
**Files:** New `docs/backend/decisions/` entries
**Effort:** M · **Risk:** low

**Implementation steps:**
Write three ADR files:
1. `ADR_001_ZERO_RUNTIME_DEPENDENCIES.md` — rationale: eliminates dependency-chain CVEs, guarantees cold-start speed, forces explicit over implicit; tradeoff: no ecosystem middleware.
2. `ADR_002_PURE_NODE_HTTP.md` — rationale: zero framework lock-in, full HTTP control, pairs with zero-dependency philosophy; tradeoff: manual routing boilerplate.
3. `ADR_003_IN_MEMORY_DEFAULT_REPOSITORY.md` — rationale: allows CI without a database, enables deterministic test isolation; tradeoff: data loss on restart (documented P0-2).

Each ADR format: Status · Context · Decision · Consequences · Alternatives considered.

Update `DOC_CATALOGUE.md`.

**Definition of done:** Three ADR files committed; each cites the specific tradeoffs.

**Status:** `open`

---

### T2-10 — Operational runbook

**Dimension:** DevOps / Observability · Documentation
**Current state:** No documented procedure for on-call scenarios: Render cold-start, DB unreachable, SERP provider rate-limited, Supabase outage.
**Files:** New `docs/backend/reference/RUNBOOK.md`
**Effort:** M · **Risk:** low

**Implementation steps:**
Write `RUNBOOK.md` covering:
1. **Cold-start latency** — Render free tier spins down after 15 min. First request takes 10–30s. Expected behavior. Mitigation: UptimeRobot 5-min ping keeps it warm.
2. **DB unreachable** — `/health` returns 503. In-memory fallback activates. Data created during outage is lost when DB reconnects. Recovery: restart Render service after DB recovers.
3. **SERP provider rate-limited** — module runs return `integration_not_connected` for SERP-dependent modules. Non-SERP modules continue. No manual action required; provider limit resets.
4. **Supabase outage** — same as DB unreachable. Monitor at status.supabase.com.
5. **Force restart Render** — dashboard → service → Manual Deploy → latest commit.
6. **Rotate credentials** — step-by-step for `SUPABASE_ANON_KEY` rotation and Render dashboard env var update.

Update `DOC_CATALOGUE.md`.

**Definition of done:** Runbook covers all five scenarios with explicit steps.

**Status:** `open`

---

## Tier 3 — Enterprise elite

These transform Neural Rank from a solid indie backend into infrastructure that can serve enterprise clients at scale.

---

### T3-01 — Async module execution with job queue

**Dimension:** Scalability · Architecture
**Current state:** `/v1/run/default` runs all 18 modules synchronously within a single HTTP request. A slow SERP or PageSpeed adapter call (3–10s) holds the connection open. Under load, this exhausts the event loop.
**Effort:** XL · **Risk:** high

**Implementation steps:**
1. Add Redis (Render free tier does not include Redis — use Upstash free tier, 10k commands/day).
2. Add BullMQ (or a zero-dependency custom queue backed by Redis LPUSH/BRPOP) as a devDependency.
3. Change `/v1/run/default` and `/v1/run/activation-aware` to enqueue a job and return `{ jobId, status: "queued" }` with HTTP 202.
4. Add `GET /v1/jobs/:jobId` — polls job state (queued / running / completed / failed).
5. Add optional webhook: caller can provide `callbackUrl` in request body; worker POSTs result when complete.
6. Worker process runs in a separate Node.js process (`backend/src/worker.js`), started alongside the server.
7. Module-level `/run/:key` endpoints (single module) remain synchronous — acceptable for targeted single-module calls.

**Definition of done:** `/v1/run/default` returns 202 immediately; result is available at `/v1/jobs/:jobId` within N seconds.

**Status:** `open`

---

### T3-02 — OpenTelemetry distributed tracing

**Dimension:** DevOps / Observability
**Current state:** No tracing. Cannot see how time is spent across 18 modules in a single run; cannot identify which adapter is the bottleneck.
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Add `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node` as devDependencies.
2. Create `backend/src/telemetry.js` — initializes OTel SDK with OTLP exporter pointing to `OTEL_EXPORTER_OTLP_ENDPOINT` env var.
3. Instrument `server.js` request handler: create a root span per request with `correlationId` as span attribute.
4. Instrument each module `run()` call: create a child span named `module.<moduleKey>`.
5. Instrument each external adapter call (SERP, GSC, GA4): create a child span named `adapter.<adapterKey>`.
6. Export to Grafana Cloud free tier (14-day retention, 50GB traces/month free).
7. Add `OTEL_EXPORTER_OTLP_ENDPOINT` to `.env.example` and `render.yaml`.

**Definition of done:** A single `/v1/run/default` call produces a waterfall trace showing time per module in Grafana.

**Status:** `open`

---

### T3-03 — Prometheus-compatible metrics endpoint

**Dimension:** DevOps / Observability · Scalability
**Current state:** No metrics. No visibility into request latency, error rate, module execution time, or queue depth.
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Track in-process (no npm dependency): request count by route and status, p50/p95/p99 latency histograms (use a simple reservoir sampler), error count by error code, module execution time per module key, rate limit hit count.
2. Add `GET /v1/metrics` — returns Prometheus text format (no auth required for scraping from internal network; Render does not expose this externally unless you add a route).
3. Add scrape target to Grafana Cloud (free tier allows 10k active series).
4. Create a Grafana dashboard: request rate, error rate, p99 latency per route, module execution time heatmap.

**Definition of done:** `GET /v1/metrics` returns valid Prometheus text; Grafana dashboard shows live data.

**Status:** `open`

---

### T3-04 — Redis-backed rate limiter

**Dimension:** Scalability · Security
**Current state:** In-memory rate limiter resets on every Render restart and cannot work across multiple instances. `X-Forwarded-For` is trusted without validation — clients can forge their IP.
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Create `backend/src/core/redisRateLimiter.js` — same API as `rateLimiter.js` but backed by Redis `INCR` + `EXPIRE` (sliding window).
2. In `server.js`, detect `REDIS_URL` env var: if present, use Redis rate limiter; if absent, fall back to in-memory (local dev/CI unchanged).
3. Harden `getIpKey`: validate `X-Forwarded-For` against a known proxy allowlist (Render's proxy CIDR range); fall back to `request.socket.remoteAddress` if the header is spoofed.
4. Add `REDIS_URL` to `.env.example` and `render.yaml`.
5. Add rate limit integration tests: hammer 121 requests in a window; assert 121st returns 429.

**Definition of done:** Rate limit state survives a process restart; forged `X-Forwarded-For` does not bypass IP limit.

**Status:** `open`

---

### T3-05 — Response caching layer

**Dimension:** Scalability
**Current state:** Identical module runs repeat full computation. Keyword analysis, topical authority, and SERP analysis are deterministic for the same input and could be cached.
**Effort:** L · **Risk:** medium

**Implementation steps:**
1. Cache key: `sha256(moduleKey + JSON.stringify(sortedInput))`.
2. Cache store: Redis (from T3-04) with TTL configurable per module (default 5 min; SERP results 15 min; rank tracking 1 hr).
3. Add `Cache-Control: max-age=<ttl>` and `ETag: <cacheKey>` to cached responses.
4. Honour `Cache-Control: no-cache` request header to bypass cache.
5. Add `X-Cache: HIT | MISS` response header for observability.
6. Module-level single runs only — do not cache full `/run/default` flow (too many dimensions).

**Definition of done:** Second identical module run returns `X-Cache: HIT` and responds in < 5ms.

**Status:** `open`

---

### T3-06 — Docker and docker-compose local dev

**Dimension:** Developer Experience
**Current state:** Local dev requires manually managing Node version, env vars, and no PostgreSQL setup path. New contributors cannot get a running environment in under 10 minutes.
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Create `Dockerfile` — `node:20-alpine`, non-root user, `COPY package*.json`, `npm ci --omit=dev`, `COPY backend/ backend/`, `CMD ["node", "backend/src/server.js"]`.
2. Create `docker-compose.yml` — services: `api` (built from Dockerfile), `postgres` (postgres:16-alpine), `redis` (redis:7-alpine). Wires `DATABASE_URL` and `REDIS_URL` automatically.
3. Create `docker-compose.test.yml` — postgres only, for integration tests.
4. Add `.dockerignore` — exclude `node_modules`, `.env`, `design/`, `ui/`, `app/`, `docs/`.
5. Update README with a quickstart: `git clone → cp .env.example .env → docker-compose up → open /health`.
6. Add `.nvmrc` with `20` and `"engines": { "node": ">=20" }` in `package.json`.

**Definition of done:** `docker-compose up` produces a running API on port 10000 connected to a local Postgres and Redis with no manual steps.

**Status:** `open`

---

### T3-07 — Pre-commit hooks via Husky

**Dimension:** Developer Experience · Code Quality
**Current state:** `npm run ci` is a pre-push convention documented in CONTRIBUTING.md only. Nothing enforces it. Contributors can push without running CI.
**Effort:** S · **Risk:** low

**Implementation steps:**
1. `npm install --save-dev husky`.
2. `npx husky init` — creates `.husky/` directory.
3. `.husky/pre-commit` — runs `npm run lint` (fast; catches ESLint errors before commit).
4. `.husky/pre-push` — runs `npm run ci` (full suite including tests).
5. Add `"prepare": "husky"` to `package.json` scripts so `npm install` auto-installs hooks.
6. Update CONTRIBUTING.md to note hooks are automatic.

**Definition of done:** A commit with an ESLint error is blocked; a push with a failing test is blocked.

**Status:** `open`

---

### T3-08 — Staging environment

**Dimension:** DevOps / Observability
**Current state:** Every push to `main` deploys directly to the production Render service. No verification before live traffic.
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Create a second Render service `neural-rank-backend-staging` on the same free account (Render allows multiple free services).
2. Point it to the `staging` branch (`autoDeploy: true` on `staging`).
3. Add a GitHub Actions workflow `ci.yml`: on PR, run `npm run ci`; on merge to `staging`, trigger Render staging deploy; add a smoke test step: `curl /health` must return 200.
4. Promote `staging → main` manually when staging smoke tests pass.
5. Update CONTRIBUTING.md: PRs target `staging`; `main` is production-only.

**Definition of done:** Every PR runs CI and deploys to staging before any code touches production.

**Status:** `open`

---

### T3-09 — Connection pooling and pool health monitoring

**Dimension:** Data Layer · Scalability
**Current state:** When DB is wired (T1-01), a single `pg.Pool` is used but not tuned. Supabase free tier allows ≤60 connections total. No pool health metrics.
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Configure `pg.Pool` with: `max: 5`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`.
2. Add pool event listeners: `pool.on('error', ...)` — log structured JSON; `pool.on('connect', ...)` — increment a metric counter.
3. Expose pool stats (`totalCount`, `idleCount`, `waitingCount`) in `/v1/health` response.
4. Add a pool exhaustion test: spin up 6 concurrent requests requiring DB; assert the 6th waits (does not throw) and resolves within timeout.

**Definition of done:** Pool stats visible in `/v1/health`; 6 concurrent DB requests do not cause connection errors.

**Status:** `open`

---

### T3-10 — Module scaffolding code generator

**Dimension:** Developer Experience
**Current state:** Adding a new module requires manually creating 5 files (service/analysis/insights/actions/repository) following the exact contract. Easy to miss a file or diverge from the pattern.
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Create `scripts/scaffold-module.js <moduleKey> <displayName>` — generates all 5 files from templates with correct exports, imports, and placeholder logic.
2. Registers the module in `core/moduleCatalog.js` automatically.
3. Generates a `service.test.js` with the three required test cases (happy path, adapter fallback, persistence path) stubbed out.
4. Prints a checklist of manual steps remaining (implement analysis logic, write migration if needed).
5. Add `npm run scaffold -- <moduleKey> <displayName>` to `package.json` scripts.

**Definition of done:** `npm run scaffold -- local_seo_v2 "Local SEO v2"` produces 6 files that pass `npm run ci` immediately (stubbed but structurally valid).

**Status:** `open`

---

### T3-11 — ETag and conditional request support

**Dimension:** API Design · Scalability
**Current state:** No `ETag` or `Last-Modified` headers. Clients must re-fetch full lists even when nothing has changed. Wastes bandwidth and compute.
**Effort:** M · **Risk:** low

**Implementation steps:**
1. For list endpoints, compute `ETag` as `sha256(JSON.stringify(sortedIds + latestUpdatedAt))`.
2. Add `ETag` header to all list responses.
3. In request handler, check `If-None-Match` header: if it matches, return 304 with no body.
4. Add `Cache-Control: private, max-age=0, must-revalidate` to list endpoints.
5. Add tests: first GET returns 200 + ETag; second GET with `If-None-Match` returns 304; after creating a new item, the ETag changes.

**Definition of done:** Clients receive 304 on unchanged lists; ETag changes when list changes.

**Status:** `open`

---

### T3-12 — Flutter ApiRepository implementation

**Dimension:** Scalability · Developer Experience
**Current state:** `app/` uses `MockRepository` — no real API calls are made. The production app cannot communicate with the 24-route backend. Play Store blocked until this is resolved (P0-4/P0-5).
**Effort:** XL · **Risk:** high

**Implementation steps:**
1. Add `dio` and `flutter_secure_storage` to `app/pubspec.yaml`.
2. Create `app/lib/data/api/neural_rank_client.dart` — Dio client configured with base URL from `--dart-define=API_BASE_URL`, Bearer token injection interceptor, retry on 5xx (3 attempts, exponential backoff), request timeout 30s.
3. Create `app/lib/data/repositories/api_repository.dart` — implements the same abstract `Repository` interface as `MockRepository`; calls all 24 backend routes.
4. Wire `ApiRepository` as default in `main.dart` via `kDebugMode` flag: debug = Mock, release = Api.
5. Implement Supabase auth flow in Flutter: `supabase_flutter` package, sign-in screen, store session token in `flutter_secure_storage`, inject into Dio interceptor.
6. Add API error handling in BLoC layer: map `{ ok: false, error: { code, message } }` to typed `Failure` states.
7. Test on a real device against the Render staging endpoint before Play Store submission.

**Definition of done:** Release build of `app/` communicates with `neural-rank-backend.onrender.com`; MockRepository retained for debug/test builds only.

**Status:** `open`

---

## Progress tracker

| ID | Item | Tier | Status | Effort |
|---|---|---|---|---|
| T1-01 | Wire PostgreSQL at startup | 1 | `open` | M |
| T1-02 | Fix prototype pollution | 1 | `open` | S |
| T1-03 | Workspace isolation | 1 | `open` | L |
| T1-04 | CORS headers | 1 | `open` | S |
| T1-05 | Security response headers | 1 | `open` | S |
| T1-06 | Request access log | 1 | `open` | S |
| T1-07 | Fix rate limit doc discrepancy | 1 | `open` | S |
| T1-08 | Real /health checks | 1 | `open` | S |
| T2-01 | Correlation IDs | 2 | `open` | S |
| T2-02 | API versioning /v1/ | 2 | `open` | M |
| T2-03 | Pagination on list endpoints | 2 | `open` | L |
| T2-04 | Transaction wrapper | 2 | `open` | M |
| T2-05 | Real DB integration tests | 2 | `open` | L |
| T2-06 | OpenAPI specification | 2 | `open` | L |
| T2-07 | Coverage gate in CI | 2 | `open` | S |
| T2-08 | Input string length limits | 2 | `open` | S |
| T2-09 | Architecture decision records | 2 | `open` | M |
| T2-10 | Operational runbook | 2 | `open` | M |
| T3-01 | Async module execution + queue | 3 | `open` | XL |
| T3-02 | OpenTelemetry tracing | 3 | `open` | L |
| T3-03 | Prometheus metrics endpoint | 3 | `open` | L |
| T3-04 | Redis rate limiter | 3 | `open` | M |
| T3-05 | Response caching | 3 | `open` | L |
| T3-06 | Docker + docker-compose | 3 | `open` | M |
| T3-07 | Pre-commit hooks (Husky) | 3 | `open` | S |
| T3-08 | Staging environment | 3 | `open` | M |
| T3-09 | Connection pool tuning | 3 | `open` | S |
| T3-10 | Module scaffolding generator | 3 | `open` | M |
| T3-11 | ETag / conditional requests | 3 | `open` | M |
| T3-12 | Flutter ApiRepository | 3 | `open` | XL |

**Total: 30 items** — 8 × Tier 1 · 10 × Tier 2 · 12 × Tier 3

---

## Projected score after each tier

| After | Code | Arch | API | Docs | DX | QC | Security | Data | DevOps | Scale | Overall |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Current | 88 | 82 | 83 | 90 | 80 | 78 | 72 | 70 | 65 | 55 | **76** |
| Tier 1 done | 91 | 82 | 87 | 92 | 80 | 78 | 90 | 82 | 78 | 62 | **82** |
| Tier 2 done | 93 | 90 | 95 | 98 | 85 | 92 | 90 | 90 | 85 | 70 | **91** |
| Tier 3 done | 98 | 98 | 98 | 98 | 98 | 98 | 98 | 98 | 98 | 96 | **98** |

---

## How to use this document

1. Pick the next open item from Tier 1 (work top-to-bottom within each tier).
2. Set status to `in_progress` when work begins.
3. When the item is resolved: set status to `resolved`, add the commit SHA and date.
4. Update `PRODUCTION_READINESS_GAPS.md` if the item maps to a P0/P1/P2 gap.
5. Add a `CHANGELOG.md` entry when a tier is fully complete.
6. When all Tier 1 items are resolved, regrade the Security, Data, and DevOps dimensions.
