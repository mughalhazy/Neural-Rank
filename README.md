# Neural Rank

[![CI](https://github.com/mughalhazy/Neural-Rank/actions/workflows/ci.yml/badge.svg)](https://github.com/mughalhazy/Neural-Rank/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Neural Rank is a unified SEO intelligence platform — a 18-module backend SEO OS powering keyword analysis, rank tracking, technical audits, backlink intelligence, content scoring, and more.

---

## Project structure

```
Neural Rank/
├── app/                  Flutter mobile app (BLoC architecture — canonical production app)
├── backend/              Node.js SEO OS backend (18 modules)
├── design/               All design assets
│   ├── inspiration/      Raw reference images
│   ├── library/          HTML design review library (captures, inspection tool)
│   ├── mockups/
│   │   └── archetypes/   HTML archetype mockups
│   └── screenshots/      UI screenshots
├── ui/                   Flutter UI prototype (design archetype layer — pending consolidation into app/)
├── docs/
│   ├── backend/
│   │   ├── reference/    Live backend specs (master spec, module boundaries, APIs)
│   │   ├── decisions/    One-time architectural decisions (dual classifier, service routes)
│   │   ├── implementation/ Completed work records (domain services, QC, schema alignment)
│   │   ├── analysis/     Gap scans and audit reports
│   │   └── archive/      Phase 1 freeze records (historical, superseded)
│   ├── frontend/
│   │   ├── reference/    Live design system rules (UI baseline, content system, design language)
│   │   ├── planning/     Active planning docs (master plan, screen archetypes, capability maps)
│   │   ├── phases/       Completed phase deliverables PHASE_01–PHASE_13 (historical)
│   │   └── logs/         Iteration logs, implementation history, gap register
│   └── product/
│       ├── archive/      Historical decision records (market research)
│       └── *.md          Active product docs (build plan, UI architecture, build spec)
├── scripts/              CI and build scripts
├── supabase/             Database migrations (9 applied)
├── .env.example          Environment variable reference — copy to .env for local dev
├── .eslintrc.json        ESLint config (no-unused-vars, no-undef)
├── CHANGELOG.md          All notable changes — keepachangelog.com format
├── CONTRIBUTING.md       Branch naming, commit style, doc update rules
├── SECURITY.md           Responsible disclosure policy
├── package.json          Root scripts — start, check, lint, test, ci
├── render.yaml           Render free-tier deployment blueprint (env vars via dashboard)
└── progress.md           Session anchor and milestone log
```

---

## Backend

**Status:** Live on Render free tier · 18 modules · 30/30 tests passing · grade 91/100

| | |
|---|---|
| Health endpoint | `https://neural-rank-backend.onrender.com/v1/health` |
| Entry point | `backend/src/server.js` |
| Start | `npm start` |
| Test | `npm run test:backend` |
| Lint | `npm run lint` (ESLint — no-unused-vars, no-undef) |
| CI | `npm run ci` (syntax check + lint + full suite) |

### 18 active modules

| Module | Default active |
|---|---|
| Technical SEO Audit | ✅ |
| On-Page SEO Scorer | ✅ |
| Keyword Analysis | ✅ |
| Rank Tracking | ✅ |
| Competitor Analysis | ✅ |
| Backlink Intelligence | ✅ |
| E-E-A-T Signals | ✅ |
| Search Intent Classifier | ✅ |
| SERP Feature Analyzer | ✅ |
| Topical Authority | ✅ |
| Site Architecture | ✅ |
| Analytics Integration | ✅ |
| Content / Listing Insights | ✅ |
| Optimization Layer | ✅ |
| Creative / Messaging Layer | ✅ |
| Review Analysis | ✅ |
| Unified Workflow Layer | ✅ |
| Local SEO | opt-in |

### API surface (26 routes — all under `/v1/`)

All routes are versioned under `/v1/`. Legacy unversioned paths (e.g. `/health`) redirect 301 → `/v1/health`.

| Route | Purpose |
|---|---|
| `GET /v1/health` | Health + active module count |
| `GET /v1/ready` | Readiness check |
| `GET /v1/modules` | Full module catalog |
| `POST /v1/run/default` | Run all 17 active modules |
| `POST /v1/run/activation-aware` | Run with activation overrides |
| `POST /v1/modules/:key/run` | Run a single module |
| `GET/POST /v1/execution/recommendations` | Recommendation lifecycle |
| `PATCH /v1/execution/recommendations/:id/status` | Approve / reject |
| `POST /v1/execution/recommendations/:id/tasks` | Create task from recommendation |
| `GET /v1/execution/tasks` | List tasks |
| `GET /v1/execution/tasks/:id` | Get task |
| `PATCH /v1/execution/tasks/:id/status` | Update task status |
| `GET /v1/execution/tasks/:id/history` | Task status history |
| `GET /v1/execution/audit-logs` | Audit log |
| `GET /v1/measurement/metrics` | Metric source registry |
| `POST /v1/measurement/snapshots` | Record baseline / post-change snapshot |
| `POST/GET /v1/measurement/attributions` | Attribution links |
| `POST /v1/technical-operations/audit` | Source HTML audit |
| `POST /v1/search-intelligence/classify` | Intent classification |
| `POST /v1/search-intelligence/analyze` | Full SERP query analysis |
| `GET/POST /v1/business-intelligence/profiles` | Business profiles |
| `GET /v1/openapi.json` | OpenAPI 3.1 spec (machine-readable) |
| `GET /v1/docs` | Swagger UI (browser) |

### Rate limiting

All requests are rate-limited by IP address: **120 req/min** default, **30 req/min** for mutation endpoints (POST/PATCH with identity). Limits are enforced in-process and reset on restart (persistent Redis limiter is a Tier 3 item). Rate limit state is exposed via `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` response headers.

### Database (Supabase)

- Project: `neural-rank` · ref `bvujfwwwwzlpsxbshxyn` · `us-east-1` · free tier
- Dashboard: `https://supabase.com/dashboard/project/bvujfwwwwzlpsxbshxyn`
- Migrations: 12 applied · 33 tables in `app_public`
- **Keep-alive:** The `/v1/health` probe runs `SELECT 1` on every call. UptimeRobot (T2-17) pings `/v1/health` every 5 minutes, preventing Supabase from pausing after 7 days of inactivity. **Do not disable the UptimeRobot monitor.**

---

## Key docs

| Doc | Purpose |
|---|---|
| `docs/backend/reference/BACKEND_MASTER_SPEC.md` | Full backend specification |
| `docs/backend/reference/BACKEND_MODULE_BOUNDARIES.md` | Per-module boundaries (all 18) |
| `docs/backend/reference/BACKEND_DOMAIN_BOUNDARIES.md` | All 18 modules mapped to 8 bounded contexts |
| `docs/backend/reference/BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md` | API route audit |
| `docs/backend/implementation/BACKEND_QC_PHASE2.md` | Phase 2 QC — 10 expansion modules |
| `docs/backend/analysis/SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Production readiness gaps |
| `docs/product/PRODUCT_SEO_OS_BUILD_PLAN.md` | Full expansion build plan (authoritative) |
| `docs/product/PRODUCTION_READINESS_GAPS.md` | Live gap register — P0/P1/P2 backlog with fix instructions |
| `CONTRIBUTING.md` | Branch naming, commit style, doc update rules |
| `progress.md` | Session milestone log and resume anchors |

---

## Environment variables

All 6 vars are documented in `.env.example`. Copy it to `.env` for local dev. Production values live in the Render dashboard only — `render.yaml` uses `sync: false` and contains no plaintext secrets.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key for JWT verification |
| `SERP_PROVIDER` | `serpapi` or `dataforseo` |
| `SERP_API_KEY` | API key for the SERP provider |
| `RENDERER_ENDPOINT` | URL of a headless renderer service (optional) |
| `DATABASE_URL` | PostgreSQL connection string for persistent execution data |
| `PORT` | Server port (default 10000 on Render) |
