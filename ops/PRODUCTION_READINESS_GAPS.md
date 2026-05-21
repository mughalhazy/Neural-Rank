# Neural Rank — Production Readiness Gap Register

**Audit date:** 2026-05-17
**Last updated:** 2026-05-19 (Tier 3 resolution — P2-2 resolved)
**Method:** 4-agent parallel audit (backend runtime · data/persistence · frontend/API · infra/ops) + full manual line-by-line verification of all critical files
**Anchor:** `DOC_CATALOGUE.md`
**Status:** 15 of 29 items resolved — P0-1 (code resolved, owner rotation pending), P0-2, P0-3 resolved; P1-5, P1-6, P1-7, P1-8, P1-9, P1-11 resolved; P2-1, P2-2, P2-3, P2-5, P2-9, P2-10 resolved

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

**Status:** CODE RESOLVED (2026-05-18) — `render.yaml` updated to `sync: false`; full git history scrubbed of JWT and DB password via `git filter-branch` + `git gc --prune=now`; force-pushed to GitHub. **Owner action still required before next deploy:** (1) rotate `SUPABASE_ANON_KEY` at Supabase dashboard → Settings → API; (2) set all 6 env vars in Render dashboard (values are no longer in the repo).

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

**Status:** RESOLVED (2026-05-19) — `backend/src/db.js` created with `pg.Pool` (max 5); `startServer()` now async, calls `initDb()`, passes `{ query }` into `baseContext`; graceful no-op when `DATABASE_URL` absent; DB probe added to `/health` (returns 503 on failure). Commit `285df1f` (T1-01, T1-08).

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

**Status:** RESOLVED (2026-05-19) — Migration `20260519000000_workspace_isolation.sql` adds `workspace_id` column to `execution_recommendations`, `execution_tasks`, `execution_task_status_history`, `execution_audit_logs`, `measurement_snapshots`, `measurement_attribution_links`; RLS enabled on all 33 `app_public` tables; workspace-scoped policies added; `createRecommendationRecord` and `createTaskRecord` carry `workspaceId`; `listRecommendations(workspaceId)` and `listTasks(workspaceId)` filter in both Postgres and in-memory repositories; `createRecommendation` in service.js passes `context.workspaceId`. Commit `285df1f` (T1-03).

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

**Status:** Owner-pending (T3-04) — code implementation ready; owner must create an Upstash free-tier Redis instance, set `REDIS_URL` in Render dashboard, then T3-04 can be completed. In-memory limiter remains active until then.

---

### P1-5 · Governance blocking is post-hoc — blocked actions are stored

**Files:** `backend/src/domains/execution/service.js` lines 54–68

`createRecommendation()` evaluates governance, attaches the result, and persists the record regardless of the governance classification. A `block`-classified recommendation is stored in the database. Blocking only prevents approval (line 107: `assertGovernanceAllowsApproval`). This pollutes the audit trail with dangerous actions.

**Fix required:** In `createRecommendation()`, after `evaluateActionGovernance()`, check if `governanceResult.overallClassification === 'block'` and throw a `governance_blocked` API error (403) before calling `repository.createRecommendation()`.

**Status:** RESOLVED (2026-05-19) — Pre-persist block gate added: `if (governanceResult.overallClassification === 'block') throw new Error('governance_blocks_${actionType}')` before any repository call. Also fixed: `resultModel.js` `requiresApproval` now correctly `false` for `block` classification (was erroneously `true`). Tests updated in `server.test.js` and `governance-engine.test.js` to assert 409 on block creation. Commit `285df1f` (T1-16, T1-17).

---

### P1-6 · Measurement domain POST endpoints are unauthenticated

**Files:** `backend/src/server.js` lines 394–430

`handleMeasurementSnapshots` (POST) and `handleMeasurementAttributions` (POST) do not call `requireIdentity()`. Any unauthenticated caller can create baseline/post-change snapshots and attribution records. Compare with execution endpoints which correctly call `requireIdentity(identity)` before mutations.

**Fix required:** Add `requireIdentity(identity)` call at the top of the POST branches in `handleMeasurementSnapshots` and `handleMeasurementAttributions`. Pass `identity` parameter into these handler functions from the main request handler.

**Status:** RESOLVED (2026-05-19) — Extended beyond the 2 measurement endpoints to all 6 unprotected domain POST handlers: `handleMeasurementSnapshots`, `handleMeasurementAttributions` (POST), `handleTechnicalOperationsAudit`, `handleSearchIntelligenceClassify`, `handleSearchIntelligenceAnalyze`, `handleBusinessIntelligenceProfiles` (POST). All now call `requireIdentity(identity)` and apply mutation rate limiting. Commit `285df1f` (T1-18).

---

### P1-7 · Auth bypass fallback when SUPABASE_URL is unset

**Files:** `backend/src/api/auth.js` lines 54–66

When `SUPABASE_URL` is null, `resolveRequestIdentity()` accepts any `x-neural-rank-actor` header value as identity with no verification. This is currently mitigated because `render.yaml` sets `SUPABASE_URL`. The risk activates if the env var is accidentally removed or a new deployment is created without copying env vars.

**Fix required:** Remove the header fallback entirely, or add an explicit `NODE_ENV !== 'production'` guard so the fallback only works in dev/CI. In production, missing `SUPABASE_URL` should cause all authenticated routes to return 503, not accept unverified headers.

**Status:** RESOLVED (2026-05-19) — `IS_PRODUCTION` guard added in `auth.js`: in production, absent `SUPABASE_URL` returns `null` (all mutations rejected) rather than activating the actor-header fallback. Startup warning logged at `{ kind: "auth_degraded" }`. `NODE_ENV=production` added to `render.yaml`. Actor-header fallback retained for `NODE_ENV !== 'production'` (local dev, CI). Commit `285df1f` (T1-09, T1-14).

---

### P1-8 · No keep-alive — Render and Supabase both pause on inactivity

**Files:** `render.yaml`, no cron job exists

Render free tier spins down after 15 minutes of no requests. Supabase free tier pauses the database after 7 days of no activity. No scheduled ping, cron job, or health-check exists to keep either alive.

**Fix required:**
1. Add an external uptime monitor (UptimeRobot free tier) pinging `https://neural-rank-backend.onrender.com/v1/health` every 5 minutes — prevents Render spindown
2. The `/v1/health` route already includes a Supabase `SELECT 1` probe on every request — 5-min pings keep the DB from pausing
3. Keep-alive strategy documented in `README.md`

**Status:** RESOLVED (2026-05-19) — `/v1/health` probes Supabase DB on every request (T2-25); keep-alive documented in README; UptimeRobot setup is owner-pending (T2-17).

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

**Status:** RESOLVED (2026-05-18) — `unhandledRejection` and `uncaughtException` handlers added to `backend/src/server.js`; structured JSON log output on rejection, process exits with code 1 on uncaught exception.

---

### P1-10 · No staging environment and no rollback plan

**Files:** `render.yaml`

`autoDeploy: true` means every push to `main` deploys directly to the live service. No staging environment, no approval gate, no instant rollback (a bad deploy requires a fix commit + ~2 min redeploy cycle).

**Fix required:**
1. Create a second Render service (`neural-rank-backend-staging`) pointing to a `staging` branch
2. Set `autoDeploy: false` on the production service — deploy manually after staging validation
3. Document the deploy process in `README.md`

**Status:** Owner-pending (T3-08) — owner must create a second Render service named `neural-rank-backend-staging` on the `staging` branch via Render dashboard. CI workflow already configured to trigger smoke tests on staging merge.

---

### P1-11 · CI does not catch type or lint errors

**Files:** `package.json`, `scripts/check-syntax.js`

`npm run ci` runs syntax check (`node --check`) + test suite. No ESLint, no TypeScript, no SAST. A broken module export, undefined variable, or wrong function signature passes CI and deploys. The 4 post-freeze bugs found manually would all have been caught by a linter.

**Fix required:**
1. Add `eslint` to dev dependencies with a minimal config (no-unused-vars, no-undef)
2. Add `"lint": "eslint backend/src --ext .js"` to `package.json` scripts
3. Add `npm run lint` to the `ci` script: `npm run check && npm run lint && npm run test:backend:ci`

**Status:** RESOLVED (2026-05-18) — ESLint (`^8.57.0`) added as devDependency; `.eslintrc.json` with `no-unused-vars` + `no-undef`; `npm run lint` added; `ci` script updated to `npm run check && npm run lint && npm run test:backend:ci`. Also: `npm run check:secrets` (secrets scanner) added to CI pipeline 2026-05-19 (commit `285df1f`, T1-11).

---

### P1-12 · No load or concurrency tests

**Files:** `backend/src/full-backend-validation.test.js`

29 tests cover happy paths, adapter fallbacks, and persistence patterns. Zero tests cover: concurrent `/run/default` requests, cold-start latency under 17-module execution, provider outage cascades, or memory pressure. The free-tier OOM risk (17 modules × execution cost approaching 512MB RAM limit) is unquantified.

**Fix required:**
1. Add a load test script (`scripts/load-test.js` using `autocannon` or similar) that fires 10 concurrent `/run/default` requests
2. Measure memory usage and p95 response time
3. Add a CI step that fails if p95 > 10s or memory > 400MB

**Status:** Owner-pending (T3-16) — depends on staging environment (T3-08). SLO targets defined in `SLO.md`: p99 /v1/health < 500ms, p99 /v1/run/default < 20s.

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

**Status:** Owner-pending (T3-25) — `FRONTEND_CONTENT_FULL_SYSTEM.md` now covers all 18 modules with full evidence/explanation/nextStep schema (T3-32, 2026-05-19). Dart model fields and widget rendering are the remaining step, depends on T3-12 (Flutter ApiRepository).

---

## P2 — Not Production Grade

These do not block launch but must be resolved before public scale.

| ID | Finding | File(s) | Fix |
|----|---------|---------|-----|
| P2-1 | ~~No `.env.example`~~ **RESOLVED (2026-05-18)** — `.env.example` created documenting all env vars; expanded 2026-05-19 with `NODE_ENV`, `ALLOWED_ORIGIN`, `TRUSTED_PROXY_COUNT` (T1-04, T1-09, T1-10, T1-14) | root | ✅ |
| P2-2 | ~~No database backup strategy~~ **RESOLVED (2026-05-19)** — `npm run db:dump` script added; backup procedure documented in `README.md` (Operations section) and `RUNBOOK.md` (Scenario 7); Supabase Pro PITR noted as upgrade path (T3-27) | none | ✅ |
| P2-3 | ~~No API versioning strategy~~ **RESOLVED (2026-05-19)** — all 26 routes under `/v1/`; legacy paths redirect 301 with `Deprecation: true`; `/v1/openapi.json` + `/v1/docs` added (T2-02, T2-06) | `server.js` | ✅ |
| P2-4 | Dual intent classifiers undocumented for future integrators | `docs/backend/decisions/BACKEND_DUAL_CLASSIFIER_DECISION.md` | Already has a decision doc — add explicit warning about not exposing both in a single aggregated response |
| P2-5 | ~~`assertModuleCatalogIntegrity()` is unidirectional~~ **RESOLVED (2026-05-19)** — reverse check added: registry keys not in either activation set raise an error (T2-26) | `core/activation.js` | ✅ |
| P2-6 | No Play Store assets | `app/` | Create branded app icon (1024×1024), splash screen, and privacy policy URL before submission |
| P2-7 | No request body size limit | `backend/src/server.js` | The 1MB limit in `readJsonBody()` (line 104) is already implemented — this P2 was a false alarm from the audit |
| P2-8 | Cross-workspace contamination at domain service singleton layer | `backend/src/server.js` | Domain service singletons created without workspace context — address as part of P0-3 workspace isolation work |
| P2-9 | ~~No monitoring or error aggregation~~ **RESOLVED (2026-05-19)** — `core/errorReporter.js` zero-dep Sentry reporter wired in; `SENTRY_DSN` in `render.yaml` + `.env.example`; `unhandledRejection` + `uncaughtException` + 5xx route errors reported (T2-16) | `core/errorReporter.js`, `render.yaml` | ✅ |
| P2-10 | ~~No API documentation for external consumers~~ **RESOLVED (2026-05-19)** — `GET /v1/openapi.json` returns OpenAPI 3.1 spec; `GET /v1/docs` renders Swagger UI; contract test in `server.test.js` (T2-06) | `api/openapi.js`, `docs/backend/reference/OPENAPI.yaml` | ✅ |

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
