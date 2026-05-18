# Neural Rank

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

**Status:** Live on Render free tier · 18 modules · 29/29 tests passing

| | |
|---|---|
| Health endpoint | `https://neural-rank-backend.onrender.com/health` |
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

### API surface (24 routes)

| Route | Purpose |
|---|---|
| `GET /health` | Health + active module count |
| `GET /ready` | Readiness check |
| `GET /modules` | Full module catalog |
| `POST /run/default` | Run all 17 active modules |
| `POST /run/activation-aware` | Run with activation overrides |
| `POST /modules/:key/run` | Run a single module |
| `GET/POST /execution/recommendations` | Recommendation lifecycle |
| `PATCH /execution/recommendations/:id/status` | Approve / reject |
| `POST /execution/recommendations/:id/tasks` | Create task from recommendation |
| `GET /execution/tasks` | List tasks |
| `GET /execution/tasks/:id` | Get task |
| `PATCH /execution/tasks/:id/status` | Update task status |
| `GET /execution/tasks/:id/history` | Task status history |
| `GET /execution/audit-logs` | Audit log |
| `GET /measurement/metrics` | Metric source registry |
| `POST /measurement/snapshots` | Record baseline / post-change snapshot |
| `POST/GET /measurement/attributions` | Attribution links |
| `POST /technical-operations/audit` | Source HTML audit |
| `POST /search-intelligence/classify` | Intent classification |
| `POST /search-intelligence/analyze` | Full SERP query analysis |
| `GET/POST /business-intelligence/profiles` | Business profiles |

### Database (Supabase)

- Project: `neural-rank` · ref `bvujfwwwwzlpsxbshxyn` · `us-east-1` · free tier
- Dashboard: `https://supabase.com/dashboard/project/bvujfwwwwzlpsxbshxyn`
- Migrations: 9 applied · 33 tables in `app_public`

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
