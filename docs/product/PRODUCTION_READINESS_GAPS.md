# Neural Rank — Production Readiness Gap Register

**Audit date:** 2026-05-17
**Method:** 4-agent parallel audit (backend runtime · data/persistence · frontend/API · infra/ops) + full manual line-by-line verification of all critical files
**Anchor:** `DOC_CATALOGUE.md`
**Status:** Open — no P0 resolved as of audit date

---

## How to use this document

Work top-to-bottom. P0s block any real user traffic. P1s degrade operation. P2s are not blocking but must be resolved before public scale. Mark each item `RESOLVED` with date and PR/commit when done.

---

## P0 — Breaks Production

These must be fixed before any real users are onboarded.

---

### P0-1 · Credentials committed to tracked files

**Files:** `render.yaml` lines 13–15, `progress.md` line 153 (password now redacted in progress.md)

`render.yaml` commits `SUPABASE_URL` and `SUPABASE_ANON_KEY` as plaintext values. Anyone with repo access can read the live Supabase project URL and the JWT anon key used to forge tokens and access the database.

**Fix required:**
1. Rotate `SUPABASE_ANON_KEY` immediately at `https://supabase.com/dashboard/project/bvujfwwwwzlpsxbshxyn/settings/api`
2. Rotate the DB password at Supabase dashboard → Database → Database password
3. Update `render.yaml` to use `sync: false` for all secret env vars — values live in Render dashboard only, not in the file
4. Verify `.gitignore` does not accidentally expose any `.env` file

**Status:** Open

---

### P0-2 · No database connection initialised at server startup

**Files:** `backend/src/server.js`, `backend/src/domains/execution/service.js`, `backend/src/core/persistence.js`

`server.js` calls `startServer()` with no `baseContext` argument. `createServer({ baseContext: {} })` passes an empty object. `resolveQueryFunction(context)` finds no `context.query` and returns `null`. All 18 module repositories and the entire execution lifecycle (recommendations, tasks, audit logs) fall back to an in-memory singleton. Every module run result and execution record is lost on every Render restart (~every 15 min of inactivity on free tier).

**Fix required:**
1. Add `pg` (node-postgres) to `package.json` dependencies
2. Create `backend/src/db.js` — initialise a `pg.Pool` from `DATABASE_URL` env var
3. In `startServer()`, resolve the query function and pass it into `baseContext: { query }`
4. Add `DATABASE_URL` to `render.yaml` as `sync: false`
5. Set `DATABASE_URL` in Render dashboard — format: `postgresql://postgres:[PASSWORD]@db.bvujfwwwwzlpsxbshxyn.supabase.co:5432/postgres`
6. Ensure graceful fallback with a clear warning log if `DATABASE_URL` is not set (so CI continues to work)

**Status:** Open

---

### P0-3 · Workspace isolation not enforced at query layer

**Files:** `backend/src/domains/execution/service.js`, `backend/src/domains/execution/repository.js`

`workspaceId` is extracted from request headers and stored in context but is never used to filter any SQL query. `listRecommendations()`, `listTasks()`, and `listAuditLogs()` return all records globally. Workspace A can read all of Workspace B's data.

The `execution_recommendations` and `execution_tasks` tables (migration `20260506120000`) have no `workspace_id` column — a schema migration is needed before query-level filtering can be added.

**Fix required:**
1. Add migration: `ALTER TABLE app_public.execution_recommendations ADD COLUMN workspace_id text;` (and same for tasks, audit logs)
2. Update all `INSERT` statements in `execution/repository.js` to write `workspaceId` from context
3. Update all `SELECT` statements to filter `WHERE workspace_id = $1` when `context.workspaceId` is present
4. Apply migration to Supabase: `supabase db push` or via dashboard SQL editor

**Status:** Open

---

### P0-4 · Two Flutter apps — Play Store submission blocked

**Files:** `ui/`, `app/`

Two separate Flutter applications exist with two `pubspec.yaml` files. A Play Store submission requires a single AAB from a single app. `app/` is the production-ready BLoC app (renamed from `SEOSync_Flutter_App/` — 2026-05-18). `ui/` is the UI prototype / design archetype layer (renamed from `frontend/` — 2026-05-18).

**Fix required:**
1. Port screens and components from `ui/` into `app/` — the UI prototype has 12 feature screens, icon system, state host, shared components not yet in the production app
2. Archive `ui/` once porting is complete — it is not a production app and should not be submitted to the Play Store
3. All future frontend work goes in `app/` only

**Status:** Open

---

### P0-5 · Zero backend API integration in Flutter — all data is mock

**Files:** `app/lib/data/repositories/mock_repository.dart`, `app/pubspec.yaml`

`mock_repository.dart` (293 lines) uses `Future.delayed()` and hardcoded return values for every method. Zero HTTP calls. `dio: ^5.4.0` and `supabase_flutter: ^2.0.0` are declared in `pubspec.yaml` but never instantiated. None of the 24 backend routes are called by either Flutter app.

**Fix required:**
1. Create `app/lib/data/repositories/api_repository.dart` implementing `SEORepository` with real `Dio` HTTP calls
2. Wire at minimum these routes: `POST /run/default`, `GET /modules`, `GET /execution/recommendations`, `PATCH /execution/recommendations/:id/status`
3. Implement auth token injection via Dio interceptor (`Authorization: Bearer <token>`)
4. Implement login screen → call auth → store JWT via Hive → inject on all requests
5. Swap `MockRepository` for `ApiRepository` in the dependency injection layer
6. Handle error states, loading states, and empty states in all BLoCs

**Status:** Open

---

## P1 — Limits Production

These degrade operation. Fix before public launch.

---

### P1-1 · SERP_PROVIDER and SERP_API_KEY env vars not set

**Files:** `render.yaml`, `backend/src/integrations/adapters/serp-provider.js`

The SERP adapter (`serp-provider.js`) is fully implemented for both SerpApi and DataForSEO. It returns `integration_not_connected` when env vars are missing. `render.yaml` does not include `SERP_PROVIDER` or `SERP_API_KEY`. The `serp_feature_analyzer` module runs but produces empty SERP data for all requests.

**Fix required:**
1. Obtain API credentials from SerpApi (`https://serpapi.com`) or DataForSEO (`https://dataforseo.com`)
2. Add `SERP_PROVIDER` (value: `serpapi` or `dataforseo`) and `SERP_API_KEY` to Render dashboard
3. Add both as `sync: false` entries in `render.yaml`

**Status:** Open

---

### P1-2 · Rendered DOM analysis is a permanent placeholder

**Files:** `backend/src/domains/technical-operations/service.js`, `render.yaml`

`buildRenderedDomPlaceholder()` returns `{ status: "renderer_not_configured" }` when `RENDERER_ENDPOINT` is not set. `technical_seo_audit` silently skips Core Web Vitals, JS-rendered content, and rendering errors. `RENDERER_ENDPOINT` is not set in `render.yaml`.

**Fix required:**
1. Deploy a Playwright renderer service (e.g., on Render free tier as a second service, or use a managed headless browser API)
2. Set `RENDERER_ENDPOINT` env var pointing to the renderer's URL
3. Add `RENDERER_ENDPOINT` as `sync: false` in `render.yaml`

**Status:** Open

---

### P1-3 · 13 of 18 module adapters are stubs

**Files:** `backend/src/integrations/adapters/`

Only 5 adapters are implemented: GSC, GA4, PageSpeed, backlink-provider, serp-provider. The remaining 13 modules execute with `integration_incomplete` status and produce insights from synthetic/empty inputs. Users receive fabricated SEO analysis, not real signal-driven results.

**Fix required:** Wire real provider integrations per module, starting with highest-value modules (keyword-analysis → GSC, rank-tracking → GSC, backlink-intelligence → backlink-provider). Each integration requires API credentials and an adapter implementation.

**Status:** Open

---

### P1-4 · Rate limiting is in-memory — resets on every restart

**Files:** `backend/src/core/rateLimiter.js`

Rate limiting is enforced and does block requests (confirmed). However, the `Map` store lives in process memory. Every Render restart clears all rate limit state. A coordinated attacker can bypass limits by timing requests around restart cycles.

**Fix required:** Replace the in-memory `Map` with a persistent store (Redis via Upstash free tier, or a lightweight Supabase-backed counter). Upstash Redis has a free tier compatible with the current infrastructure constraint.

**Status:** Open

---

### P1-5 · Governance blocking is post-hoc — blocked actions are stored

**Files:** `backend/src/domains/execution/service.js` lines 54–68

`createRecommendation()` evaluates governance, attaches the result, and persists the record regardless of the governance classification. A `block`-classified recommendation is stored in the database. Blocking only prevents approval (line 107: `assertGovernanceAllowsApproval`). This pollutes the audit trail with dangerous actions.

**Fix required:** In `createRecommendation()`, after `evaluateActionGovernance()`, check if `governanceResult.overallClassification === 'block'` and throw a `governance_blocked` API error (403) before calling `repository.createRecommendation()`.

**Status:** Open

---

### P1-6 · Measurement domain POST endpoints are unauthenticated

**Files:** `backend/src/server.js` lines 394–430

`handleMeasurementSnapshots` (POST) and `handleMeasurementAttributions` (POST) do not call `requireIdentity()`. Any unauthenticated caller can create baseline/post-change snapshots and attribution records. Compare with execution endpoints which correctly call `requireIdentity(identity)` before mutations.

**Fix required:** Add `requireIdentity(identity)` call at the top of the POST branches in `handleMeasurementSnapshots` and `handleMeasurementAttributions`. Pass `identity` parameter into these handler functions from the main request handler.

**Status:** Open

---

### P1-7 · Auth bypass fallback when SUPABASE_URL is unset

**Files:** `backend/src/api/auth.js` lines 54–66

When `SUPABASE_URL` is null, `resolveRequestIdentity()` accepts any `x-neural-rank-actor` header value as identity with no verification. This is currently mitigated because `render.yaml` sets `SUPABASE_URL`. The risk activates if the env var is accidentally removed or a new deployment is created without copying env vars.

**Fix required:** Remove the header fallback entirely, or add an explicit `NODE_ENV !== 'production'` guard so the fallback only works in dev/CI. In production, missing `SUPABASE_URL` should cause all authenticated routes to return 503, not accept unverified headers.

**Status:** Open

---

### P1-8 · No keep-alive — Render and Supabase both pause on inactivity

**Files:** `render.yaml`, no cron job exists

Render free tier spins down after 15 minutes of no requests. Supabase free tier pauses the database after 7 days of no activity. No scheduled ping, cron job, or health-check exists to keep either alive.

**Fix required:**
1. Add an external uptime monitor (UptimeRobot free tier) pinging `https://neural-rank-backend.onrender.com/health` every 5 minutes — prevents Render spindown
2. Add a weekly scheduled task that queries the Supabase database — prevents Supabase pause
3. Document keep-alive strategy in `README.md`

**Status:** Open

---

### P1-9 · No unhandled rejection handler — process crashes silently

**Files:** `backend/src/server.js`

No `process.on('unhandledRejection', ...)` or `process.on('uncaughtException', ...)` handler exists. Any unhandled async rejection at runtime crashes the process with no structured log output. Render restarts the container but there is no error telemetry.

**Fix required:** Add to `server.js`:
```js
process.on('unhandledRejection', (reason) => {
  console.log(JSON.stringify({ kind: 'unhandled_rejection', reason: String(reason) }));
});
```

**Status:** Open

---

### P1-10 · No staging environment and no rollback plan

**Files:** `render.yaml`

`autoDeploy: true` means every push to `main` deploys directly to the live service. No staging environment, no approval gate, no instant rollback (a bad deploy requires a fix commit + ~2 min redeploy cycle).

**Fix required:**
1. Create a second Render service (`neural-rank-backend-staging`) pointing to a `staging` branch
2. Set `autoDeploy: false` on the production service — deploy manually after staging validation
3. Document the deploy process in `README.md`

**Status:** Open

---

### P1-11 · CI does not catch type or lint errors

**Files:** `package.json`, `scripts/check-syntax.js`

`npm run ci` runs syntax check (`node --check`) + test suite. No ESLint, no TypeScript, no SAST. A broken module export, undefined variable, or wrong function signature passes CI and deploys. The 4 post-freeze bugs found manually would all have been caught by a linter.

**Fix required:**
1. Add `eslint` to dev dependencies with a minimal config (no-unused-vars, no-undef)
2. Add `"lint": "eslint backend/src --ext .js"` to `package.json` scripts
3. Add `npm run lint` to the `ci` script: `npm run check && npm run lint && npm run test:backend:ci`

**Status:** Open

---

### P1-12 · No load or concurrency tests

**Files:** `backend/src/full-backend-validation.test.js`

29 tests cover happy paths, adapter fallbacks, and persistence patterns. Zero tests cover: concurrent `/run/default` requests, cold-start latency under 17-module execution, provider outage cascades, or memory pressure. The free-tier OOM risk (17 modules × execution cost approaching 512MB RAM limit) is unquantified.

**Fix required:**
1. Add a load test script (`scripts/load-test.js` using `autocannon` or similar) that fires 10 concurrent `/run/default` requests
2. Measure memory usage and p95 response time
3. Add a CI step that fails if p95 > 10s or memory > 400MB

**Status:** Open

---

### P1-13 · Frontend archetype subpages not in production app

**Files:** `app/lib/presentation/screens/`

All 15 gap register items were resolved in `ui/` (drilldown scaffold, icon system, state host, shared components). None of those resolutions were ported to `app/`, which is the production app. The production app has parent screens only — no drilldown, no configuration screens, no evidence display.

**Fix required:** Port from `ui/lib/shared/` to `app/lib/presentation/components/`:
- Icon system (`app_icon.dart`)
- State host component (`ScreenStateHost`)
- Shared widgets (cards, buttons, alerts, filters)
- Drilldown scaffold (complaint clusters, action detail, evidence samples)
- Configuration archetype screens

**Status:** Open

---

### P1-14 · Insight data model incomplete in production app

**Files:** `app/lib/data/models/insight.dart`

The `Insight` model is missing `evidence[]`, `explanation`, and `nextStep` fields that `FRONTEND_CONTENT_FULL_SYSTEM.md` mandates. The full `INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION` chain cannot be rendered in the production app.

**Fix required:**
1. Add `evidence`, `explanation`, `nextStep` fields to the `Insight` model
2. Update `MockRepository` (and later `ApiRepository`) to populate these fields
3. Update screens to render evidence chips, action buttons, and next-step links

**Status:** Open

---

## P2 — Not Production Grade

These do not block launch but must be resolved before public scale.

| ID | Finding | File(s) | Fix |
|----|---------|---------|-----|
| P2-1 | No `.env.example` — local setup requires reading `render.yaml` | root | Create `/.env.example` documenting all 6 env vars with descriptions |
| P2-2 | No database backup strategy | none | Document backup schedule in `README.md`; enable Supabase PITR when upgrading tier |
| P2-3 | No API versioning strategy | `docs/backend/reference/BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md` | Document versioning strategy (e.g. `Accept-Version` header or `/v1/` prefix) before any external consumers are onboarded |
| P2-4 | Dual intent classifiers undocumented for future integrators | `docs/backend/decisions/BACKEND_DUAL_CLASSIFIER_DECISION.md` | Already has a decision doc — add explicit warning about not exposing both in a single aggregated response |
| P2-5 | `assertModuleCatalogIntegrity()` is unidirectional | `backend/src/core/activation.js` | Add check: every module in `serviceRegistry` must appear in `DEFAULT_ACTIVE_MODULES` or `BUILT_BUT_INACTIVE_MODULES` |
| P2-6 | No Play Store assets | `app/` | Create branded app icon (1024×1024), splash screen, and privacy policy URL before submission |
| P2-7 | No request body size limit | `backend/src/server.js` | The 1MB limit in `readJsonBody()` (line 104) is already implemented — this P2 was a false alarm from the audit |
| P2-8 | Cross-workspace contamination at domain service singleton layer | `backend/src/server.js` | Domain service singletons created without workspace context — address as part of P0-3 workspace isolation work |
| P2-9 | No monitoring or error aggregation | `render.yaml` | Add Sentry DSN env var + `@sentry/node` to backend; add UptimeRobot monitor on `/health` |
| P2-10 | No API documentation for external consumers | none | Generate OpenAPI spec from `BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md` route table |

---

## Confirmed non-issues (agent findings that were wrong)

| Agent claim | Verdict | Evidence |
|-------------|---------|----------|
| "Rate limiting not enforced, only headers set" | **False** — rate limiting IS enforced and blocks requests | `rateLimiter.js` lines 18–34; `server.js` `applyRateLimit()` calls `sendTooManyRequests()` when `!allowed` |
| "local_seo cannot be activated via API" | **False** — it can be activated by passing `options.allowInactiveActivation: true` | `activation.js` line 85; `server.js` passes `body.options` through to `runActivationAwareFlow` |
| "SERP provider not wired into search-intelligence domain" | **Partially false** — adapter is fully implemented; issue is missing env vars, not missing wiring | `serp-provider.js` lines 235–288 |
| "No request size limit — large payload DoS possible" | **False** — `readJsonBody()` line 104 already enforces 1MB limit | `server.js` line 104: `if (body.length > 1024 * 1024)` |

---

## Maintenance

When a gap is resolved:
1. Mark the item `**Status: RESOLVED — [date] · [commit/PR]**`
2. Update `DOC_CATALOGUE.md` if any new files were created
3. Update `progress.md` with the milestone
