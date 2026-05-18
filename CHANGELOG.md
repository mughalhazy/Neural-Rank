# Changelog

All notable changes to Neural Rank are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
- Rate limiting: 60 req/min default, 30 req/min mutations, RFC-compliant headers
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
