# Changelog

All notable changes to Neural Rank are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- `.env.example` — documents all env vars for local setup
- `SECURITY.md` — responsible disclosure policy
- `CONTRIBUTING.md` — branch naming, commit style, doc update rules
- `CHANGELOG.md` — this file
- `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers in `server.js`
- ESLint (`no-unused-vars`, `no-undef`) wired into `npm run ci`

### Changed
- `render.yaml` — credentials moved to `sync: false`; plaintext values removed from tracked file

### Security
- `render.yaml` credential exposure resolved — `SUPABASE_URL` and `SUPABASE_ANON_KEY` values removed from version control

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
