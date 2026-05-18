# Neural Rank — Enterprise Rebuild Plan

Working document for closing every gap identified in the 2026-05-18 enterprise grading audit,
the 2026-05-18 reaudit that found 21 additional gaps, the 2026-05-18 DOC_CATALOGUE anchor
audit that found 10 additional gaps (bringing total from 61 to 71 items), and the
2026-05-18 full 82-doc deterministic catalogue read that found 5 additional gaps (bringing
total from 71 to 76 items).

Current overall grade: **B- (76/100)**
Target: **A+ (≥98/100)** — final 2 points require external validation (pen test, compliance audit) beyond code scope.

Each item is assigned:
- **Status** — `open` · `in_progress` · `resolved`
- **Effort** — S (< 1 hr) · M (1–4 hrs) · L (4–12 hrs) · XL (1–3 days)
- **Risk** — low · medium · high

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

## Tier 1 — Production blockers

Gaps that create data loss, live security vulnerabilities, or misleading system state.
None require architectural rewrites. All Tier 1 items must be resolved before Tier 2 begins.

---

### T1-01 — Wire PostgreSQL connection at server startup

**Dimension:** Data Layer · Scalability
**Current state:** `createPostgresExecutionRepository` exists but `query` is never injected into `baseContext` at startup. Every byte of execution data lives in RAM and is wiped on every Render restart (~15 min inactivity on free tier).
**Files:** `backend/src/server.js`, new `backend/src/db.js`
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Create `backend/src/db.js` — exports a `pg.Pool` configured from `DATABASE_URL`. Pool size 5 (Supabase free tier ≤60 connections). Graceful no-op when `DATABASE_URL` is absent.
2. In `startServer()`, call `pool.query('SELECT 1')` to verify connectivity before binding the port.
3. Pass `{ query: (sql, params) => pool.query(sql, params) }` into `baseContext` so all domain repositories resolve to the Postgres path automatically.
4. Log `{ kind: "db_connected", host }` on success; log warning and continue when absent.
5. Add DB probe to `/health` — see T1-08.

**Definition of done:** Restart Render; create a recommendation; cold-start the service again; recommendation is still present.

**Status:** `open`

---

### T1-02 — Fix prototype pollution in buildRequestContext

**Dimension:** Security · Code Quality
**Current state:** `buildRequestContext` spreads user-supplied `body.context` directly. A payload `{ "context": { "__proto__": { "isAdmin": true } } }` pollutes `Object.prototype` for the entire process lifetime.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Replace the spread of `bodyContext` with an allowlist copy: extract only known-safe keys (`workspaceId`, `clientId`, `targetRef`, `websiteUrl`, `appId`) from `bodyContext`.
2. Add a test: send `{ "context": { "__proto__": { "polluted": true } } }`; assert `({}).polluted` is `undefined` after the request.

**Definition of done:** Prototype unpolluted after request with `__proto__` in body.context.

**Status:** `open`

---

### T1-03 — Add workspace isolation enforcement + RLS audit

**Dimension:** Security · Architecture · Data Layer
**Current state:** `requireWorkspace` is defined but never called. Any authenticated actor can read any other workspace's data. Additionally, the 33 existing tables from 9 previous migrations have not been audited for RLS enablement — new isolation policies added without auditing existing tables leaves historical data exposed.
**Files:** `backend/src/api/auth.js`, `backend/src/server.js`, `supabase/migrations/` (new migration), all execution/measurement repository files
**Effort:** L · **Risk:** high

**Implementation steps:**
1. **RLS audit first:** Run `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'app_public'` against the Supabase DB. For every table where `rowsecurity = false`, add it to the migration in step 2.
2. Write migration `20260519_workspace_isolation.sql`:
   - Add `workspace_id UUID NOT NULL DEFAULT gen_random_uuid()` to `recommendations`, `tasks`, `task_status_history`, `audit_logs`, `measurement_snapshots`, `attribution_links`.
   - Add index on `workspace_id` for each.
   - Enable RLS on all 33 tables: `ALTER TABLE app_public.<table> ENABLE ROW LEVEL SECURITY`.
   - Add RLS policy per table: `USING (workspace_id = current_setting('app.workspace_id')::uuid)`.
3. In `server.js`, call `requireWorkspace(identity)` on all execution and measurement mutation routes.
4. Pass `workspaceId` into all list queries as a WHERE filter.
5. Update in-memory repository to filter by `workspaceId` so tests remain valid.
6. Test: actor A creates recommendation in workspace A; actor B in workspace B cannot read it.

**Definition of done:** Cross-workspace data leakage impossible; all 33 tables have RLS enabled.

**Status:** `open`

---

### T1-04 — Add CORS headers

**Dimension:** Security · API Design
**Current state:** No `Access-Control-Allow-*` headers. Any origin can make cross-origin requests from a browser.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `ALLOWED_ORIGIN` env var (default `*` for dev; production = Flutter web or dashboard domain).
2. In `sendEnvelope`, add `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`.
3. Add an `OPTIONS` preflight handler at the top of `createRequestHandler` — return 204 with CORS headers.
4. Add `ALLOWED_ORIGIN` to `.env.example` and `render.yaml`.

**Definition of done:** Preflight OPTIONS returns 204; all responses carry correct CORS headers.

**Status:** `open`

---

### T1-05 — Add security response headers

**Dimension:** Security
**Current state:** No security headers. Missing `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add to `sendEnvelope` headers:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-XSS-Protection: 0`
   - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
2. Add a test asserting all six headers are present on every response.

**Definition of done:** `curl -I /health` returns all six headers.

**Status:** `open`

---

### T1-06 — Add request access log

**Dimension:** DevOps / Observability
**Current state:** Successful requests are completely silent. Only errors produce log output.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. At top of `createRequestHandler`, record `const startedAt = Date.now()`.
2. On `response.on('finish')`, emit: `{ kind: "request", method, path, status, durationMs, correlationId, actor, ip }`.
3. Never log the Authorization header value or request body.

**Definition of done:** Every request produces a structured JSON log line with duration.

**Status:** `open`

---

### T1-07 — Fix rate limit documentation discrepancy

**Dimension:** Code Quality · Documentation
**Current state:** `rateLimiter.js` exports `DEFAULT_LIMIT = 120`. README says "60 req/min". Code is authoritative — README is wrong.
**Files:** `README.md`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Update README backend table: 120 req/min (default), 30 req/min (mutations).
2. Search all other docs for "60 req/min" and correct.

**Definition of done:** Code and all docs agree on 120/30.

**Status:** `open`

---

### T1-08 — Harden /health to report real system state

**Dimension:** DevOps / Observability
**Current state:** `/health` returns `{ deployable: true }` hardcoded. A broken instance appears healthy to load balancers.
**Files:** `backend/src/server.js`, `backend/src/db.js`
**Effort:** S · **Risk:** low · **Depends on:** T1-01

**Implementation steps:**
1. Run `SELECT 1` with 2s timeout in `buildHealthPayload`.
2. Report `checks: { db: "pass" | "fail" | "not_configured", http: "pass" }`.
3. Return HTTP 503 when DB check fails.

**Definition of done:** Disconnecting DB causes `/health` to return 503.

**Status:** `open`

---

### T1-09 — Harden auth against SUPABASE_URL env var removal

**Dimension:** Security
**Current state:** `auth.js:54` — when `SUPABASE_URL` is absent, the server falls back to trusting the `x-neural-rank-actor` header for all mutations. If this env var is accidentally removed from the Render dashboard, production loses all authentication silently. Any caller who sends `x-neural-rank-actor: admin` gains full mutation access.
**Files:** `backend/src/api/auth.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add an environment assertion at module load time: if `NODE_ENV === 'production'` and `SUPABASE_URL` is absent, log a structured warning `{ kind: "auth_degraded", reason: "SUPABASE_URL not set — actor-header fallback active" }`.
2. In `resolveRequestIdentity`, when `SUPABASE_URL` is absent and `NODE_ENV === 'production'`, return `null` for all requests rather than activating the fallback. This forces all mutation callers to fail with 401 in production if auth is misconfigured, making the failure visible rather than silently degrading to no-auth.
3. The actor-header fallback remains available in `NODE_ENV !== 'production'` (local dev, CI) — no change to existing test paths.
4. Add `NODE_ENV=production` to `render.yaml` env vars.
5. Add test: with `NODE_ENV=production` and no `SUPABASE_URL`, mutation request without Bearer token returns 401.

**Definition of done:** Removing `SUPABASE_URL` from Render causes all mutations to return 401 immediately rather than silently accepting actor-header auth.

**Status:** `open`

---

### T1-10 — Harden X-Forwarded-For IP validation

**Dimension:** Security
**Current state:** `rateLimiter.js:37-41` — `getIpKey` blindly takes the first value from `X-Forwarded-For` with no validation. Any caller can set `X-Forwarded-For: 1.1.1.1` and bypass per-IP rate limiting entirely. This applies to the current in-memory rate limiter, not just the future Redis one.
**Files:** `backend/src/core/rateLimiter.js`
**Effort:** S · **Risk:** low

**Note:** T3-04 (Redis rate limiter) originally contained this fix but it was incorrectly placed — the vulnerability exists now in the live rate limiter regardless of the backing store.

**Implementation steps:**
1. Add `TRUSTED_PROXY_COUNT` env var (default `1` — Render uses one proxy layer).
2. In `getIpKey`, parse `X-Forwarded-For` as a comma-split array; take the IP at index `[array.length - TRUSTED_PROXY_COUNT]` — this is the last untrusted IP before Render's known proxy.
3. Validate the result is a valid IP format (basic regex); fall back to `request.socket.remoteAddress` if it fails.
4. Add `TRUSTED_PROXY_COUNT` to `.env.example`.
5. Add test: a request with a forged `X-Forwarded-For` value is rate-limited by `socket.remoteAddress`, not by the forged value.

**Definition of done:** Forged `X-Forwarded-For` header does not bypass IP rate limiting.

**Status:** `open`

---

### T1-11 — Add secrets scanning to CI

**Dimension:** Security · DevOps
**Current state:** No automated gate preventing credential commits. The history was manually scrubbed once (P0-1) but nothing prevents a future accidental commit of a JWT, DB password, or API key.
**Files:** `package.json`, `.gitignore`, new `scripts/check-secrets.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Write `scripts/check-secrets.js` — scans all staged/committed files for patterns: JWT format (`eyJ[A-Za-z0-9._-]{20,}`), common password patterns (`password\s*[:=]\s*\S{8,}`), Supabase anon key format, generic API key patterns (`[Aa][Pp][Ii][-_][Kk][Ee][Yy]\s*[:=]\s*\S{16,}`).
2. Add `npm run check:secrets` script: `node scripts/check-secrets.js`.
3. Wire into `npm run ci`: `npm run check && npm run check:secrets && npm run lint && npm run test:backend:ci`.
4. Also wire into `.husky/pre-commit` once T3-07 is done.
5. Add known false-positive patterns to an allowlist (e.g., the `eyJ` pattern in test fixtures).

**Definition of done:** `npm run ci` fails if a file containing a JWT-shaped string is staged; the allowlist prevents false positives on test files.

**Status:** `open`

---

### T1-12 — Fix README HTTPS discrepancy

**Dimension:** Documentation · Code Quality
**Current state:** README lists the health endpoint as `https://neural-rank-backend.onrender.com/health` (correct), but internal cross-references in some docs still use `http://`. Minor factual error in the primary project document.
**Files:** `README.md`, any other docs with the HTTP URL
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Grep all `.md` files for `http://neural-rank-backend` (not `https://`).
2. Replace every occurrence with `https://neural-rank-backend`.
3. Verify README and RUNBOOK (T2-10) both use HTTPS consistently.

**Definition of done:** Zero occurrences of `http://neural-rank-backend` in any tracked file.

**Status:** `open`

---

### T1-13 — Add LICENSE file

**Dimension:** Legal · Documentation
**Current state:** No `LICENSE` file exists in the repository. This means: (a) the project is technically "all rights reserved" by default under copyright law; (b) enterprise clients cannot legally use, modify, or contribute to the code without explicit permission; (c) any open-source contributor has no clarity on terms. This is a blocker for any commercial or enterprise engagement.
**Files:** New `LICENSE`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Decide on license type: MIT (permissive, recommended for maximum adoption), Apache 2.0 (permissive with patent protection), or proprietary (restrictive, suitable if this is a commercial SaaS product not intended for redistribution).
2. Create `LICENSE` at the repo root with the chosen license text and correct copyright year and holder name.
3. Add a `"license"` field to `package.json` matching the chosen license identifier (e.g., `"MIT"`).
4. Add a one-line license reference to the README header.

**Definition of done:** `LICENSE` file exists; `package.json` declares the same license identifier; README references it.

**Status:** `open`

---

### T1-14 — Add NODE_ENV=production to render.yaml

**Dimension:** Security · DevOps
**Current state:** `render.yaml` does not set `NODE_ENV`. This means T1-09 (auth bypass hardening) will not function in production — the auth bypass guard uses `NODE_ENV === 'production'` to decide whether to reject unauthenticated mutation requests, but if NODE_ENV is never set, the check never fires and the auth bypass remains exploitable even after T1-09 is coded.
**Files:** `render.yaml`, `.env.example`
**Effort:** S · **Risk:** low

**Note:** This item is a hard dependency of T1-09. T1-09 must not be marked resolved until this item is also resolved.

**Implementation steps:**
1. Add to `render.yaml` envVars: `- key: NODE_ENV` with `value: production` (this is not a secret — it is safe to commit the value).
2. Add `NODE_ENV=production` to `.env.example` with a comment: "Set to 'production' on Render; leave as 'development' for local dev".
3. Verify that setting `NODE_ENV=production` does not break any existing tests (tests set their own env or rely on absence of SUPABASE_URL to select the dev auth path).

**Definition of done:** `render.yaml` includes `NODE_ENV: production`; `.env.example` documents it; T1-09 auth guard fires correctly in a local test with `NODE_ENV=production`.

**Status:** `open`

---

### T1-15 — Fix verifySupabaseToken network error handling

**Dimension:** Security
**Current state:** `auth.js:22` — the catch block in `verifySupabaseToken` returns `null` on any error, including network failures. This means a transient Supabase outage or DNS failure is treated identically to an invalid token. Consequence: during a Supabase network blip, all authenticated requests are rejected with 401 even if the token is valid — a denial-of-service against legitimate users. Additionally, `if (!res.ok) return null` treats HTTP 5xx from Supabase (server errors) the same as HTTP 401 (invalid token), making failures invisible.
**Files:** `backend/src/api/auth.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Distinguish error categories in `verifySupabaseToken`:
   - HTTP 401/403 from Supabase → token invalid → return `null` (correct)
   - HTTP 5xx from Supabase → Supabase is down → throw a new `ApiError("auth_service_unavailable", ..., 503)` so the caller gets a 503, not a 401
   - Network error (fetch throws) → throw `ApiError("auth_service_unavailable", ..., 503)`
2. In `resolveRequestIdentity`, catch `auth_service_unavailable` specifically — propagate as 503 so the client knows to retry, not to assume the token is invalid.
3. Add test: mock `fetch` to throw a network error; assert the response is 503 not 401.

**Definition of done:** Supabase network failure returns 503 to the caller; invalid token still returns 401.

**Status:** `open`

---

### T1-16 — Fix governance resultModel classification bug

**Dimension:** Code Quality · Architecture
**Current state:** `domains/governance/resultModel.js:42-43` — `requiresApproval` is set to `true` when `overallClassification === "block"`. This is a logic error: a "block" classification means the action should be auto-rejected and must not proceed at all. Setting `requiresApproval = true` on a blocked action implies a human reviewer could approve it — which contradicts the entire point of the "block" level. This could allow blocked SEO actions (keyword stuffing, hidden text, mass deindexing) to reach the approval queue and be approved by a reviewer who does not understand the governance classification.
**Files:** `backend/src/domains/governance/resultModel.js`
**Effort:** S · **Risk:** medium

**Implementation steps:**
1. Fix line 42-43: `requiresApproval` should be `overallClassification === "require_approval"` only — not `|| overallClassification === "block"`.
2. Verify the governance service correctly rejects approval attempts for blocked recommendations — `assertGovernanceAllowsApproval()` in `governance/service.js` already throws if `isBlocked`, so the server-side guard is correct. This fix ensures the result model accurately reflects the classification.
3. Update any test that expects `requiresApproval: true` for blocked recommendations.
4. Add a specific test: a governance result with `overallClassification === "block"` must have `requiresApproval === false` and `isBlocked === true`.

**Definition of done:** `resultModel` sets `requiresApproval: false` for "block" classifications; test confirms the fix.

**Status:** `open`

---

### T1-17 — Add pre-persist governance block gate in createRecommendation

**Dimension:** Security · Architecture
**Current state:** `domains/execution/service.js` evaluates governance via `evaluateActionGovernance(input)` but then immediately builds and persists the recommendation record regardless of the result. A `block`-classified action is stored in the database and only rejected later when `assertGovernanceAllowsApproval()` fires at approval time. This pollutes the audit trail with dangerous actions (keyword stuffing, hidden text, deindexing) and means the DB contains records that should never have been created. This is distinct from T1-16 (which fixes the resultModel field); this fixes the missing pre-persist gate in `execution/service.js`.
**Files:** `backend/src/domains/execution/service.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. In `createRecommendation()`, immediately after `evaluateActionGovernance(input)`, add:
   ```js
   if (governanceResult.overallClassification === "block") {
     throw new Error(`governance_blocks_${input.actionType || "action"}`);
   }
   ```
2. This throws before `createRecommendationRecord()` and `repository.createRecommendation()` are called — the blocked action is never persisted.
3. Ensure `normalizeError` maps `governance_blocks_` prefix to 409 (it already does via pattern match; confirm in T2-14 registry refactor).
4. Add test: calling `createRecommendation` with an input that triggers a block classification throws before any repository call; the repository's `createRecommendation` is never invoked.

**Definition of done:** `createRecommendation()` throws `governance_blocks_*` before any DB write when `overallClassification === "block"`; no blocked recommendation row is ever created.

**Status:** `open`

---

### T1-18 — Auth enforcement on all domain POST endpoints

**Dimension:** Security
**Current state:** Six POST mutation endpoints bypass identity enforcement entirely — no `requireIdentity()` call exists in their handlers. Any unauthenticated caller can create measurement snapshots, attribution links, technical audit records, business intelligence profiles, and fire search intelligence analysis. This is a wider version of P1-6 from `PRODUCTION_READINESS_GAPS.md`, which only identified the two measurement endpoints; code inspection confirms four additional handlers are also unprotected:
- `POST /measurement/snapshots` (`handleMeasurementSnapshots`)
- `POST /measurement/attributions` (`handleMeasurementAttributions`)
- `POST /technical-operations/audit` (`handleTechnicalOperationsAudit`)
- `POST /search-intelligence/classify` (`handleSearchIntelligenceClassify`)
- `POST /search-intelligence/analyze` (`handleSearchIntelligenceAnalyze`)
- `POST /business-intelligence/profiles` (`handleBusinessIntelligenceProfiles`)
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `requireIdentity(identity)` as the first line in each of the six handler functions listed above (after the method check and rate limit check).
2. Pass `identity` into each handler from `createRequestHandler` — it is already resolved at the top of the request handler loop; confirm it is threaded to each handler call site.
3. Add tests: calling each POST endpoint without a valid identity returns 401; with a valid identity proceeds normally.

**Definition of done:** All 6 domain POST endpoints return 401 for unauthenticated callers; authenticated callers proceed normally; test coverage confirms both paths.

**Status:** `open`

---

## Tier 2 — Enterprise adoption requirements

These gaps do not cause immediate data loss but block serious production use.
All Tier 1 items must be resolved before beginning Tier 2.

---

### T2-01 — Request correlation IDs

**Dimension:** DevOps / Observability · Architecture
**Current state:** No trace ID generated or threaded through any request.
**Files:** `backend/src/server.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Generate `const correlationId = request.headers['x-request-id'] || randomUUID()` at top of `createRequestHandler`.
2. Add `X-Request-ID: <correlationId>` to all response headers via `sendEnvelope`.
3. Pass `correlationId` into `logRequestEvent` and the access log (T1-06).

**Definition of done:** Every response carries `X-Request-ID`; every log line for that request carries the same ID.

**Status:** `open`

---

### T2-02 — API versioning /v1/

**Dimension:** API Design · Architecture
**Current state:** All routes at `/`. Breaking changes cannot be introduced safely.
**Files:** `backend/src/server.js`, all test files, Flutter `app/`
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Add `/v1/` prefix to all routes in `createRequestHandler`.
2. Unversioned paths return 301 to `/v1/<path>` with `Deprecation: true` header.
3. Update README, CONTRIBUTING, all test files, render.yaml health check URL.
4. Update Flutter `app/` repository base URL.

**Definition of done:** All 24 routes accessible at `/v1/<path>`; old paths redirect cleanly.

**Status:** `open`

---

### T2-03 — Pagination, filtering, and sorting on all list endpoints

**Dimension:** API Design · Scalability
**Current state:** List endpoints return all records with no limit, cursor, filter, or sort. Any real workload makes these unusable.
**Files:** `backend/src/server.js`, all domain repository files, `backend/src/api/validation.js`
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Define standard query params: `limit` (1–200, default 50), `cursor` (opaque base64 of last-seen ID), `sort` (`createdAt` | `updatedAt` | `priority`, default `createdAt`), `order` (`asc` | `desc`, default `desc`).
2. Define filter params per endpoint: recommendations → `?status=approved&sourceModuleKey=keyword_analysis`; tasks → `?status=queued`; audit logs → `?entityType=recommendation&from=2026-05-01`.
3. Add `parsePaginationParams(url)` and `parseFilterParams(url, allowedFilters)` to `validation.js`.
4. Update each in-memory repository: apply limit, cursor, sort, and filter.
5. Update each Postgres repository: `WHERE id > $cursor AND <filters> ORDER BY <sort> LIMIT $limit`.
6. Wrap list responses: `{ items: [...], count: N, nextCursor: "..." | null }`.
7. Add tests for boundary conditions and each filter combination.

**Definition of done:** All list endpoints accept `?limit=N&cursor=X&sort=Y&status=Z`; response includes `nextCursor`.

**Status:** `open`

---

### T2-04 — Transaction wrapper on multi-step writes

**Dimension:** Data Layer
**Current state:** `createRecommendation` and `writeAuditLog` are separate async operations. A failed audit log write leaves an orphaned recommendation with no audit trail.
**Files:** `backend/src/domains/execution/service.js`, `backend/src/domains/execution/repository.js`
**Effort:** M · **Risk:** medium · **Depends on:** T1-01

**Implementation steps:**
1. Add `withTransaction(pool, callback)` in `db.js` — acquires client, `BEGIN`, runs callback, `COMMIT` or `ROLLBACK`.
2. Wrap: `createRecommendation → writeAuditLog`.
3. Wrap: `updateRecommendationStatus → writeAuditLog`.
4. Wrap: `createTaskFromRecommendation → updateRecommendation.taskId → writeAuditLog`.

**Definition of done:** Intentionally failing audit log write rolls back the recommendation create; no orphan exists.

**Status:** `open`

---

### T2-05 — Real DB integration tests in CI

**Dimension:** Testing / QC
**Current state:** Every test uses the in-memory repository. The Postgres path has never been exercised in CI.
**Files:** New `backend/src/integration-tests/`, CI configuration
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Add `docker-compose.test.yml`: spins up `postgres:16-alpine` on port 5433; applies all migrations.
2. Create `integration-tests/execution-postgres.test.js` — lifecycle tests with real `pg.Pool`.
3. Create `integration-tests/persistence-postgres.test.js` — verifies all 18 module `persistRun` functions.
4. Add `npm run test:integration` script.
5. Wire into `npm run ci`.

**Definition of done:** `npm run test:integration` passes against real Postgres; schema drift causes test failure.

**Status:** `open`

---

### T2-06 — OpenAPI specification

**Dimension:** API Design · Documentation · Developer Experience
**Current state:** 24 routes with no machine-readable contract. No SDK generation, no Postman collection, no contract testing.
**Files:** New `docs/backend/reference/OPENAPI.yaml`, `backend/src/server.js`
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Write `docs/backend/reference/OPENAPI.yaml` — OpenAPI 3.1, all 24 routes, schemas, error codes, Bearer JWT auth.
2. Add `/v1/openapi.json` route serving the spec.
3. Add `GET /v1/docs` serving Swagger UI (single HTML, CDN with SRI hash, zero npm dependency).
4. Add contract test: every route in `AVAILABLE_ROUTES` has an entry in the spec.

**Definition of done:** `GET /v1/openapi.json` returns valid OpenAPI 3.1; `GET /v1/docs` renders Swagger UI.

**Status:** `open`

---

### T2-07 — Code coverage gate in CI

**Dimension:** Testing / QC
**Current state:** No coverage measurement. Unknown what percentage of code is exercised.
**Files:** `package.json`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `c8` as a devDependency.
2. Update `npm run test:backend:ci` to `c8 --threshold 80 node backend/src/full-backend-validation.test.js`.
3. Add `.c8rc`: `{ "exclude": ["**/*.test.js"], "reporter": ["text", "lcov"], "threshold": 80 }`.
4. Add `coverage/` to `.gitignore`.

**Definition of done:** `npm run ci` fails when line coverage drops below 80%.

**Status:** `open`

---

### T2-08 — Input string length validation

**Dimension:** Code Quality · Security
**Current state:** Validation checks field types but applies no maximum length. A 10MB title passes validation.
**Files:** `backend/src/api/validation.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `assertStringMaxLength(value, maxLen, code, label)` helper.
2. Apply: `title` ≤ 500, `summary` ≤ 5000, `actionType` ≤ 100, `actor` ≤ 255, `nextStatus` ≤ 50 chars.
3. Add tests for each over-limit field.

**Definition of done:** 600-character title returns 400 `invalid_recommendation_title`.

**Status:** `open`

---

### T2-09 — Architecture decision records (ADRs)

**Dimension:** Documentation · Architecture
**Current state:** Three non-obvious decisions have no documented rationale and are at risk of being reversed.
**Files:** New `docs/backend/decisions/` entries
**Effort:** M · **Risk:** low

**Implementation steps:**
1. `ADR_001_ZERO_RUNTIME_DEPENDENCIES.md` — rationale, tradeoffs, alternatives considered.
2. `ADR_002_PURE_NODE_HTTP.md` — same format.
3. `ADR_003_IN_MEMORY_DEFAULT_REPOSITORY.md` — same format.

**Definition of done:** Three ADR files committed; each cites specific tradeoffs and alternatives.

**Status:** `open`

---

### T2-10 — Operational runbook

**Dimension:** DevOps / Observability · Documentation
**Current state:** No documented procedure for any on-call scenario.
**Files:** New `docs/backend/reference/RUNBOOK.md`
**Effort:** M · **Risk:** low

**Implementation steps:**
Write `RUNBOOK.md` covering: cold-start latency, DB unreachable, SERP provider rate-limited, Supabase outage, force restart Render, credential rotation procedure.

**Definition of done:** Runbook covers all six scenarios with explicit steps.

**Status:** `open`

---

### T2-11 — GitHub Actions CI workflow

**Dimension:** DevOps / Observability · Testing / QC
**Current state:** No `.github/workflows/` directory exists. There is zero automated CI — a PR can be merged and deployed without any test run. T3-08 (staging) mentions a workflow in passing but it is Tier 3 effort. CI on every PR is a Tier 2 baseline requirement.
**Files:** New `.github/workflows/ci.yml`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Create `.github/workflows/ci.yml`:
   - Trigger: `push` to any branch, `pull_request` targeting `main` or `staging`.
   - Steps: `actions/checkout`, `actions/setup-node@v4` with `node-version: '20'`, `npm ci`, `npm run ci`.
2. Require the workflow to pass before PRs can be merged (set as required status check in GitHub branch protection rules).
3. Add badge to README: `![CI](https://github.com/mughalhazy/Neural-Rank/actions/workflows/ci.yml/badge.svg)`.

**Definition of done:** Every PR shows a green/red CI status; merge is blocked on failure.

**Status:** `open`

---

### T2-12 — Per-module execution timeout and error isolation

**Dimension:** Scalability · Architecture
**Current state:** The orchestrator (`defaultMvpOrchestrator.js`) awaits each `service.run()` sequentially with no timeout and no try-catch. Two failure modes exist: (1) a hanging adapter holds the entire request open indefinitely; (2) a throwing module propagates the exception and aborts all subsequent modules. Both must be fixed together — a timeout without error isolation still lets synchronous throws kill the flow.
**Files:** `backend/src/orchestration/defaultMvpOrchestrator.js`, `backend/src/orchestration/activationAwareOrchestrator.js`
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Add `MODULE_TIMEOUT_MS = 10_000` constant (configurable via env var `MODULE_TIMEOUT_MS`).
2. Wrap each `service.run(input, ctx)` call in a combined guard:
   ```js
   async function runModuleSafe(service, input, ctx, moduleKey) {
     try {
       return await Promise.race([service.run(input, ctx), timeoutReject(MODULE_TIMEOUT_MS, moduleKey)]);
     } catch (err) {
       return { status: err.code === 'module_timeout' ? 'timeout' : 'error', moduleKey, reason: String(err) };
     }
   }
   ```
3. In the orchestrator loop, replace `await service.run(...)` with `await runModuleSafe(...)`.
4. Include failed/timed-out modules in the response with `status: "timeout" | "error"` — do not abort the flow.
5. Add `MODULE_TIMEOUT_MS` to `.env.example`.
6. Add test: a module whose `run()` throws produces `status: "error"` in results; remaining modules still execute.
7. Add test: a module whose `run()` never resolves produces `status: "timeout"` within N seconds; remaining modules still execute.

**Definition of done:** A hanging or throwing module does not abort the orchestration; all other modules run and the response includes the failed module with status flagged.

**Status:** `open`

---

### T2-13 — Dependabot configuration

**Dimension:** Security · Developer Experience
**Current state:** No `.github/dependabot.yml`. DevDependencies (ESLint, c8, Husky) accumulate CVEs silently. No automated PRs for security updates.
**Files:** New `.github/dependabot.yml`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Create `.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: npm
       directory: /
       schedule:
         interval: weekly
       open-pull-requests-limit: 5
       labels: ["dependencies"]
   ```
2. Since the backend has zero runtime dependencies, all Dependabot PRs will be devDependency updates — low risk.
3. Add `npm audit --omit=dev` to `npm run ci` to catch any future runtime dependency CVEs if they are ever added.

**Definition of done:** Dependabot creates weekly PRs for outdated devDependencies; `npm audit` runs in CI.

**Status:** `open`

---

### T2-14 — normalizeError registry refactor

**Dimension:** Code Quality · Architecture
**Current state:** `errors.js` maps HTTP status codes by string suffix/prefix pattern matching (`.endsWith("_not_found")` → 404). Adding a new error code that coincidentally ends in `_not_found` silently gets the wrong status code. The pattern is fragile as the codebase grows.
**Files:** `backend/src/api/errors.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Build a named registry: `const ERROR_REGISTRY = { recommendation_not_found: 404, task_not_found: 404, module_not_found: 404, ... }` — enumerate every error code thrown in the codebase explicitly.
2. In `normalizeError`, look up `error.message` in `ERROR_REGISTRY` first; fall back to the pattern matching only as a safety net for unknown codes (log a warning when the fallback triggers so new codes get added to the registry).
3. Export the registry so callers can reference error codes without string literals.
4. Add test: every registered error code maps to the expected HTTP status.

**Definition of done:** Zero reliance on string suffix matching for known error codes; unknown codes log a warning.

**Status:** `open`

---

### T2-15 — Negative-path and edge-case test suite

**Dimension:** Testing / QC
**Current state:** 29 suites cover happy paths and adapter fallbacks. No systematic coverage of: bad inputs, auth failures on protected routes, governance blocks, module-level empty results, payload edge cases, or out-of-range pagination params.
**Files:** New `backend/src/negative-path.test.js`
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Create `backend/src/negative-path.test.js` using the `withServer` test pattern.
2. Cover per-route: invalid JSON body → 400; missing required field → 400; over-limit string → 400; wrong HTTP method → 405; unknown route → 404.
3. Cover auth: mutation without identity → 401; Bearer token present but invalid → 401; valid identity but wrong workspace → 403 (post T1-03).
4. Cover governance: blocked action type → 409.
5. Cover rate limit: hammer 121 requests → 121st returns 429.
6. Cover payload size: body > 1MB → 413.
7. Add to `full-backend-validation.test.js` suite list.

**Definition of done:** Negative-path suite passes; all error branches have at least one test.

**Status:** `open`

---

### T2-16 — Sentry error tracking

**Dimension:** DevOps / Observability
**Current state:** `unhandledRejection` and `uncaughtException` log to stdout only — no alert fires in production. Mean Time To Detect (MTTD) for a production exception is "whenever someone reads the logs". Sentry free tier covers 5k events/month.
**Files:** `backend/src/server.js`, `package.json`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add `@sentry/node` as a **runtime** devDependency. Note: this is the one justified exception to zero-runtime-deps — observability infrastructure is not application logic. Alternatively, implement a lightweight fetch-based error reporter (zero dep) that POSTs to the Sentry HTTP API directly.
2. Initialize Sentry at the top of `server.js` with `SENTRY_DSN` env var. No-op when absent.
3. In `unhandledRejection` and `uncaughtException` handlers, call `Sentry.captureException(error)` before logging.
4. In `normalizeError`, capture 5xx errors via Sentry (not 4xx — those are caller errors, not server errors).
5. Add `SENTRY_DSN` to `.env.example` and `render.yaml`.

**Preferred alternative (zero-dep):** Write `backend/src/core/errorReporter.js` — fires a `fetch` POST to `https://sentry.io/api/<projectId>/store/` with the Sentry event envelope format. No npm dependency. Graceful no-op when `SENTRY_DSN` is absent.

**Definition of done:** An unhandled exception in production triggers a Sentry alert within 60 seconds.

**Status:** `open`

---

### T2-17 — UptimeRobot monitor setup

**Dimension:** DevOps / Observability
**Current state:** No external uptime monitoring. The service can be down and no alert fires. This was noted as a pending owner action but has no plan entry.
**Files:** None (owner action — requires UptimeRobot account)
**Effort:** S · **Risk:** low

**Implementation steps (owner action — cannot be executed programmatically):**
1. Log into UptimeRobot (free tier: 50 monitors, 5-minute interval).
2. Create monitor: Type = HTTP(s), URL = `https://neural-rank-backend.onrender.com/health`, interval = 5 minutes.
3. Set alert contact to `synteracloud@gmail.com`.
4. The 5-minute pings also keep the Render free-tier instance warm (prevents 15-min spin-down).

**Definition of done:** UptimeRobot dashboard shows monitor online; test alert email received.

**Status:** `open`

---

### T2-18 — Input validation for module run endpoints

**Dimension:** Code Quality · Security
**Current state:** `validateModuleRunBody` allows a completely empty `moduleInput` (`{}`). Modules run with no meaningful input and produce generic, non-actionable output. No check that at least one identifying field (e.g., `websiteUrl`, `appId`, `keywords`) is present.
**Files:** `backend/src/api/validation.js`, per-module `analysis.js` files
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Add `validateModuleInput(moduleKey, moduleInput)` — looks up the module's required fields from a per-module config and validates at least one is present.
2. Each module's `analysis.js` exports `REQUIRED_INPUT_FIELDS: ['websiteUrl']` (or whichever fields are meaningful for that module).
3. In `handleSingleModuleRun`, call `validateModuleInput(moduleKey, body.moduleInput)` before `service.run()`.
4. Add tests: running keyword-analysis with empty input returns 400 `missing_required_input`.

**Definition of done:** Module run with empty input returns 400 with a specific field-level error; module run with valid input continues normally.

**Status:** `open`

---

### T2-19 — Single source of truth for module activation state

**Dimension:** Architecture · Data Layer
**Current state:** Module activation state is currently defined in three separate places that can diverge: (1) `core/activation.js` — `DEFAULT_ACTIVE_MODULES` array (runtime authoritative); (2) `backend_module_catalog.initial_state` column in DB; (3) `backend_module_activation_defaults.is_active` column in DB. The DB was already patched once via `20260516130000_fix_activation_defaults.sql` to correct a mismatch — this patch is evidence that the three-source pattern is not maintainable. If the JS catalog changes, the DB diverges silently.
**Files:** `backend/src/core/activation.js`, `backend/src/core/moduleCatalog.js`, `supabase/migrations/` (new migration)
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Designate `core/activation.js` and `core/moduleCatalog.js` as the single authoritative source of truth for activation state (they already drive runtime behavior).
2. Write migration `20260519_sync_activation_from_js.sql`: drop the `is_active` column from `backend_module_activation_defaults` (it is now derived from JS) or make it a view that reflects the JS-defined defaults.
3. Add a CI check `scripts/check-activation-sync.js` — imports the JS catalog, queries the DB `backend_module_catalog` table, and asserts all 18 module keys and `initial_state` values match exactly.
4. Wire into `npm run test:integration`.
5. Document in `ADR_003` (from T2-09) that JS is authoritative; DB reflects JS, never the other way around.

**Definition of done:** `check-activation-sync.js` passes in CI; divergence between JS catalog and DB causes a test failure.

**Status:** `open`

---

### T2-20 — Shared database utility extraction

**Dimension:** Code Quality
**Current state:** Three functions are duplicated verbatim across multiple repository files: (1) `clone()` — `JSON.parse(JSON.stringify(value))` — copied in `measurement/repository.js` and `business-intelligence/repository.js`; (2) `normalizeRows()` — same pattern in both; (3) `upsertProductTarget()` — the same `INSERT ... ON CONFLICT` SQL query is reproduced in at least two repositories. Code duplication means bugs fixed in one copy silently remain in the others. The `clone()` implementation is also incorrect — it cannot handle `Date`, `undefined`, `Symbol`, or circular references.
**Files:** New `backend/src/core/dbUtils.js`, `backend/src/domains/measurement/repository.js`, `backend/src/domains/business-intelligence/repository.js`, `backend/src/domains/execution/repository.js`
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Create `backend/src/core/dbUtils.js` exporting:
   - `clone(value)` — use `structuredClone()` (available in Node.js 17+) instead of `JSON.parse/stringify`; falls back to JSON method with explicit `Date` handling.
   - `normalizeRows(result)` — the standard `Array.isArray(result) ? result : result?.rows ?? []` pattern.
   - `upsertProductTarget(query, target)` — the shared SQL upsert used across repositories.
2. Replace all three duplicated implementations across repository files with imports from `dbUtils.js`.
3. Add unit tests for `clone()` covering: Date objects, undefined values, circular reference detection (should throw clearly, not silently corrupt).

**Definition of done:** Zero duplication of `clone`, `normalizeRows`, `upsertProductTarget` across repository files; `clone()` handles Date correctly.

**Status:** `open`

---

### T2-21 — Audit log immutability enforcement

**Dimension:** Data Layer · Security
**Current state:** The `audit_logs` table is populated by `auditLogWriter.js` but has no database-level immutability constraint. Rows can be updated or deleted by anyone with DB access, defeating the purpose of an audit trail. Enterprise compliance (SOC 2, GDPR audit requirements) requires tamper-evident, append-only audit logs.
**Files:** `supabase/migrations/` (new migration), `backend/src/domains/execution/auditLogWriter.js`
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Write migration `20260519_audit_log_immutability.sql`:
   - Add a `BEFORE UPDATE` trigger on `audit_logs`: raise exception `'audit_log_rows_are_immutable'`.
   - Add a `BEFORE DELETE` trigger on `audit_logs`: raise exception `'audit_log_rows_are_immutable'`.
   - Add a sequence column `seq BIGSERIAL NOT NULL` to `audit_logs` so log entries have an unbroken, monotonically increasing identifier (gaps in the sequence indicate deleted rows).
2. Verify the existing `auditLogWriter.js` only performs INSERT operations — confirm no UPDATE/DELETE paths exist.
3. Add test: attempt to delete an audit log row via the DB; assert the trigger exception is raised.
4. Document in `RUNBOOK.md` (T2-10): audit logs are append-only by design; to "correct" a log, add a new entry with `action: "correction"` referencing the original entry ID.

**Definition of done:** UPDATE and DELETE on `audit_logs` raise DB exceptions; `seq` column is present and monotonically increasing.

**Status:** `open`

---

### T2-22 — Fix hardcoded test suite count assertion

**Dimension:** Testing / QC · Code Quality
**Current state:** `full-backend-validation.test.js` contains a hardcoded assertion `assert.equal(TEST_SUITES.length, 29)`. Adding a new test suite requires updating two locations: the `TEST_SUITES` array AND this assertion. Forgetting to update the assertion causes a confusing failure. This is a test fragility issue that will recur every time a new module or test is added.
**Files:** `backend/src/full-backend-validation.test.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Remove the hardcoded `assert.equal(TEST_SUITES.length, 29)` assertion.
2. Replace with a derived assertion: `assert.ok(TEST_SUITES.length >= 29, ...)` — this allows the count to grow without requiring manual updates, while still catching accidental array truncation.
3. Alternatively, if the intent is to enforce that the count is exact: compute it at runtime from `getRegisteredModuleKeys().length + FIXED_SUITE_COUNT` rather than hardcoding 29.
4. Add a comment: the suite count is dynamic — add new suites to the array; the assertion auto-adjusts.

**Definition of done:** Adding a new test suite to `TEST_SUITES` does not require changing any assertion; the suite still catches accidental deletions from the array.

**Status:** `open`

---

### T2-23 — SERP provider configuration (owner action)

**Dimension:** API Design · Scalability
**Current state:** The SERP adapter (`integrations/adapters/serp-provider.js`) is fully implemented for both SerpApi and DataForSEO but returns `integration_not_connected` for all requests because `SERP_PROVIDER` and `SERP_API_KEY` are not set in Render. `serp_feature_analyzer` and any module relying on SERP data produce empty results for all production runs. This is tracked as P1-1 in `PRODUCTION_READINESS_GAPS.md` but has no REBUILD_PLAN entry.
**Files:** None (owner action — requires API credentials)
**Effort:** S · **Risk:** low

**Implementation steps (owner action — cannot be executed programmatically):**
1. Obtain API credentials from SerpApi (`https://serpapi.com`, free tier: 100 searches/month) or DataForSEO (`https://dataforseo.com`).
2. In Render dashboard, set env vars: `SERP_PROVIDER=serpapi` (or `dataforseo`) and `SERP_API_KEY=<key>`.
3. Add both as `sync: false` entries in `render.yaml` (key only, no value — values stay in Render dashboard).
4. Verify by triggering a `/run/default` request and checking that `serp_feature_analyzer` returns real SERP data rather than `integration_not_connected`.

**Definition of done:** `serp_feature_analyzer` module returns live SERP data; `integration_not_connected` no longer appears in default run results.

**Status:** `open`

---

### T2-24 — Renderer endpoint configuration (owner action)

**Dimension:** Architecture · Scalability
**Current state:** `domains/technical-operations/service.js` calls `buildRenderedDomPlaceholder()` for all rendered DOM analysis because `RENDERER_ENDPOINT` is not configured. Core Web Vitals, JS-rendered content analysis, and rendering error detection are permanently skipped. This is tracked as P1-2 in `PRODUCTION_READINESS_GAPS.md` but has no REBUILD_PLAN entry.
**Files:** None (owner action — requires a headless browser service)
**Effort:** M · **Risk:** low

**Implementation steps (owner action):**
1. Deploy a headless Playwright or Puppeteer renderer:
   - Option A: Second Render free-tier service using `browserless/chrome` Docker image (free tier: limited hours/month).
   - Option B: Managed headless browser API (Browserless.io free tier: 6 hours/month).
2. Set `RENDERER_ENDPOINT=https://<your-renderer-service-url>` in Render dashboard as a `sync: false` env var.
3. Add `RENDERER_ENDPOINT` as a `sync: false` entry in `render.yaml`.
4. Test: trigger a `POST /technical-operations/audit` with a real URL; verify the response no longer contains `renderer_not_configured`.

**Definition of done:** `POST /technical-operations/audit` returns rendered DOM analysis data; `renderer_not_configured` no longer appears.

**Status:** `open`

---

### T2-25 — Supabase database keep-alive

**Dimension:** DevOps / Observability
**Current state:** Supabase free tier pauses the database after 7 days of no activity. T2-17 (UptimeRobot) pings the Render HTTP service every 5 minutes, keeping Render alive, but does NOT prevent Supabase from pausing. When the DB pauses, every request that requires persistence fails with a DB connection error until the DB is manually resumed. No scheduled DB activity exists to prevent this.
**Files:** `backend/src/server.js` or a scheduled script
**Effort:** S · **Risk:** low · **Depends on:** T1-01 (DB connection), T2-17 (UptimeRobot alive)

**Implementation steps:**
1. Add a `GET /health` enhancement (see T1-08): the existing DB probe (`SELECT 1`) runs on every health check. Since UptimeRobot (T2-17) pings `/health` every 5 minutes, the DB is queried automatically and will not hit the 7-day inactivity threshold as long as UptimeRobot is active.
2. Verify: confirm that T1-08 (health probe runs `SELECT 1`) + T2-17 (UptimeRobot pings `/health` every 5 min) together prevent the Supabase pause. Document this relationship in `RUNBOOK.md` (T2-10) — the keep-alive is a side effect of the health probe, not a dedicated scheduled job.
3. Add a note to `README.md`: "Supabase database keep-alive is maintained by UptimeRobot health pings — do not disable the monitor."

**Definition of done:** Supabase DB has not paused after 14 days of UptimeRobot active; documented in RUNBOOK.

**Status:** `open`

---

### T2-26 — Module catalog integrity reverse check

**Dimension:** Architecture · Code Quality
**Current state:** `assertModuleCatalogIntegrity()` in `core/activation.js` verifies that every module in `DEFAULT_ACTIVE_MODULES` and `BUILT_BUT_INACTIVE_MODULES` is present in `moduleCatalog.js`. However, the reverse check is missing: a module added to `serviceRegistry.js` but forgotten from both activation sets would silently bypass the integrity check and run as neither active nor inactive — an orphan. This is P2-5 in `PRODUCTION_READINESS_GAPS.md`.
**Files:** `backend/src/core/activation.js`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. In `assertModuleCatalogIntegrity()`, add a reverse check: for every module key registered in `serviceRegistry.js` (import `getRegisteredModuleKeys()` from `serviceRegistry.js`), assert it appears in either `DEFAULT_ACTIVE_MODULES` or `BUILT_BUT_INACTIVE_MODULES`.
2. If any registered key is missing from both sets, throw with a clear message: `"Module '<key>' is registered in serviceRegistry but absent from both DEFAULT_ACTIVE_MODULES and BUILT_BUT_INACTIVE_MODULES — add it to one."`.
3. Add test: temporarily adding a module key to `serviceRegistry` without adding it to either activation set causes `assertModuleCatalogIntegrity()` to throw.

**Definition of done:** `assertModuleCatalogIntegrity()` throws on a serviceRegistry key absent from both activation sets; test confirms the forward and reverse checks both work.

**Status:** `open`

---

## Tier 3 — Enterprise elite

These transform Neural Rank from a solid indie backend into infrastructure that can serve enterprise clients at scale.

---

### T3-01 — Async module execution with job queue

**Dimension:** Scalability · Architecture
**Current state:** `/v1/run/default` runs all 18 modules synchronously. T2-12 adds per-module timeouts as an intermediate fix. This is the full solution: queue-backed async execution with result polling.
**Effort:** XL · **Risk:** high

**Implementation steps:**
1. Add Redis via Upstash free tier (10k commands/day).
2. Add BullMQ as a devDependency (or build a zero-dep queue backed by Redis LPUSH/BRPOP).
3. Change `/v1/run/default` and `/v1/run/activation-aware` to enqueue a job → return `{ jobId, status: "queued" }` with HTTP 202.
4. Add `GET /v1/jobs/:jobId` — polls job state.
5. Add optional webhook: `callbackUrl` in request body; worker POSTs result on completion.
6. Worker runs in `backend/src/worker.js`, started alongside the server.
7. Single-module `/run/:key` remains synchronous.

**Definition of done:** `/v1/run/default` returns 202 immediately; result available at `/v1/jobs/:jobId`.

**Status:** `open`

---

### T3-02 — OpenTelemetry distributed tracing

**Dimension:** DevOps / Observability
**Current state:** No tracing. Cannot identify which module or adapter is the bottleneck.
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Add `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`.
2. Create `backend/src/telemetry.js` — OTel SDK with OTLP exporter to Grafana Cloud free tier.
3. Root span per request; child span per module `run()`; child span per adapter call.
4. Add `OTEL_EXPORTER_OTLP_ENDPOINT` to `.env.example` and `render.yaml`.

**Definition of done:** Single `/v1/run/default` call produces a waterfall trace in Grafana.

**Status:** `open`

---

### T3-03 — Prometheus-compatible metrics endpoint

**Dimension:** DevOps / Observability · Scalability
**Current state:** No metrics. No visibility into request latency, error rate, or module execution time.
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Track in-process (no npm dep): request count by route/status, p50/p95/p99 histograms, error count by code, module execution time per key, rate limit hit count.
2. Add `GET /v1/metrics` returning Prometheus text format.
3. Add scrape target to Grafana Cloud; create dashboard.

**Definition of done:** `GET /v1/metrics` returns valid Prometheus text; Grafana dashboard shows live data.

**Status:** `open`

---

### T3-04 — Redis-backed rate limiter

**Dimension:** Scalability · Security
**Current state:** In-memory rate limiter resets on every Render restart and cannot work across multiple instances.
**Note:** X-Forwarded-For IP spoofing fix has been moved to T1-10 — it applies to the current in-memory limiter and cannot wait for Tier 3.
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Create `backend/src/core/redisRateLimiter.js` — same API as `rateLimiter.js`, backed by Redis `INCR` + `EXPIRE`.
2. In `server.js`, detect `REDIS_URL` env var: if present, use Redis limiter; absent = in-memory (dev/CI).
3. Add `REDIS_URL` to `.env.example` and `render.yaml`.
4. Add integration test: 121 requests in one window; 121st returns 429; state survives process restart.

**Definition of done:** Rate limit state survives restarts; works correctly across multiple instances.

**Status:** `open`

---

### T3-05 — Response caching layer

**Dimension:** Scalability
**Current state:** Identical module runs repeat full computation. Deterministic modules could be cached.
**Effort:** L · **Risk:** medium

**Implementation steps:**
1. Cache key: `sha256(moduleKey + JSON.stringify(sortedInput))`.
2. Cache store: Redis (T3-04) with per-module TTL.
3. Add `Cache-Control`, `ETag`, `X-Cache: HIT | MISS` headers.
4. Honour `Cache-Control: no-cache` to bypass cache.

**Definition of done:** Second identical module run returns `X-Cache: HIT` in < 5ms.

**Status:** `open`

---

### T3-06 — Docker and docker-compose local dev

**Dimension:** Developer Experience
**Current state:** Local dev requires manual Node version management and no Postgres setup path.
**Effort:** M · **Risk:** low

**Implementation steps:**
1. `Dockerfile` — `node:20-alpine`, non-root user, `npm ci --omit=dev`.
2. `docker-compose.yml` — api + postgres:16-alpine + redis:7-alpine, wired automatically.
3. `docker-compose.test.yml` — postgres only, for integration tests.
4. `.dockerignore` — exclude `node_modules`, `.env`, `design/`, `ui/`, `app/`, `docs/`.
5. README quickstart: `git clone → cp .env.example .env → docker-compose up`.
6. Add `.nvmrc` with `20`; add `"engines": { "node": ">=20" }` to `package.json`.

**Definition of done:** `docker-compose up` produces a running API with no manual steps.

**Status:** `open`

---

### T3-07 — Pre-commit hooks via Husky

**Dimension:** Developer Experience · Code Quality
**Current state:** `npm run ci` is a convention documented in CONTRIBUTING.md only. Nothing enforces it.
**Effort:** S · **Risk:** low

**Implementation steps:**
1. `npm install --save-dev husky`.
2. `npx husky init`.
3. `.husky/pre-commit` — runs `npm run lint && npm run check:secrets`.
4. `.husky/pre-push` — runs `npm run ci`.
5. Add `"prepare": "husky"` to `package.json` scripts.

**Definition of done:** ESLint error blocks commit; failing test blocks push.

**Status:** `open`

---

### T3-08 — Staging environment with smoke tests

**Dimension:** DevOps / Observability
**Current state:** Every push to `main` deploys directly to production with no verification gate.
**Effort:** M · **Risk:** low · **Depends on:** T2-11 (GitHub Actions)

**Implementation steps:**
1. Create Render service `neural-rank-backend-staging` — `autoDeploy: true` on `staging` branch.
2. Expand `.github/workflows/ci.yml` (from T2-11): on merge to `staging`, add a smoke test step — `curl /v1/health` must return 200.
3. PRs target `staging`; `main` is production-only.
4. Update CONTRIBUTING.md with the new branch flow.

**Definition of done:** Every PR deploys to staging; smoke test must pass before production promotion.

**Status:** `open`

---

### T3-09 — Connection pooling and pool health monitoring

**Dimension:** Data Layer · Scalability
**Current state:** When DB is wired (T1-01), pool is not tuned. No pool health metrics.
**Effort:** S · **Risk:** low · **Depends on:** T1-01

**Implementation steps:**
1. Configure `pg.Pool`: `max: 5`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`.
2. Add pool event listeners — log structured JSON on error; increment metric counter on connect.
3. Expose pool stats in `/v1/health` response.
4. Add pool exhaustion test: 6 concurrent DB requests do not throw; 6th resolves within timeout.

**Definition of done:** Pool stats visible in `/v1/health`; 6 concurrent DB requests handled without errors.

**Status:** `open`

---

### T3-10 — Module scaffolding code generator

**Dimension:** Developer Experience
**Current state:** Adding a new module requires manually creating 5 files. Easy to miss a file or diverge from the contract.
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Create `scripts/scaffold-module.js <moduleKey> <displayName>` — generates all 5 contract files from templates plus `service.test.js` with 3 stubbed tests.
2. Auto-registers module in `core/moduleCatalog.js`.
3. Prints checklist of manual steps remaining.
4. Add `npm run scaffold -- <moduleKey> <displayName>` to `package.json`.

**Definition of done:** `npm run scaffold -- local_seo_v2 "Local SEO v2"` produces 6 files that pass `npm run ci` immediately.

**Status:** `open`

---

### T3-11 — ETag and conditional request support

**Dimension:** API Design · Scalability
**Current state:** No `ETag` or `Last-Modified`. Clients must re-fetch full lists even when nothing changed.
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Compute `ETag` as `sha256(JSON.stringify(sortedIds + latestUpdatedAt))` for list endpoints.
2. Add `ETag` header to all list responses.
3. Check `If-None-Match` header — return 304 if matched.
4. Add `Cache-Control: private, max-age=0, must-revalidate`.
5. Add tests: 304 on unchanged list; ETag changes after new item created.

**Definition of done:** Clients receive 304 on unchanged lists; ETag changes when list changes.

**Status:** `open`

---

### T3-12 — Flutter ApiRepository implementation

**Dimension:** Scalability · Developer Experience
**Current state:** `app/` uses `MockRepository`. The production app cannot communicate with the backend. Play Store blocked.
**Effort:** XL · **Risk:** high

**Implementation steps:**
1. Add `dio`, `flutter_secure_storage` to `app/pubspec.yaml`.
2. Create `neural_rank_client.dart` — Dio client with Bearer token interceptor, retry on 5xx, 30s timeout.
3. Create `api_repository.dart` implementing the abstract `Repository` interface.
4. Wire via `kDebugMode`: debug = Mock, release = Api.
5. Implement Supabase auth flow in Flutter (`supabase_flutter`, sign-in screen, secure storage).
6. Map `{ ok: false, error }` to typed `Failure` states in BLoC layer.

**Definition of done:** Release build communicates with Render backend; MockRepository retained for debug/test.

**Status:** `open`

---

### T3-13 — Router refactoring — map-based dispatcher

**Dimension:** Architecture · Code Quality
**Current state:** `server.js` has a 700+ line if/else routing block. Each new route adds 5–10 lines to an already unwieldy file. At enterprise scale this becomes unmaintainable and hard to code-review.
**Files:** `backend/src/server.js`
**Effort:** M · **Risk:** medium

**Implementation steps:**
1. Define a route map: `const ROUTE_MAP = { "GET /health": handleHealth, "POST /v1/run/default": handleDefaultRun, ... }`.
2. Write a `dispatch(method, pathname, routeMap)` function: tries exact match first, then pattern match (regex keys for parameterised routes).
3. Replace the if/else routing block in `createRequestHandler` with a single `dispatch(method, pathname, ROUTE_MAP)` call.
4. All handler functions remain unchanged — only the dispatch mechanism changes.
5. Routing block shrinks from ~200 lines to ~30 lines.

**Definition of done:** `createRequestHandler` body is under 50 lines; all 24 routes still pass their tests.

**Status:** `open`

---

### T3-14 — Composable middleware stack

**Dimension:** Architecture · Code Quality
**Current state:** Auth resolution, rate limiting, body parsing, and identity checks are manually inlined in every handler function. Adding a new cross-cutting concern (e.g., request logging, tracing) requires touching every handler.
**Files:** `backend/src/server.js`, new `backend/src/api/middleware.js`
**Effort:** L · **Risk:** medium

**Implementation steps:**
1. Define `compose(...middlewares)` — returns a function `(request, response, context) => Promise<context>`. Each middleware receives and returns a context object.
2. Built-in middlewares: `withCorrelationId`, `withIdentity`, `withRateLimit`, `withBody`.
3. Each handler function receives a pre-built context with `{ identity, body, rateLimitInfo, correlationId }` — no inline parsing.
4. Route-level middleware selection: public routes skip `withIdentity`; mutation routes include it.
5. This is the prerequisite for T3-15 (DI pattern) since context becomes the DI container.

**Definition of done:** Adding a new cross-cutting concern (e.g., a new header) requires changing one middleware, not every handler.

**Status:** `open`

---

### T3-15 — Domain service dependency injection

**Dimension:** Architecture · Testing / QC
**Current state:** Domain services (`measurementService`, `technicalOperationsService`, etc.) are created at module `require()` time as module-level singletons. This makes test isolation fragile and prevents different service configurations per request.
**Files:** `backend/src/server.js`, all domain service files
**Effort:** L · **Risk:** medium

**Implementation steps:**
1. Remove module-level singleton instantiations from `server.js`.
2. Create `backend/src/container.js` — a factory that builds all domain services and returns them. Called once in `startServer()`.
3. Pass the service container into `createRequestHandler(container)` instead of `createRequestHandler(baseContext)`.
4. Handlers receive services from the container rather than importing singletons.
5. Tests pass a mock container — no global state to reset between tests.

**Definition of done:** `resetExecutionServiceState()` calls are no longer needed in tests; each test creates a fresh container.

**Status:** `open`

---

### T3-16 — Load and performance tests

**Dimension:** Testing / QC · Scalability
**Current state:** No p99 latency benchmarks. Unknown what `/run/default` costs at p99, or at what concurrency the system degrades.
**Files:** New `scripts/load-test.js` or `k6` script
**Effort:** M · **Risk:** low

**Implementation steps:**
1. Write a `k6` load test script: ramp from 1 to 50 virtual users over 2 minutes; measure p50, p95, p99 latency for `/v1/health`, `/v1/run/default`, and `/v1/execution/recommendations`.
2. Define pass thresholds: p99 < 2000ms for `/v1/health`; p99 < 15000ms for `/v1/run/default` (18 modules); error rate < 1%.
3. Run against the staging environment (T3-08) to avoid affecting production.
4. Document baseline numbers in `progress.md` and `RUNBOOK.md`.
5. Re-run after T3-01 (async queue) to measure improvement.

**Definition of done:** Load test script runs and produces a pass/fail against defined thresholds; baseline numbers documented.

**Status:** `open`

---

### T3-17 — Flutter screen consolidation (ui/ → app/)

**Dimension:** Developer Experience · Scalability
**Current state:** `ui/` contains 12 prototype screens that don't exist in `app/`. T3-12 wires the API client but does not port the screens. The Play Store submission requires a single unified app. P0-4/P0-5 from the gap register.
**Files:** `app/lib/`, `ui/lib/`
**Effort:** XL · **Risk:** high · **Depends on:** T3-12

**Implementation steps:**
1. Audit all 12 `ui/` screens against the 10 `app/` screens — produce a consolidation map (which `ui/` screens are new; which overlap with existing `app/` screens).
2. Port each new `ui/` screen into `app/` following BLoC architecture (Event/State/Bloc files).
3. Replace all `MockRepository` data references in ported screens with real `ApiRepository` calls (already wired in T3-12).
4. Remove `ui/` directory once all screens are consolidated.
5. Update `README.md` project tree; remove `ui/` entry from `.gitignore`.
6. Test all 22 combined screens on both iOS simulator and Android emulator.

**Definition of done:** `ui/` directory removed; `app/` contains all screens; no `MockRepository` calls in production build.

**Status:** `open`

---

### T3-18 — Automated DB migration CI check

**Dimension:** Data Layer · DevOps
**Current state:** Migrations are applied manually via Supabase dashboard. A missed migration causes silent schema drift between what the code expects and what the DB contains. No CI step verifies they are in sync.
**Files:** `scripts/check-migrations.js`, `package.json`, CI workflow
**Effort:** M · **Risk:** low · **Depends on:** T2-05 (integration test infra / docker-compose)

**Implementation steps:**
1. Write `scripts/check-migrations.js` — connects to the test Postgres instance (from T2-05 docker-compose), applies all migrations in `supabase/migrations/`, queries `information_schema.tables` for expected table names, and asserts all 33 tables are present.
2. Add `npm run check:migrations` script.
3. Wire into `npm run test:integration`.
4. Document migration application process in `RUNBOOK.md` (T2-10) for production.

**Definition of done:** Missing a migration file causes `npm run test:integration` to fail with a clear error.

**Status:** `open`

---

### T3-19 — SLO definition and error budget

**Dimension:** DevOps / Observability · Architecture
**Current state:** No defined Service Level Objectives. "Is the service healthy?" has no quantified answer.
**Files:** New `docs/backend/reference/SLO.md`
**Effort:** M · **Risk:** low · **Depends on:** T3-03 (metrics), T3-08 (staging), T2-17 (UptimeRobot)

**Implementation steps:**
1. Define SLOs:
   - Availability: 99.5% uptime/month (allows ~3.6 hrs downtime; achievable on Render free tier)
   - Latency: p99 `/v1/health` < 500ms; p99 `/v1/run/default` < 20s (18 modules, external adapters)
   - Error rate: < 0.5% 5xx per rolling 24hr window
2. Write `SLO.md` documenting each SLO, its measurement method, and the consequences of breach.
3. Configure Grafana alerts (from T3-03) to fire when error budget is 50% consumed in a given window.
4. Review and tighten SLOs after 30 days of production data.

**Definition of done:** `SLO.md` committed; Grafana alerts configured for each SLO breach threshold.

**Status:** `open`

---

### T3-20 — Flutter app name consistency (seosync → neural-rank)

**Dimension:** Developer Experience · Documentation
**Current state:** `app/pubspec.yaml` declares the app name as `seosync`. The backend, GitHub repo, Render service, and all documentation refer to the product as `neural-rank`. This mismatch means the Play Store listing, the app's About screen, and the app's binary package name will say "seosync" — a different brand from everything else. This is a Play Store rejection risk and a brand consistency failure.
**Files:** `app/pubspec.yaml`, `app/android/app/build.gradle` (applicationId), `app/lib/` (any hardcoded app name strings)
**Effort:** S · **Risk:** medium · **Depends on:** T3-12

**Implementation steps:**
1. Update `name:` in `pubspec.yaml` from `seosync` to `neural_rank` (snake_case as required by Dart package naming rules).
2. Update `description:` to match the README description.
3. Update `applicationId` in `android/app/build.gradle` to `com.neuralrank.app` (or the chosen reverse-domain identifier).
4. Update `PRODUCT_BUNDLE_IDENTIFIER` in `ios/Runner.xcodeproj/project.pbxproj` to match.
5. Search all Dart files for hardcoded "seosync" strings and replace.
6. Rebuild the Flutter app; verify the app name shows correctly on device.

**Definition of done:** App shows as "Neural Rank" on device; no "seosync" references remain in any tracked file.

**Status:** `open`

---

### T3-21 — Implement volatility analysis in search intelligence

**Dimension:** Code Quality · Architecture
**Current state:** `domains/search-intelligence/service.js` — the `analyzeQuery()` function returns `volatility: "unknown"` or `volatility: "provider_unavailable"` with the comment "not yet fully modeled". This means the SERP volatility signal — a key input for determining whether to act on a ranking opportunity — is always absent. The search intelligence module advertises a capability it does not deliver.
**Files:** `backend/src/domains/search-intelligence/service.js`, `backend/src/domains/search-intelligence/opportunityScoring.js`
**Effort:** L · **Risk:** low

**Implementation steps:**
1. Define volatility signals available without external providers: position variance over multiple runs (if historical data exists), SERP feature presence/absence (featured snippets, knowledge panels indicate volatility), keyword difficulty tier.
2. Implement `deriveVolatility(serpData, historicalPositions)` in `opportunityScoring.js`:
   - High volatility: position variance > 10 positions, or SERP features present (frequently reshuffled)
   - Medium volatility: position variance 5–10, or moderate difficulty
   - Low volatility: position variance < 5, stable SERP features, low difficulty
   - Unknown: insufficient historical data (explicitly signal this, not silently return "unknown")
3. Wire into `analyzeQuery()` — replace hardcoded "unknown" with `deriveVolatility()` result.
4. Add test: a query with historical position data produces a non-"unknown" volatility classification.
5. Document the signal model and its limitations in a comment block in `opportunityScoring.js`.

**Definition of done:** `analyzeQuery()` returns a meaningful volatility classification based on available signals; "unknown" is only returned when no signals are present, not by default.

**Status:** `open`

---

### T3-22 — Flutter error boundary and crash resilience

**Dimension:** Developer Experience · Testing / QC
**Current state:** `app/lib/main.dart` has no error boundary. An unhandled exception in any widget or BLoC will crash the app with a Flutter red-screen error in debug mode or a blank/frozen screen in release mode. There is no global error handler, no crash reporting, and no graceful degradation.
**Files:** `app/lib/main.dart`, `app/lib/core/`
**Effort:** M · **Risk:** low · **Depends on:** T3-12

**Implementation steps:**
1. Add `FlutterError.onError` handler in `main()` — catches Flutter framework errors; logs to console in debug, reports to Sentry (or Firebase Crashlytics) in release.
2. Add `PlatformDispatcher.instance.onError` handler — catches Dart async errors outside the Flutter framework.
3. Wrap the root `MaterialApp` in an `ErrorBoundaryWidget` — a custom widget that catches child build errors and shows a friendly error screen instead of a red screen.
4. Add `runZonedGuarded(() => runApp(...), (error, stack) => reportError(error, stack))` in `main()` to catch synchronous errors in the startup zone.
5. Add a crash reporting integration (Firebase Crashlytics free tier or Sentry Flutter SDK).

**Definition of done:** An unhandled exception in a widget shows a friendly error screen in release builds; crash is reported to the monitoring service.

**Status:** `open`

---

### T3-23 — Flutter dependency version pinning

**Dimension:** Security · Developer Experience
**Current state:** `app/pubspec.yaml` uses `^` version constraints for all dependencies (e.g., `flutter_bloc: ^8.1.3`). The `^` prefix allows any compatible minor/patch version — a dependency update between two builds can introduce regressions or security issues without any code change. Enterprise Flutter apps should pin exact versions and update deliberately.
**Files:** `app/pubspec.yaml`, `app/pubspec.lock`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Remove `^` from all dependency version constraints in `pubspec.yaml` — use exact versions (e.g., `flutter_bloc: 8.1.3`).
2. Commit `pubspec.lock` to the repository (if not already committed) — this pins the full transitive dependency tree for reproducible builds.
3. Add `dependabot.yml` entry for Flutter/Dart package ecosystem (separate from the npm entry in T2-13):
   ```yaml
   - package-ecosystem: pub
     directory: /app
     schedule:
       interval: weekly
   ```
4. Document the update process in `CONTRIBUTING.md`: test the app after any pubspec update before merging.

**Definition of done:** All Flutter dependencies are exact-version pinned; `pubspec.lock` is committed; Dependabot creates update PRs weekly.

**Status:** `open`

---

### T3-24 — Wire real provider integrations for 13 stub adapters

**Dimension:** Architecture · Scalability
**Current state:** Only 5 of 18 module adapters are implemented: GSC, GA4, PageSpeed, backlink-provider, serp-provider. The remaining 13 modules run with `integration_incomplete` status and produce insights from synthetic or empty inputs. Users receive fabricated SEO analysis rather than signal-driven results. This is P1-3 in `PRODUCTION_READINESS_GAPS.md` — the highest-impact missing capability in the product.
**Files:** `backend/src/integrations/adapters/`, per-module `service.js` files
**Effort:** XL · **Risk:** high

**Implementation steps:**
1. Prioritise by signal value: (1) `keyword_analysis` → GSC keyword data; (2) `rank_tracking` → GSC position data; (3) `competitor_analysis` → needs a competitor intelligence provider (SEMrush, Ahrefs API); (4) `on_page_seo_scorer` → PageSpeed already wired; (5) `eeat_signals` → heuristic, no provider needed; (6) `topical_authority` → GSC + crawl data; (7) `site_architecture` → crawl data; (8) `analytics_integration` → GSC + GA4 both wired, wire into module.
2. For each module: create an adapter file in `integrations/adapters/`, wire it into the module's `service.js` via `createProviderAdapter`, update `integrations/catalog.js` to set `isImplemented: true`.
3. Each new adapter must handle the `integration_not_connected` fallback path identically to the existing 5 adapters.
4. Update `BACKEND_INTEGRATION_BOUNDARIES.md` as each adapter is implemented.
5. Note: `creative_messaging_layer`, `unified_workflow_layer`, `optimization_layer`, and `content_listing_insights` are synthesis modules — they can derive from other modules' outputs without external providers.

**Definition of done:** All 18 modules return signal-driven results; `integration_incomplete` no longer appears in any module run on a fully-configured instance.

**Status:** `open`

---

### T3-25 — Flutter Insight model — add missing mandatory fields

**Dimension:** Developer Experience · Architecture
**Current state:** `app/lib/data/models/insight.dart` is missing `evidence[]`, `explanation`, and `nextStep` fields that `FRONTEND_CONTENT_FULL_SYSTEM.md` mandates for every insight. The full `INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION` chain cannot be rendered in the production app without these fields — evidence chips, action buttons, and next-step links are not possible. This is P1-14 in `PRODUCTION_READINESS_GAPS.md`.
**Files:** `app/lib/data/models/insight.dart`, `app/lib/data/repositories/mock_repository.dart`, relevant screen widgets
**Effort:** M · **Risk:** low · **Depends on:** T3-12

**Implementation steps:**
1. Add fields to `Insight` model: `List<String> evidence`, `String explanation`, `String nextStep` — all nullable to avoid breaking existing mock data.
2. Update `MockRepository` to populate these fields with representative demo data for all insight types.
3. Update screen widgets to render:
   - `evidence` → evidence chip row below insight card
   - `explanation` → expandable detail section
   - `nextStep` → primary action button linking to recommendation creation
4. Update `ApiRepository` (T3-12) to deserialize these fields from backend responses when implemented.
5. Test: verify all 18 module insight types have populated `evidence`, `explanation`, and `nextStep` in the mock data.

**Definition of done:** All insight cards in the app display evidence, explanation, and a next-step action; no insight renders with empty evidence section.

**Status:** `open`

---

### T3-26 — Play Store submission assets

**Dimension:** Developer Experience
**Current state:** `app/` has no branded app icon (1024×1024 px), no splash screen, and no privacy policy URL — all three are required before Google Play Store submission. Without them, the app cannot be submitted regardless of code quality. This is P2-6 in `PRODUCTION_READINESS_GAPS.md`.
**Files:** `app/android/app/src/main/res/`, `app/lib/`, new `docs/product/PRIVACY_POLICY.md`
**Effort:** M · **Risk:** low · **Depends on:** T3-12, T3-20

**Implementation steps:**
1. Design and export a Neural Rank branded app icon at 1024×1024 px (PNG with transparency) and at all required Android density sizes (mdpi through xxxhdpi).
2. Add icon to `app/android/app/src/main/res/mipmap-*/` using `flutter_launcher_icons` package.
3. Add splash screen via `flutter_native_splash` package — use brand primary colour and Neural Rank wordmark.
4. Write `docs/product/PRIVACY_POLICY.md` — covers: data collected, how it's used, third-party services (Supabase, GSC, GA4), user rights, contact. Host as a public URL before submission.
5. Register privacy policy URL in Play Console and in `app/android/app/src/main/AndroidManifest.xml` as a metadata entry.

**Definition of done:** App icon appears on device home screen; splash screen shows on launch; privacy policy URL is live and linked in Play Console.

**Status:** `open`

---

### T3-27 — DB backup strategy documentation

**Dimension:** Data Layer · DevOps
**Current state:** No backup strategy is documented anywhere. Supabase free tier does not include point-in-time recovery (PITR). If the Supabase project is accidentally deleted or corrupted, all execution data, recommendations, tasks, and audit logs are unrecoverable. This is P2-2 in `PRODUCTION_READINESS_GAPS.md`.
**Files:** `README.md`, `docs/backend/reference/RUNBOOK.md` (T2-10)
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Document in `README.md` (Operations section): Supabase free tier does not include PITR. Manual export procedure: `pg_dump` via Supabase CLI (`supabase db dump -f backup_$(date +%Y%m%d).sql`) — run weekly.
2. Add to `RUNBOOK.md` (T2-10): "Database backup" scenario — exact `pg_dump` command, expected output size, storage location, restore procedure.
3. Add a `npm run db:dump` script to `package.json` that runs the Supabase CLI dump command.
4. Note the upgrade path: Supabase Pro tier ($25/month) enables daily PITR; document this as the production-scale recommendation.

**Definition of done:** `README.md` and `RUNBOOK.md` document the manual backup procedure with exact commands; `npm run db:dump` runs the export.

**Status:** `open`

---

### T3-28 — Adapter env vars missing from .env.example and README

**Dimension:** Developer Experience · Documentation
**Current state:** `.env.example` documents 7 env vars but 4 of the 5 implemented integration adapters read additional env vars that appear nowhere in documentation. A developer following the setup docs cannot configure GSC, GA4, PageSpeed, or Backlink adapters. Confirmed against adapter source files:
- `integrations/adapters/google-search-console.js`: `GSC_ACCESS_TOKEN`, `GSC_SITE_URL`
- `integrations/adapters/google-analytics-4.js`: `GA4_ACCESS_TOKEN`, `GA4_PROPERTY_ID`
- `integrations/adapters/pagespeed-insights.js`: `PAGESPEED_API_KEY`
- `integrations/adapters/backlink-provider.js`: `BACKLINK_PROVIDER`, `BACKLINK_API_KEY`, `BACKLINK_TARGET`

The SERP (`SERP_PROVIDER`, `SERP_API_KEY`) and renderer (`RENDERER_ENDPOINT`) adapters are already documented. Also: README intro text says "All 6 vars" but .env.example already has 7 (PORT is omitted from the README table) — fix both the count and the missing adapter section.
**Files:** `.env.example`, `README.md`, `render.yaml`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Add an "Integration adapter credentials" section to `.env.example`:
   ```
   # Google Search Console (rank_tracking, topical_authority modules)
   GSC_ACCESS_TOKEN=<oauth2-access-token>
   GSC_SITE_URL=https://your-site.com/
   
   # Google Analytics 4 (analytics_integration module)
   GA4_ACCESS_TOKEN=<oauth2-access-token>
   GA4_PROPERTY_ID=<ga4-property-id>
   
   # PageSpeed Insights (technical_seo_audit module)
   PAGESPEED_API_KEY=<google-cloud-api-key>
   
   # Backlink provider — choose one: ahrefs | moz | semrush
   BACKLINK_PROVIDER=ahrefs
   BACKLINK_API_KEY=<your-backlink-api-key>
   BACKLINK_TARGET=<default-target-domain>
   ```
2. Add all 8 vars as `sync: false` entries to `render.yaml`.
3. Add all 8 vars to the environment variables table in `README.md`; fix "All 6 vars" intro text to reflect the actual count.

**Definition of done:** `.env.example` documents all adapter env vars; README table includes all of them; render.yaml includes all 8 as `sync: false` entries.

**Status:** `open`

---

### T3-29 — Fix BACKEND_DOMAIN_SERVICE_ROUTES.md documentation drift

**Dimension:** Documentation
**Current state:** `docs/backend/decisions/BACKEND_DOMAIN_SERVICE_ROUTES.md` describes 4 domain services (technical-operations, search-intelligence, measurement, business-intelligence) as "intentionally routeless" — served only through the module run system. However, these domains now have explicit POST routes in `server.js` that were added on 2026-05-15 per CHANGELOG.md: `POST /technical-operations/audit`, `POST /search-intelligence/classify`, `POST /search-intelligence/analyze`, `POST /measurement/snapshots`, `POST /measurement/attributions`, `POST /measurement/attributions` (GET also), `POST /business-intelligence/profiles` (GET also). The doc has been stale since May 15 and misrepresents the current API surface.
**Files:** `docs/backend/decisions/BACKEND_DOMAIN_SERVICE_ROUTES.md`
**Effort:** S · **Risk:** low

**Implementation steps:**
1. Update the doc to describe the current state: the 4 domain services have dedicated POST (and some GET) routes in addition to being accessible through the module run system.
2. List all 6 current domain service routes with their purposes.
3. Add a historical note: "Decision origin: domains were initially routeless (modules-only access); direct routes added 2026-05-15 to enable standalone domain operations without a full module run."
4. Retire the "intentionally routeless" language.

**Definition of done:** Doc accurately reflects current server.js routing; no stale "routeless" claim without qualification.

**Status:** `open`

---

### T3-30 — Phase 2 module signal enhancements per PRODUCT_SEO_OS_BUILD_PLAN.md

**Dimension:** Architecture · Code Quality
**Current state:** `docs/product/PRODUCT_SEO_OS_BUILD_PLAN.md` (the authoritative product specification) defines field-level enhancements for 7 modules that are not yet implemented. The backend currently satisfies Phase 1 specs only. These Phase 2 fields are unimplemented and have no REBUILD_PLAN entry:
1. `keyword-analysis`: `intentSignal`, `trendDirection`, context-aware expansion (replace hardcoded tokens), `serpFeaturePresent`, `opportunityTier`
2. `competitor-analysis`: `backlinkGap`, `topicalGap`, `serpOverlapScore`, `contentVelocity`, 6-dimension `pressureScore`
3. `rank-tracking`: `clicks`, `impressions`, `ctr`, `ctrEfficiency`, `positionZeroTracking`, `quickWinFlag`, `rankingUrl`
4. `optimization-layer`: `readabilityScore`, `semanticRichness`, `keywordDensity`, `freshnessSignal`
5. `content-listing-insights`: `readabilityTier`, `eeAtContentSignals`, `competitorDepthComparison`, `structuredContentSignals`
6. `review-analysis`: reviewSource normalization (web reviews), `verifiedBuyerRatio`, review recency buckets, `responseRate`
7. `unified-workflow-layer`: `moduleWeights` multipliers, `foundationHealthCheck`, `quickWinCluster`

**Files:** Per-module `analysis.js`, `insights.js`, `actions.js`, `service.js` (7 modules); `docs/backend/reference/BACKEND_MASTER_SPEC.md`; `docs/backend/reference/BACKEND_MODULE_BOUNDARIES.md`
**Effort:** XL · **Risk:** medium · **Depends on:** T3-24 (provider adapters for provider-dependent fields), T3-28 (adapter env vars)

**Implementation steps:**
1. Implement provider-independent enhancements first: `optimization-layer`, `content-listing-insights`, `unified-workflow-layer`, `review-analysis`.
2. Implement `keyword-analysis`: `intentSignal` derives from `core/intentClassifier.js`; `serpFeaturePresent` requires SERP provider (T2-23); `trendDirection` requires historical GSC data.
3. Implement `rank-tracking`: `clicks/impressions/ctr` require GSC connection (GSC_ACCESS_TOKEN set per T3-28).
4. Implement `competitor-analysis`: `serpOverlapScore` requires SERP provider; `backlinkGap` requires backlink provider.
5. For each module: update `analysis.js` to derive new signals, `insights.js` to generate insights from them, `actions.js` for specific action items.
6. Update `BACKEND_MASTER_SPEC.md` and `BACKEND_MODULE_BOUNDARIES.md` with new field definitions.
7. Add test coverage for each new signal field.

**Definition of done:** All 7 modules produce the Phase 2 signal fields specified in `PRODUCT_SEO_OS_BUILD_PLAN.md`; each new field has test coverage; module boundaries doc reflects updated output shapes.

**Status:** `open`

---

### T3-31 — Frontend capability audit for 17 remaining modules

**Dimension:** Documentation · Developer Experience
**Current state:** `docs/frontend/planning/FRONTEND_BACKEND_CAPABILITY_AUDIT.md` has a complete audit only for Review Analysis (RA-01 through RA-15). The governing rule in that doc: "The frontend must not invent module capabilities. Each capability must be extracted from backend code, then projected into a feature surface before any UI work begins." 17 modules — the 7 Phase 1 modules excluding Review Analysis, plus all 10 Phase 2 modules — have no capability audit. `FRONTEND_CAPABILITY_TO_FEATURE_WORKFLOW_MAP.md` likewise only maps Review Analysis to subpages (RA-SP-01 through RA-SP-05); all other modules are listed as "Pending." Any frontend Phase 2 screen work without this audit violates the product's own methodology.
**Files:** `docs/frontend/planning/FRONTEND_BACKEND_CAPABILITY_AUDIT.md`, `docs/frontend/planning/FRONTEND_CAPABILITY_TO_FEATURE_WORKFLOW_MAP.md`
**Effort:** L · **Risk:** low

**Implementation steps:**
1. For each of the 17 remaining modules, read backend `service.js`, `analysis.js`, `insights.js`, `actions.js` to extract the full user-visible capability set.
2. Add capability entries to `FRONTEND_BACKEND_CAPABILITY_AUDIT.md` following the Review Analysis format (capability ID, source file, signal name, intended frontend surface).
3. After each module's audit, add the subpage map to `FRONTEND_CAPABILITY_TO_FEATURE_WORKFLOW_MAP.md` following the RA-SP-01 format.
4. Priority order: Phase 1 modules first (Content/Listing Insights, Keyword Analysis, Rank Tracking, Competitor Analysis, Optimization Layer, Creative/Messaging Layer, Unified Workflow Layer), then Phase 2 modules.
5. Gate: no new frontend screens for a module until its capability audit entry is complete.

**Definition of done:** Both audit docs have entries for all 18 modules; every module has at least one subpage map entry; no module has a frontend screen without a corresponding capability audit.

**Status:** `open`

---

### T3-32 — Extend FRONTEND_CONTENT_FULL_SYSTEM.md to cover 10 Phase 2 modules

**Dimension:** Documentation · Developer Experience
**Current state:** `docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md` defines the shared content block model (Block name, Input, Analysis, Insight, Explanation, Evidence, Impact, Action, Optional next step) and covers the original 8 modules only — its stated completion criteria are "all eight modules." The 10 Phase 2 backend modules (Technical SEO Audit, On-Page SEO Scorer, Backlink Intelligence, E-E-A-T Signals, Search Intent Classifier, SERP Feature Analyzer, Topical Authority, Site Architecture, Analytics Integration, Local SEO) have no content block definitions. Without this, any frontend Phase 2 screen work has no content model to build against — the insight/explanation/evidence/action fields that T3-25 mandates in the Flutter model have no source of truth for Phase 2 modules.
**Files:** `docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md`
**Effort:** M · **Risk:** low · **Depends on:** T3-31 (capability audit provides the signal inventory needed to define content blocks)

**Implementation steps:**
1. For each of the 10 Phase 2 modules, review backend `insights.js` and `actions.js` to understand the output shape.
2. Define content blocks for each module following the same format as the original 8 modules (block name, input, analysis, insight, explanation, evidence, impact, action, optional next step).
3. Add a "Phase 2 Modules" section to `FRONTEND_CONTENT_FULL_SYSTEM.md` covering all 10.
4. Update the doc's completion criteria from "all eight modules" to "all 18 modules."
5. Flag any Phase 2 module where backend output is insufficient to populate evidence/explanation fields — these cases justify backend work in T3-30.

**Definition of done:** `FRONTEND_CONTENT_FULL_SYSTEM.md` covers all 18 modules; content blocks defined for all 10 Phase 2 modules; completion criteria updated.

**Status:** `open`

---

## Progress tracker

| ID | Item | Tier | Status | Effort |
|---|---|---|---|---|
| T1-01 | Wire PostgreSQL at startup | 1 | `open` | M |
| T1-02 | Fix prototype pollution | 1 | `open` | S |
| T1-03 | Workspace isolation + RLS audit | 1 | `open` | L |
| T1-04 | CORS headers | 1 | `open` | S |
| T1-05 | Security response headers | 1 | `open` | S |
| T1-06 | Request access log | 1 | `open` | S |
| T1-07 | Fix rate limit doc discrepancy | 1 | `open` | S |
| T1-08 | Real /health checks | 1 | `open` | S |
| T1-09 | Auth bypass hardening (SUPABASE_URL unset) | 1 | `open` | S |
| T1-10 | X-Forwarded-For IP spoofing fix | 1 | `open` | S |
| T1-11 | Secrets scanning in CI | 1 | `open` | S |
| T1-12 | README HTTPS discrepancy | 1 | `open` | S |
| T1-13 | LICENSE file | 1 | `open` | S |
| T1-14 | NODE_ENV=production in render.yaml | 1 | `open` | S |
| T1-15 | verifySupabaseToken network error handling | 1 | `open` | S |
| T1-16 | Fix governance resultModel classification bug | 1 | `open` | S |
| T1-17 | Pre-persist governance block gate | 1 | `open` | S |
| T1-18 | Auth on all 6 domain POST endpoints | 1 | `open` | S |
| T2-01 | Correlation IDs | 2 | `open` | S |
| T2-02 | API versioning /v1/ | 2 | `open` | M |
| T2-03 | Pagination + filtering + sorting | 2 | `open` | L |
| T2-04 | Transaction wrapper | 2 | `open` | M |
| T2-05 | Real DB integration tests | 2 | `open` | L |
| T2-06 | OpenAPI specification | 2 | `open` | L |
| T2-07 | Coverage gate in CI | 2 | `open` | S |
| T2-08 | Input string length limits | 2 | `open` | S |
| T2-09 | Architecture decision records | 2 | `open` | M |
| T2-10 | Operational runbook | 2 | `open` | M |
| T2-11 | GitHub Actions CI workflow | 2 | `open` | S |
| T2-12 | Per-module execution timeout | 2 | `open` | M |
| T2-13 | Dependabot configuration | 2 | `open` | S |
| T2-14 | normalizeError registry refactor | 2 | `open` | S |
| T2-15 | Negative-path test suite | 2 | `open` | M |
| T2-16 | Sentry error tracking | 2 | `open` | S |
| T2-17 | UptimeRobot monitor (owner action) | 2 | `open` | S |
| T2-18 | Module run input validation | 2 | `open` | M |
| T2-19 | Single source of truth — module activation state | 2 | `open` | M |
| T2-20 | Shared database utility extraction | 2 | `open` | M |
| T2-21 | Audit log immutability enforcement | 2 | `open` | M |
| T2-22 | Fix hardcoded test suite count assertion | 2 | `open` | S |
| T2-23 | SERP provider configuration (owner action) | 2 | `open` | S |
| T2-24 | Renderer endpoint configuration (owner action) | 2 | `open` | M |
| T2-25 | Supabase database keep-alive | 2 | `open` | S |
| T2-26 | Module catalog integrity reverse check | 2 | `open` | S |
| T3-01 | Async module execution + queue | 3 | `open` | XL |
| T3-02 | OpenTelemetry tracing | 3 | `open` | L |
| T3-03 | Prometheus metrics endpoint | 3 | `open` | L |
| T3-04 | Redis rate limiter | 3 | `open` | M |
| T3-05 | Response caching | 3 | `open` | L |
| T3-06 | Docker + docker-compose | 3 | `open` | M |
| T3-07 | Pre-commit hooks (Husky) | 3 | `open` | S |
| T3-08 | Staging environment + smoke tests | 3 | `open` | M |
| T3-09 | Connection pool tuning | 3 | `open` | S |
| T3-10 | Module scaffolding generator | 3 | `open` | M |
| T3-11 | ETag / conditional requests | 3 | `open` | M |
| T3-12 | Flutter ApiRepository | 3 | `open` | XL |
| T3-13 | Router refactoring (map-based dispatcher) | 3 | `open` | M |
| T3-14 | Composable middleware stack | 3 | `open` | L |
| T3-15 | Domain service DI pattern | 3 | `open` | L |
| T3-16 | Load and performance tests | 3 | `open` | M |
| T3-17 | Flutter screen consolidation (ui/ → app/) | 3 | `open` | XL |
| T3-18 | Automated DB migration CI check | 3 | `open` | M |
| T3-19 | SLO definition and error budget | 3 | `open` | M |
| T3-20 | Flutter app name consistency (seosync → neural-rank) | 3 | `open` | S |
| T3-21 | Volatility analysis implementation | 3 | `open` | L |
| T3-22 | Flutter error boundary and crash resilience | 3 | `open` | M |
| T3-23 | Flutter dependency version pinning | 3 | `open` | S |
| T3-24 | Wire real provider integrations — 13 stub adapters | 3 | `open` | XL |
| T3-25 | Flutter Insight model — add evidence/explanation/nextStep | 3 | `open` | M |
| T3-26 | Play Store submission assets | 3 | `open` | M |
| T3-27 | DB backup strategy documentation | 3 | `open` | S |
| T3-28 | Adapter env vars missing from .env.example | 3 | `open` | S |
| T3-29 | Fix BACKEND_DOMAIN_SERVICE_ROUTES.md drift | 3 | `open` | S |
| T3-30 | Phase 2 module signal enhancements (7 modules) | 3 | `open` | XL |
| T3-31 | Frontend capability audit — 17 remaining modules | 3 | `open` | L |
| T3-32 | Extend FRONTEND_CONTENT_FULL_SYSTEM.md to Phase 2 | 3 | `open` | M |

**Total: 76 items** — 18 × Tier 1 · 26 × Tier 2 · 32 × Tier 3

---

## Projected score after each tier

| After | Code | Arch | API | Docs | DX | QC | Security | Data | DevOps | Scale | Overall |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Current | 88 | 82 | 83 | 90 | 80 | 78 | 72 | 70 | 65 | 55 | **76** |
| Tier 1 done | 91 | 83 | 88 | 93 | 80 | 78 | 95 | 83 | 80 | 63 | **85** |
| Tier 2 done | 94 | 91 | 96 | 99 | 87 | 94 | 95 | 91 | 90 | 73 | **92** |
| Tier 3 done | 99 | 99 | 99 | 99 | 99 | 99 | 99 | 99 | 99 | 97 | **98** |

**On the 98 vs 100 ceiling:** The final ~2 points require actions that are external to code:
a formal penetration test (converts "we believe it is secure" to "it has been externally verified"),
a compliance audit (SOC 2 Type II or equivalent), and sustained operational track record
(SLO met over 90 days). These cannot be committed as code. 98/100 is the realistic code-achievable ceiling.

---

## How to use this document

1. Pick the next open item from Tier 1 (top-to-bottom within each tier).
2. Set status to `in_progress` when work begins.
3. When resolved: set status to `resolved`, add the commit SHA and date.
4. Update `PRODUCTION_READINESS_GAPS.md` if the item maps to a P0/P1/P2 gap.
5. Add a `CHANGELOG.md` entry when a full tier is complete.
6. When all Tier 1 items are resolved, regrade Security, Data, and DevOps dimensions.
