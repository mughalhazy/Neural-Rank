# DOC_CATALOGUE — Neural Rank

All `.md` files in the repository, indexed with purpose and status.
**Last updated:** 2026-05-23 | **Total documents:** 87 (.md) + 1 (.yaml) | **Purpose audit:** 30 / 88 done (Batches 1–3 complete)

---

## How to read this catalogue

| Status | Meaning |
|--------|---------|
| `LIVE` | Actively consulted — authoritative for ongoing development |
| `ARCHIVE` | Historical record — kept for traceability, not updated |
| `DECISION` | One-time architectural decision — captured, not updated |
| `LOG` | Event or iteration record — append-only |

**Purpose column:** WHY this file exists — its role and when to read it. `—` means the purpose audit for this entry is pending (see `scripts/catalogue-audit.json`).

**Description column:** WHAT it contains — the actual content summary.

Future audits: scan this file first. If a doc's status, purpose, or description is wrong, update this row and the corresponding entry in `scripts/catalogue-audit.json`.

---

---

# SECTION 1 — OPS DOCS

Gap registers, pending work, build specs, product planning, operational runbooks, logs, and market research. Read these to understand project state, what is done, what is pending, and what the product is trying to achieve.

---

## Gap Registers & Pending Work

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [ops/REBUILD_PLAN.md](ops/REBUILD_PLAN.md) | `LIVE` | Primary working document driving all T1/T2/T3 rebuild work — single source of truth for gap status, effort/risk, and implementation steps across every tracked item | 77-item gap register (T1 18 resolved, T2 23 resolved + 3 owner-pending, T3 25 resolved + 8 owner-pending); grading summary per dimension vs A+ target; per-item implementation steps, effort, risk, and definition of done |
| [ops/PRODUCTION_READINESS_GAPS.md](ops/PRODUCTION_READINESS_GAPS.md) | `LIVE` | Detailed P0/P1/P2 gap register from the 2026-05-17 4-agent audit — provides exact file/line evidence and fix instructions; used to prioritise remediation order | 29 gaps (5 P0, 14 P1, 10 P2); 15 of 29 resolved as of 2026-05-19; each item lists affected files, step-by-step fix, and resolution status with commit reference |
| [ops/GAP_REGISTER.md](ops/GAP_REGISTER.md) | `LIVE` | Frontend-specific gap register gating pre-polish remediation — records implementation gaps found by overlaying architecture docs against frontend code | Gaps classified Critical/High/Medium with source authority, current state, evidence, risk, required remediation, and resolution status; scoped to ui/ codebase (now deleted) |
| [ops/BACKEND_GAP_ANALYSIS_2026_05_16.md](ops/BACKEND_GAP_ANALYSIS_2026_05_16.md) | `LIVE` | Point-in-time code-vs-docs health scan (2026-05-16) — identifies stale claims in all 25 backend docs before Phase 2 expansion; provides per-doc health score for each file | Doc inventory of 25 backend files with stale claim evidence table; code inventory summary (18 modules, 8 domains, 5 adapters, 15-route API); stale claim table per doc with actual code state vs claimed state |
| [ops/SEO_OS_BACKEND_GAP_FILL_REPORT.md](ops/SEO_OS_BACKEND_GAP_FILL_REPORT.md) | `LIVE` | Gap fill summary establishing what was implemented, partial, and missing in the original 8-module backend — historical baseline reference before Phase 2; carries explicit scope notice | Implemented (execution lifecycle, governance, measurement, technical-ops, search-intelligence, BI, recommendation scoring, API hardening, test harness); partial (SERP provider, rendered DOM, metric ingestion, BI import); missing (live DB migrations, real auth, persistent rate limiting) |
| [ops/SEO_OS_DELTA_ANALYSIS_REPORT.md](ops/SEO_OS_DELTA_ANALYSIS_REPORT.md) | `LIVE` | Capability gap analysis comparing the pre-Phase-2 repo state against the full SEO OS target model — historical baseline; all maturity figures must be recalculated for the 18-module state before use in planning | Overall maturity 11% (commercial 18%, white-hat 6%, self-serve 8%); per-capability coverage matrix across 8 dimensions; biggest gap: no execution/governance/measurement system; biggest risk: polished frontend obscures shallow backend at time of writing |

---

## Product Planning & Build Specs

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [ops/PRODUCT_SEO_OS_BUILD_PLAN.md](ops/PRODUCT_SEO_OS_BUILD_PLAN.md) | `LIVE` | Authoritative full-product expansion build plan for the 18-module target state — planning authority for all new modules and enhancements; supersedes MASTER_BUILD_SPEC for all planning decisions | Architecture principles (5-file module contract); 10 new module specs with full analysis.js/insights.js/actions.js logic; 7 existing module enhancements; integration adapter roadmap; schema additions; 6-phase implementation sequence |
| [ops/MASTER_BUILD_SPEC.md](ops/MASTER_BUILD_SPEC.md) | `LIVE` | Original product build specification establishing core product principles, positioning, and behavior contract — core principles and UI system authority remain valid; superseded by PRODUCT_SEO_OS_BUILD_PLAN for active planning | Product type (unified SEO + ASO), market gaps addressed, 7+ module definitions with purpose/inputs/outputs/acceptance criteria, behavior contract (action-first, not dashboard-only), tech stack decisions; updated 2026-05-17 noting 18-module state |
| [ops/SYSTEMATIC_UI_ARCHITECTURE.md](ops/SYSTEMATIC_UI_ARCHITECTURE.md) | `LIVE` | UI architecture governance — defines the required layered build order for the frontend; must be consulted before any UI work to ensure each layer is frozen before the next begins | 8 required layers in freeze order: archetypes → behaviour overlay → market overlay → inspiration patterns → pattern language → design language → design system → component layer → SVG icons → iteration passes; per-phase purpose, inputs, outputs, and freeze criteria |
| [ops/MVP_TO_FULL_SUITE_ROLLOUT.md](ops/MVP_TO_FULL_SUITE_ROLLOUT.md) | `ARCHIVE` | Historical 7-phase rollout plan establishing the original MVP boundary for the 8-module product — retained as a decision record; superseded by PRODUCT_SEO_OS_BUILD_PLAN Part 7 for all active planning | MVP defined as Phase 1 (review + content) + Phase 2 (keyword) + Phase 3 (rank tracking); full suite expansion Phases 4–7; scope: web SEO + ASO; superseded by PRODUCT_SEO_OS_BUILD_PLAN which covers all 18 modules |

---

## Operations & Runbooks

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [ops/RUNBOOK.md](ops/RUNBOOK.md) | `LIVE` | Step-by-step operator guide for resolving live incidents — read immediately when an alert fires; covers every expected failure mode on the free-tier Render + Supabase stack | 7 scenarios: cold-start latency, DB unreachable, SERP rate-limited, Supabase outage, force restart, credential rotation, and DB backup — each with symptom, cause, and numbered resolution steps |
| [ops/SLO.md](ops/SLO.md) | `LIVE` | Defines the binding service level objectives for the production backend — establishes measurable uptime, latency, and error-rate targets and their breach consequences | 4 SLOs: availability 99.5% (3.6 hr/month budget), p99 /health <500ms, p99 /run/default <20s, error rate <0.5%/24h rolling window, module timeout rate <1%; error budget policy table; 30-day review cadence |
| [ops/PROGRESS.md](ops/PROGRESS.md) | `LIVE` | Session-by-session milestone log and project state tracker — the canonical resume anchor; read this first at the start of any new work session to understand current state | Project state header (deploy status, backend QC, rebuild plan progress), milestone table per phase, session anchors with resolved items and dates, suggested next work |
| [ops/CHANGELOG.md](ops/CHANGELOG.md) | `LOG` | Append-only record of all notable changes following Keep a Changelog format — provides a clean history for contributors and downstream release notes | Per-release entries with Added/Changed/Fixed/Owner-pending sections; covers all T1/T2/T3 milestones, doc restructures, backend changes, Flutter wiring, and adapter work from 2026-05-19 to 2026-05-22 |

---

## Logs

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [ops/FRONTEND_CONTENT_IMPLEMENTATION_LOG.md](ops/FRONTEND_CONTENT_IMPLEMENTATION_LOG.md) | `LOG` | Running log of content implementation decisions — tracks what content rules were applied to which screens so future sessions do not undo prior work | Per-module coverage notes for all 9 modules; feature mapping components added (ModuleFeatureMap, FeatureEvidenceBoard, FeatureActionCard); implementation rule (INPUT→ANALYSIS→INSIGHT→PRIORITY→ACTION); feature-focus simplification pass notes |
| [ops/ITERATION_PASS_LOG.md](ops/ITERATION_PASS_LOG.md) | `LOG` | Controlled refinement pass record — documents each structured iteration pass after structural remediation so polish work stays scoped and does not regress structure | 5 passes recorded: structural refinement, hierarchy refinement, design-language application, design-system enforcement, density and clarity tuning — each with goal, inputs, changes, validation, and approval status |
| [ops/UI_IMPLEMENTATION_HISTORY.md](ops/UI_IMPLEMENTATION_HISTORY.md) | `LOG` | Chronological history of all UI implementation sessions — allows future sessions to resume without drift by showing which phases were completed and what each produced | Phase-by-phase summary for all 13 phases: archetypes/mapping, behaviour overlay, market overlay, pattern extraction, pattern library, design language, design system, SVG icon layer, component system, archetype assembly, iteration passes, and implementation sequence |

---

## Market Research

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [ops/MARKET_RESEARCH_PLAYSTORE.md](ops/MARKET_RESEARCH_PLAYSTORE.md) | `ARCHIVE` | Historical Play Store market research validating the original product direction — retained as a decision record explaining why the product was positioned as a unified mobile-first SEO/ASO platform | Google Play ecosystem signal analysis: market reality (fragmented, no dominant mobile-first platform), 4 observed product types (keyword tools, rank trackers, website SEO tools, multi-tool bundles), review-derived pain points (fragmentation, no actionability, weak workflow) |

---

---

# SECTION 2 — REPO / CODE DOCS

Specs, contracts, design systems, API definitions, architectural decisions, and implementation records that describe what the code does and how it is structured. These are the source of truth for development decisions.

---

## Root — Docs

GitHub-recognized special files and the master doc index. All must remain at root.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [README.md](README.md) | `LIVE` | GitHub-facing project overview and quick-start guide — the first file any contributor or evaluator reads; must stay authoritative and up-to-date at all times | Project structure tree, 18-module table, 27-route API surface, Supabase connection details, env var reference (11 core + 8 adapter vars), npm script reference, deployment and local dev instructions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | `LIVE` | Contributor rules enforcing code quality and doc hygiene — read before opening a PR; defines the standards all changes must meet | Branch naming conventions, commit message style, pre-commit/pre-push hook rules, 5-file backend module contract, doc update table (DOC_CATALOGUE, PRODUCTION_READINESS_GAPS, PROGRESS, CHANGELOG, BACKEND_DATA_AND_PERSISTENCE, OPENAPI) |
| [SECURITY.md](SECURITY.md) | `LIVE` | Responsible disclosure policy — tells security researchers how to report vulnerabilities privately and sets response time expectations; keeps security reports off public GitHub issues | Email contact, 48h acknowledgement / 14-day critical resolution SLA, supported versions (latest main only), in-scope assets (backend API, auth, schema, governance, credentials), out-of-scope (Render, Supabase, third-party providers) |
| [DOC_CATALOGUE.md](DOC_CATALOGUE.md) | `LIVE` | Master index of all 88 documents — first place to look before searching the repo; keeps the document set navigable as the project grows | Two sections (ops docs, repo/code docs) covering 87 .md + 1 .yaml; each entry has file link, status, purpose, and description; purpose audit progress tracked in header and in scripts/catalogue-audit.json |

---

## Root — Config & Tooling

Non-markdown root files. All must remain at root — tooling, runtimes, and deployment systems require or expect them here. Not `.md` files; listed for completeness.

| File | Purpose | Must stay at root? |
|------|---------|-------------------|
| `package.json` | npm manifest — scripts, dependencies, engines | Yes — npm |
| `package-lock.json` | Exact dependency lock file | Yes — paired with package.json |
| `render.yaml` | Render free-tier deployment blueprint — service, env vars (`sync: false`) | Yes — Render reads root |
| `Dockerfile` | Production image — node:20-alpine, non-root user | Yes — Docker build context |
| `docker-compose.yml` | Local dev — api + postgres:16-alpine with healthcheck | Yes — convention |
| `docker-compose.test.yml` | Integration test compose — postgres:16-alpine for CI | Yes — paired with docker-compose.yml |
| `.env.example` | Environment variable reference — copy to `.env` for local dev; contains no secrets | Yes — convention |
| `LICENSE` | MIT license | Yes — GitHub surface + legal convention |
| `.eslintrc.json` | ESLint config — no-unused-vars, no-undef | Yes — ESLint traverses from root |
| `.c8rc` | c8 coverage config — 80% threshold, excludes test files | Yes — c8 reads from root |
| `.gitignore` | Git ignore rules — node_modules, .env, coverage, Flutter build artifacts | Yes — git requires root |
| `.nvmrc` | Node.js version pin — `20` | Yes — nvm reads from root |
| `.dockerignore` | Docker build excludes — node_modules, .env, design/, ui/, app/, docs/ | Yes — must be alongside Dockerfile |
| `.husky/` | Git hooks directory — pre-commit (lint + secrets), pre-push (ci) | Yes — Husky convention |
| `.github/` | GitHub Actions CI workflow + Dependabot config | Yes — GitHub requires this path |

---

## docs/backend/reference/ — Live Backend Specs

Actively consulted specs. Source of truth for how the backend is designed and operates.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [BACKEND_MASTER_SPEC.md](docs/backend/reference/BACKEND_MASTER_SPEC.md) | `LIVE` | Top-level backend specification translating the product build spec into backend scope — single source of truth for what the backend must do, which modules it contains, and what flow it must enforce | Backend purpose and coverage (web SEO + ASO), stack constraints (Supabase + Postgres), 18-module table with module key/display name/defaultActive/initialState, per-module responsibility summary, mandatory execution flow (INPUT→ANALYSIS→INSIGHT→PRIORITY→ACTION) |
| [BACKEND_MODULE_BOUNDARIES.md](docs/backend/reference/BACKEND_MODULE_BOUNDARIES.md) | `LIVE` | Per-module boundary contract preventing implementation drift — read before modifying any module to ensure module ownership and responsibility separation is not violated | Boundary rules (no merging, no shared-ownership drift), then per-module definitions for all 18 modules covering backend purpose, core responsibility, input/analysis/insight-action/persistence/orchestration relationship, and activation state |
| [BACKEND_ACTIVATION_AND_GATING.md](docs/backend/reference/BACKEND_ACTIVATION_AND_GATING.md) | `LIVE` | Defines the runtime activation model — distinguishes built from active modules and enforces the invariant that local_seo cannot enter default orchestration without an explicit override | Activation model (18 built, 17 default-active, 1 opt-in), DEFAULT_ACTIVE_MODULES list, BUILT_BUT_INACTIVE_MODULES (local_seo only), built vs active definitions, assertModuleCatalogIntegrity() contract, activation override mechanism |
| [BACKEND_SERVICES_AND_ORCHESTRATION.md](docs/backend/reference/BACKEND_SERVICES_AND_ORCHESTRATION.md) | `LIVE` | Service layer and orchestration architecture reference — defines domain/data/orchestration separation so implementation stays structured as the module count grows | Service layer principles (module ownership, mandatory flow, built-but-inactive support), domain/data/orchestration separation definitions, per-module service contract (run → insights/actions/metadata), 18-module execution order, domain service layer overview |
| [BACKEND_DATA_AND_PERSISTENCE.md](docs/backend/reference/BACKEND_DATA_AND_PERSISTENCE.md) | `LIVE` | Persistence architecture specification — ensures Postgres is used correctly as the source of truth and module ownership is preserved in all schema decisions | Persistence principles, Supabase role boundaries (Auth/Storage/Edge Functions), 18-module persistence ownership table (records table, defaultActive, migration file), 12-migration inventory, schema conventions |
| [BACKEND_CORE_UTILITIES.md](docs/backend/reference/BACKEND_CORE_UTILITIES.md) | `LIVE` | Catalogue of all 14 shared utility modules in backend/src/core/ — prevents duplication by ensuring developers know what shared infrastructure exists before writing new logic | 14 utilities each with file path, purpose, key exports, consuming modules, and design decision: runtimeContext, createProviderAdapter, seoScorer, domainAuthorityScorer, targeting, persistence, recommendationScoring, domainContracts, intentClassifier, moduleInputRequirements, prioritization, rateLimiter, metrics, errorReporter |
| [BACKEND_INTEGRATION_BOUNDARIES.md](docs/backend/reference/BACKEND_INTEGRATION_BOUNDARIES.md) | `LIVE` | Integration architecture reference defining clean provider boundaries — read before adding any new external API adapter to ensure provider concerns stay separate from module business logic | Integration boundary principles, 18-boundary catalog table (module key, adapter name, isImplemented, adapter file), detail sections for all 5 implemented adapters (GSC, GA4, PageSpeed, backlink-provider, serp-provider) with credentials, endpoints, and collect paths |
| [BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md](docs/backend/reference/BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md) | `LIVE` | Audit record confirming API hardening compliance across all 27 routes — read before adding new routes to ensure the same envelope, validation, actor-identity, and rate-limit pattern is applied | Hardening summary (response envelope, safe errors, request validation, actor identity header, rate-limit headers, workspace headers, versioning, OpenAPI spec); per-endpoint audit table for all 27 routes with validation, auditable-mutation, and envelope status |
| [BACKEND_DOMAIN_BOUNDARIES.md](docs/backend/reference/BACKEND_DOMAIN_BOUNDARIES.md) | `LIVE` | — | All 18 modules mapped to 8 bounded contexts — site-intelligence, search-intelligence, content-operations, technical-operations, execution, measurement, governance, business-intelligence; includes domain layer rationale and compatibility mapping *(created 2026-05-17)* |
| [OPENAPI.yaml](docs/backend/reference/OPENAPI.yaml) | `LIVE` | — | OpenAPI 3.1 specification — 27 paths, full schemas (Recommendation, Task, AuditLog, Snapshot, Attribution, BusinessProfile), error responses, Bearer JWT auth *(created 2026-05-19, T2-06)* |

---

## docs/backend/decisions/ — Architectural Decisions

One-time decisions captured for future reference. Explain WHY things are the way they are. Do not update; add a new decision doc if the decision changes.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [ADR_001_ZERO_RUNTIME_DEPENDENCIES.md](docs/backend/decisions/ADR_001_ZERO_RUNTIME_DEPENDENCIES.md) | `DECISION` | — | Zero runtime npm dependencies — rationale, alternatives considered, review trigger *(created 2026-05-19, T2-09)* |
| [ADR_002_PURE_NODE_HTTP.md](docs/backend/decisions/ADR_002_PURE_NODE_HTTP.md) | `DECISION` | — | Pure node:http (no Express/Fastify) — rationale, consequences *(created 2026-05-19, T2-09)* |
| [ADR_003_IN_MEMORY_DEFAULT_REPOSITORY.md](docs/backend/decisions/ADR_003_IN_MEMORY_DEFAULT_REPOSITORY.md) | `DECISION` | — | In-memory default repository for CI/dev — dual-path pattern with context.query detection *(created 2026-05-19, T2-09)* |
| [BACKEND_DOMAIN_SERVICE_ROUTES.md](docs/backend/decisions/BACKEND_DOMAIN_SERVICE_ROUTES.md) | `DECISION` | — | All 4 domain services now have HTTP routes; complete 27-route inventory; historical "routeless" decision preserved as context *(rewritten 2026-05-19, T3-29)* |
| [BACKEND_DUAL_CLASSIFIER_DECISION.md](docs/backend/decisions/BACKEND_DUAL_CLASSIFIER_DECISION.md) | `DECISION` | — | Records the intentional existence of two separate intent classifiers: core/intentClassifier.js (4-intent heuristic for module layer) vs search-intelligence domain (7-intent semantic) — prevents future consolidation attempts |

---

## docs/backend/implementation/ — Implementation Records

Records of completed build work. Useful for traceability and onboarding. Not actively updated.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [BACKEND_QC_PHASE2.md](docs/backend/implementation/BACKEND_QC_PHASE2.md) | `LIVE` | — | QC audit (60/60 PASS) for all 10 Phase 2 expansion modules — checks 5-file contract, activation state, flow, tests, persistence pattern, schema alignment |
| [BACKEND_TEST_HARNESS_REPORT.md](docs/backend/implementation/BACKEND_TEST_HARNESS_REPORT.md) | `LIVE` | — | Test harness coverage map — CI command, test files for all P0 flows, pass/fail matrix; useful reference when adding new tests |
| [BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md](docs/backend/implementation/BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md) | `LIVE` | — | Unified schema/repository alignment audit for all 18 modules — Phase 1 (field renames fixed) + Phase 2 (10 new modules all aligned); combined 18/18 status table *(created 2026-05-17)* |
| [BACKEND_EXECUTION_LIFECYCLE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_EXECUTION_LIFECYCLE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Implementation summary of execution domain — recommendations, tasks, status history, audit logs, approval gating, 9 API endpoints |
| [BACKEND_GOVERNANCE_ENGINE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_GOVERNANCE_ENGINE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Implementation summary of governance domain — 9 guardrails, 4-level classification (allow / warn / require_approval / block) |
| [BACKEND_MEASUREMENT_ATTRIBUTION_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_MEASUREMENT_ATTRIBUTION_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Implementation summary of measurement domain — before/after snapshots, attribution links, metric source registry, confidence classification |
| [BACKEND_TECHNICAL_OPERATIONS_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_TECHNICAL_OPERATIONS_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Implementation summary of technical-operations domain — 11 source HTML analyzers, rendered DOM placeholder contract, analyzer result shape |
| [BACKEND_SEARCH_INTELLIGENCE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_SEARCH_INTELLIGENCE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Implementation summary of search-intelligence domain — 7-intent taxonomy, heuristic classifier, provider interface, opportunity scoring |
| [BACKEND_BUSINESS_INTELLIGENCE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_BUSINESS_INTELLIGENCE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Implementation summary of business-intelligence domain — business profiles, priority score extension, business value scoring |
| [BACKEND_RECOMMENDATION_SCORING_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_RECOMMENDATION_SCORING_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Implementation of recommendation scoring engine — 9 scoring dimensions, weighted overall score, priority derivation |

---

## docs/backend/archive/ — Phase 1 Historical Records

Freeze records, QC reports, and gap scans from the original 8-module Phase 1 build. Kept for traceability. Not updated.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [BACKEND_QC_FINAL.md](docs/backend/archive/BACKEND_QC_FINAL.md) | `ARCHIVE` | — | Phase 1 QC freeze verdict (10/10) for original 8 modules — dated 2026-04-22; explicitly scoped to Phase 1 only |
| [BACKEND_QC_REPORT.md](docs/backend/archive/BACKEND_QC_REPORT.md) | `ARCHIVE` | — | Phase 1 QC audit (10/10) for original 8 modules with module pass/fail matrix — dated 2026-04-22 |
| [BACKEND_V1_FROZEN.md](docs/backend/archive/BACKEND_V1_FROZEN.md) | `ARCHIVE` | — | Phase 1 freeze status record for original 8 modules — dated 2026-04-22; marks V1 as stable before Phase 2 expansion |
| [BACKEND_V1_HARDENED.md](docs/backend/archive/BACKEND_V1_HARDENED.md) | `ARCHIVE` | — | Phase 1 hardening validation record — checks module catalog, activation, orchestration, tests, HTTP server for original 8 modules |
| [BACKEND_BUILD_SEQUENCE.md](docs/backend/archive/BACKEND_BUILD_SEQUENCE.md) | `ARCHIVE` | — | Original Phase 1 build sequence for 8 modules — documentation-first order, architecture setup, implementation sequence; not updated for Phase 2 |
| [BACKEND_IMPLEMENTATION_GAP_SCAN.md](docs/backend/archive/BACKEND_IMPLEMENTATION_GAP_SCAN.md) | `ARCHIVE` | — | Phase 1 only gap scan for original 8 modules — all declared fixed; superseded by ops/BACKEND_GAP_ANALYSIS_2026_05_16.md which covers all 18 |
| [BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md](docs/backend/archive/BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md) | `ARCHIVE` | — | Phase 1 schema/repository alignment fix for original 8 modules — documents 5 field-name mismatches resolved 2026-05-06; superseded by BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md |
| [BACKEND_DOMAIN_BOUNDARY_MAP.md](docs/backend/archive/BACKEND_DOMAIN_BOUNDARY_MAP.md) | `ARCHIVE` | — | Original Phase 1 domain boundary map for 8 modules — fully superseded by BACKEND_DOMAIN_BOUNDARIES.md *(archived 2026-05-17)* |
| [BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md](docs/backend/archive/BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | — | Original implementation record for the 8-domain bounded context layer — fully superseded by BACKEND_DOMAIN_BOUNDARIES.md *(archived 2026-05-17)* |
| [BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_PHASE2.md](docs/backend/archive/BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_PHASE2.md) | `ARCHIVE` | — | Original Phase 2 alignment audit for 10 expansion modules — fully superseded by BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md *(archived 2026-05-17)* |

---

## docs/frontend/reference/ — Live Design System Rules

The frozen, active design system and content rules. These govern all UI development decisions.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [FRONTEND_DESIGN_LANGUAGE.md](docs/frontend/reference/FRONTEND_DESIGN_LANGUAGE.md) | `LIVE` | — | Frozen design language spec — typography, colour palette, spacing scale, elevation, motion principles; renamed from PHASE_07_DESIGN_LANGUAGE.md to reflect active reference status |
| [FRONTEND_DESIGN_SYSTEM.md](docs/frontend/reference/FRONTEND_DESIGN_SYSTEM.md) | `LIVE` | — | Frozen design system spec — component tokens, grid system, breakpoints, theming rules; renamed from PHASE_08_DESIGN_SYSTEM.md to reflect active reference status |
| [CURRENT_UI_BASELINE.md](docs/frontend/reference/CURRENT_UI_BASELINE.md) | `LIVE` | — | Current UI component inventory and screen count — baseline state snapshot for iterative design reference |
| [FRONTEND_MICROCOPY_RULES.md](docs/frontend/reference/FRONTEND_MICROCOPY_RULES.md) | `LIVE` | — | Microcopy rules — labels, empty states, error messages, CTA text standards across all screens |
| [FRONTEND_BACKEND_CONTENT_MAPPING.md](docs/frontend/reference/FRONTEND_BACKEND_CONTENT_MAPPING.md) | `LIVE` | — | Maps each backend module's output fields to the specific UI elements that display them |
| [FRONTEND_MODULE_FEATURE_MAPPING.md](docs/frontend/reference/FRONTEND_MODULE_FEATURE_MAPPING.md) | `LIVE` | — | Maps all 18 backend modules to frontend feature surfaces — full commercial job, screen blocks, and demo data for all 18; Phase 2 expansion modules documented with planned feature surfaces *(backfilled 2026-05-17)* |

---

## docs/frontend/planning/ — Active Planning Docs

Live planning and capability mapping documents used to guide frontend build decisions.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [FRONTEND_MASTER_PLAN.md](docs/frontend/planning/FRONTEND_MASTER_PLAN.md) | `LIVE` | — | Master frontend plan — full screen list, implementation phases, feature priorities; product surface lists all 18 modules across MVP / gated / Phase 2 expansion / opt-in tiers *(backfilled 2026-05-17)* |
| [FRONTEND_SCREEN_ARCHETYPES.md](docs/frontend/planning/FRONTEND_SCREEN_ARCHETYPES.md) | `LIVE` | — | Screen archetype definitions — the 6 reusable screen patterns used across the app, with composition rules |
| [FRONTEND_BACKEND_CAPABILITY_AUDIT.md](docs/frontend/planning/FRONTEND_BACKEND_CAPABILITY_AUDIT.md) | `LIVE` | — | Full capability audit for all 18 modules — 117 capabilities extracted from backend code (RA=15, CLI=9, KA=8, RT=7, CA=6, OL=5, CML=4, UWL=7, TSA=9, OPS=10, BI=7, ES=7, SIC=6, SFA=5, TA=6, SAR=8, AI=7, LS=7) *(extended 2026-05-19, T3-31)* |
| [FRONTEND_CAPABILITY_TO_FEATURE_WORKFLOW_MAP.md](docs/frontend/planning/FRONTEND_CAPABILITY_TO_FEATURE_WORKFLOW_MAP.md) | `LIVE` | — | Subpage maps for all 18 modules — maps capability→screen→workflow→outcome; 2–5 subpage entries per module *(extended 2026-05-19, T3-31)* |
| [FRONTEND_CONTENT_FULL_SYSTEM.md](docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md) | `LIVE` | — | Authoritative full content system — 18 modules (Phase 1 original 8 + Phase 2 10 new); content blocks for all modules with Input/Analysis/Insight/Explanation/Evidence/Impact/Action/NextStep *(extended 2026-05-19, T3-32)* |
| [FRONTEND_PHASE_INDEX.md](docs/frontend/planning/FRONTEND_PHASE_INDEX.md) | `LIVE` | — | Index of all 13 frontend design phases with status, deliverable summary, and completion date |

---

## docs/frontend/phases/ — Completed Phase Deliverables

Historical design phase outputs from PHASE_01 through PHASE_13. Frozen deliverables — source material for live reference docs. Do not update.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [PHASE_01_ARCHETYPES_AND_MAPPING.md](docs/frontend/phases/PHASE_01_ARCHETYPES_AND_MAPPING.md) | `ARCHIVE` | — | Phase 1 deliverable — initial screen archetypes and module-to-screen mapping |
| [PHASE_02_BEHAVIOUR_AND_MARKET_OVERLAY.md](docs/frontend/phases/PHASE_02_BEHAVIOUR_AND_MARKET_OVERLAY.md) | `ARCHIVE` | — | Phase 2 deliverable — user behaviour research and market context overlay applied to design |
| [PHASE_03_MARKET_OVERLAY.md](docs/frontend/phases/PHASE_03_MARKET_OVERLAY.md) | `ARCHIVE` | — | Phase 3 deliverable — market positioning overlay applied to the design language |
| [PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md](docs/frontend/phases/PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md) | `ARCHIVE` | — | Phase 3 supplemental — pattern language foundations and system primitives |
| [PHASE_04_IMPLEMENTATION_BLUEPRINT.md](docs/frontend/phases/PHASE_04_IMPLEMENTATION_BLUEPRINT.md) | `ARCHIVE` | — | Phase 4 deliverable — implementation blueprint for translating design decisions to code |
| [PHASE_04_INSPIRATION_PATTERN_EXTRACTION.md](docs/frontend/phases/PHASE_04_INSPIRATION_PATTERN_EXTRACTION.md) | `ARCHIVE` | — | Phase 4 supplemental — design patterns extracted from the inspiration library |
| [PHASE_04_INSPIRATION_VISUAL_AUDIT.md](docs/frontend/phases/PHASE_04_INSPIRATION_VISUAL_AUDIT.md) | `ARCHIVE` | — | Phase 4 supplemental — visual audit of inspiration images with pattern annotations |
| [PHASE_05_PATTERN_EXTRACTION_CHECKLIST.md](docs/frontend/phases/PHASE_05_PATTERN_EXTRACTION_CHECKLIST.md) | `ARCHIVE` | — | Phase 5 deliverable — checklist of all extracted design patterns with adoption status |
| [PHASE_12_ITERATION_PASSES.md](docs/frontend/phases/PHASE_12_ITERATION_PASSES.md) | `ARCHIVE` | — | Phase 12 deliverable — structured iteration pass methodology and pass definitions |
| [PHASE_13_IMPLEMENTATION_SEQUENCE.md](docs/frontend/phases/PHASE_13_IMPLEMENTATION_SEQUENCE.md) | `ARCHIVE` | — | Phase 13 deliverable — ordered implementation sequence for the full frontend build |

---

## docs/frontend/archive/ — Archived Frontend Docs

Superseded or stub-only docs moved here during 2026-05-17 deduplication pass. Not updated.

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [FRONTEND_CONTENT_SYSTEM.md](docs/frontend/archive/FRONTEND_CONTENT_SYSTEM.md) | `ARCHIVE` | — | Base content system spec — fully subsumed by FRONTEND_CONTENT_FULL_SYSTEM.md *(archived 2026-05-17)* |
| [FRONTEND_CONTENT_PATTERNS_BASE.md](docs/frontend/archive/FRONTEND_CONTENT_PATTERNS_BASE.md) | `ARCHIVE` | — | Base pattern rules — unique "Pattern Combination Rules" section migrated to FRONTEND_CONTENT_FULL_SYSTEM.md *(archived 2026-05-17)* |
| [FRONTEND_INSIGHT_STRUCTURE.md](docs/frontend/archive/FRONTEND_INSIGHT_STRUCTURE.md) | `ARCHIVE` | — | Insight structure spec — unique sections migrated to FRONTEND_CONTENT_FULL_SYSTEM.md *(archived 2026-05-17)* |
| [PHASE_06_PATTERN_LIBRARY.md](docs/frontend/archive/PHASE_06_PATTERN_LIBRARY.md) | `ARCHIVE` | — | Phase 6 stub — thin spec (42 lines); actual pattern library is in code under app/lib/presentation/widgets/ *(archived 2026-05-17)* |
| [PHASE_09_SVG_ICON_LAYER.md](docs/frontend/archive/PHASE_09_SVG_ICON_LAYER.md) | `ARCHIVE` | — | Phase 9 stub — requirements spec only (28 lines); icon layer implemented in code; content covered by PHASE_10 *(archived 2026-05-17)* |
| [PHASE_10_COMPONENT_SYSTEM.md](docs/frontend/archive/PHASE_10_COMPONENT_SYSTEM.md) | `ARCHIVE` | — | Phase 10 stub — requirements spec only (31 lines); component system implemented in code; governance covered by PHASE_05 *(archived 2026-05-17)* |
| [PHASE_11_ARCHETYPE_ASSEMBLY.md](docs/frontend/archive/PHASE_11_ARCHETYPE_ASSEMBLY.md) | `ARCHIVE` | — | Phase 11 stub — spec and closure notes only (45 lines); assembly covered by PHASE_01 + PHASE_04; closure notes are in ITERATION_PASS_LOG *(archived 2026-05-17)* |

---

## docs/frontend/logs/ — Protocol Docs

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [IMAGE_PROTOCOL.md](docs/frontend/logs/IMAGE_PROTOCOL.md) | `DECISION` | — | Protocol for handling images in the frontend — naming conventions, compression rules, placeholder standards |

---

## App READMEs

| File | Status | Purpose | Description |
|------|--------|---------|-------------|
| [app/README.md](app/README.md) | `LIVE` | — | BLoC Flutter app README — canonical production app; setup, BLoC architecture overview, state management guide |

---

## Maintenance

When adding, moving, or deleting any `.md` file:
1. Add / update / remove the corresponding row in this catalogue
2. Update the corresponding entry in `scripts/catalogue-audit.json`
3. Update the total count in the header
4. **Purpose:** one sentence — WHY this file exists (its role and when to read it)
5. **Description:** one sentence — WHAT it contains (content summary)
6. Place new files in the correct section: **Ops Docs** for gap registers, build plans, runbooks, logs, market research; **Repo/Code Docs** for specs, contracts, decisions, and implementation records
