# Neural Rank

Neural Rank is a unified SEO intelligence platform — a 18-module backend SEO OS powering keyword analysis, rank tracking, technical audits, backlink intelligence, content scoring, and more.

---

## Project structure

```
Neural Rank/
├── backend/              Node.js SEO OS backend (18 modules)
├── frontend/             Flutter mobile app
├── SEOSync_Flutter_App/  Flutter app (BLoC architecture — pending consolidation)
├── design/               All design assets
│   ├── inspiration/      Reference images and inspiration library
│   ├── mockups/          HTML archetype mockups
│   └── screenshots/      UI screenshots
├── docs/
│   ├── backend/          Backend architecture, QC, and module docs (32 files)
│   ├── frontend/         Frontend design system and implementation docs
│   └── product/          Product planning, build specs, and roadmap docs
├── scripts/              CI and build scripts
├── supabase/             Database migrations (9 applied)
├── package.json          Root scripts — start, check, test, ci
├── render.yaml           Render free-tier deployment blueprint
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
| CI | `npm run ci` (syntax check + full suite) |

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
| `docs/backend/BACKEND_MASTER_SPEC.md` | Full backend specification |
| `docs/backend/BACKEND_MODULE_BOUNDARIES.md` | Per-module boundaries (all 18) |
| `docs/backend/BACKEND_QC_PHASE2.md` | Phase 2 QC — 10 expansion modules |
| `docs/backend/BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md` | API route audit |
| `docs/backend/SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Production readiness gaps |
| `docs/product/SEO-OS-Build-Plan.md` | Full expansion build plan |
| `progress.md` | Session milestone log and resume anchors |

---

## Environment variables (production)

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL (set in render.yaml) |
| `SUPABASE_ANON_KEY` | Supabase anon key for JWT verification |
| `SERP_PROVIDER` | `serpapi` or `dataforseo` |
| `SERP_API_KEY` | API key for the SERP provider |
| `RENDERER_ENDPOINT` | URL of a headless renderer service (optional) |
| `PORT` | Server port (default 10000 on Render) |
