# DOC_CATALOGUE — Neural Rank

All `.md` files in the repository, indexed with purpose and status.
**Last updated:** 2026-05-18 (REBUILD_PLAN.md added — 30-item enterprise grading audit with Tier 1/2/3 gap closure plan) | **Total documents:** 82

---

## How to read this catalogue

| Status | Meaning |
|--------|---------|
| `LIVE` | Actively consulted — authoritative for ongoing development |
| `ARCHIVE` | Historical record — kept for traceability, not updated |
| `DECISION` | One-time architectural decision — captured, not updated |
| `LOG` | Event or iteration record — append-only |

Future audits: scan this file first. If a doc's status or description is wrong, update this row.

---

## Root

| File | Status | Description |
|------|--------|-------------|
| [README.md](README.md) | `LIVE` | Project overview — 18-module table, 24-route API surface, Supabase details, env var reference, project tree |
| [progress.md](progress.md) | `LIVE` | Session milestone log and resume anchors — running record of every build session |
| [CHANGELOG.md](CHANGELOG.md) | `LOG` | All notable changes — keepachangelog.com format; append on every significant milestone |
| [CONTRIBUTING.md](CONTRIBUTING.md) | `LIVE` | Branch naming, commit style, pre-push checklist, doc update rules, backend module contract |
| [SECURITY.md](SECURITY.md) | `LIVE` | Responsible disclosure policy — contact, scope, SLA; in-scope: backend API, auth, schema, governance |
| [REBUILD_PLAN.md](REBUILD_PLAN.md) | `LIVE` | Enterprise rebuild plan — 30-item gap register across Tier 1 (blockers), Tier 2 (adoption), Tier 3 (elite); current grade B- (76/100), target A+ (100/100) |

---

## docs/backend/reference/ — Live Backend Specs

Actively consulted specs. These are the source of truth for how the backend is designed and operates.

| File | Status | Description |
|------|--------|-------------|
| [BACKEND_MASTER_SPEC.md](docs/backend/reference/BACKEND_MASTER_SPEC.md) | `LIVE` | Top-level 18-module backend specification — module list, activation model, mandatory execution flow (INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION), tech stack |
| [BACKEND_MODULE_BOUNDARIES.md](docs/backend/reference/BACKEND_MODULE_BOUNDARIES.md) | `LIVE` | Per-module boundary definitions for all 18 modules — responsibilities, input/output contracts, persistence ownership, activation states |
| [BACKEND_ACTIVATION_AND_GATING.md](docs/backend/reference/BACKEND_ACTIVATION_AND_GATING.md) | `LIVE` | Activation model — DEFAULT_ACTIVE_MODULES (17), BUILT_BUT_INACTIVE_MODULES (local_seo only), assertModuleCatalogIntegrity() contract |
| [BACKEND_SERVICES_AND_ORCHESTRATION.md](docs/backend/reference/BACKEND_SERVICES_AND_ORCHESTRATION.md) | `LIVE` | Service layer principles — domain/data/orchestration separation, per-module service expectations, 18-module execution order |
| [BACKEND_DATA_AND_PERSISTENCE.md](docs/backend/reference/BACKEND_DATA_AND_PERSISTENCE.md) | `LIVE` | Persistence architecture — ownership table for all 18 modules, 9 migration file inventory, schema conventions |
| [BACKEND_CORE_UTILITIES.md](docs/backend/reference/BACKEND_CORE_UTILITIES.md) | `LIVE` | Catalogue of 9 core utility modules — runtimeContext, createProviderAdapter, seoScorer, intentClassifier, recommendationScoring and more, with signatures and purpose |
| [BACKEND_INTEGRATION_BOUNDARIES.md](docs/backend/reference/BACKEND_INTEGRATION_BOUNDARIES.md) | `LIVE` | 18 integration boundary catalogue — 5 implemented adapters (GSC, GA4, PageSpeed, backlink-provider, serp-provider), boundary contracts, fallback rules |
| [BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md](docs/backend/reference/BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md) | `LIVE` | Audit of all 24 API routes — envelope format, input validation, actor identity, rate-limit headers, safe logging compliance |
| [BACKEND_DOMAIN_BOUNDARIES.md](docs/backend/reference/BACKEND_DOMAIN_BOUNDARIES.md) | `LIVE` | All 18 modules mapped to 8 bounded contexts — site-intelligence, search-intelligence, content-operations, technical-operations, execution, measurement, governance, business-intelligence; includes domain layer rationale and compatibility mapping. Supersedes BACKEND_DOMAIN_BOUNDARY_MAP.md and BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md *(created 2026-05-17)* |

---

## docs/backend/decisions/ — Architectural Decisions

One-time decisions captured for future reference. These explain WHY things are the way they are. Do not update; add a new decision doc if the decision changes.

| File | Status | Description |
|------|--------|-------------|
| [BACKEND_DOMAIN_SERVICE_ROUTES.md](docs/backend/decisions/BACKEND_DOMAIN_SERVICE_ROUTES.md) | `DECISION` | Records the deliberate choice to keep 4 domain services (measurement, technical-ops, search-intelligence, business-intelligence) without HTTP routes — explains rationale and planned future route shapes |
| [BACKEND_DUAL_CLASSIFIER_DECISION.md](docs/backend/decisions/BACKEND_DUAL_CLASSIFIER_DECISION.md) | `DECISION` | Records the intentional existence of two separate intent classifiers: core/intentClassifier.js (4-intent heuristic for module layer) vs search-intelligence domain (7-intent semantic) — prevents future consolidation attempts |

---

## docs/backend/implementation/ — Implementation Records

Records of completed build work. Useful for traceability and onboarding. Not actively updated.

| File | Status | Description |
|------|--------|-------------|
| [BACKEND_EXECUTION_LIFECYCLE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_EXECUTION_LIFECYCLE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Implementation summary of execution domain — recommendations, tasks, status history, audit logs, approval gating, 9 API endpoints |
| [BACKEND_GOVERNANCE_ENGINE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_GOVERNANCE_ENGINE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Implementation summary of governance domain — 9 guardrails, 4-level classification (allow / warn / require_approval / block) |
| [BACKEND_MEASUREMENT_ATTRIBUTION_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_MEASUREMENT_ATTRIBUTION_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Implementation summary of measurement domain — before/after snapshots, attribution links, metric source registry, confidence classification |
| [BACKEND_TECHNICAL_OPERATIONS_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_TECHNICAL_OPERATIONS_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Implementation summary of technical-operations domain — 11 source HTML analyzers, rendered DOM placeholder contract, analyzer result shape |
| [BACKEND_SEARCH_INTELLIGENCE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_SEARCH_INTELLIGENCE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Implementation summary of search-intelligence domain — 7-intent taxonomy, heuristic classifier, provider interface, opportunity scoring |
| [BACKEND_BUSINESS_INTELLIGENCE_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_BUSINESS_INTELLIGENCE_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Implementation summary of business-intelligence domain — business profiles, priority score extension, business value scoring |
| [BACKEND_RECOMMENDATION_SCORING_IMPLEMENTATION_REPORT.md](docs/backend/implementation/BACKEND_RECOMMENDATION_SCORING_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Implementation of recommendation scoring engine — 9 scoring dimensions, weighted overall score, priority derivation |
| [BACKEND_QC_PHASE2.md](docs/backend/implementation/BACKEND_QC_PHASE2.md) | `LIVE` | QC audit (60/60 PASS) for all 10 Phase 2 expansion modules — checks 5-file contract, activation state, flow, tests, persistence pattern, schema alignment |
| [BACKEND_TEST_HARNESS_REPORT.md](docs/backend/implementation/BACKEND_TEST_HARNESS_REPORT.md) | `LIVE` | Test harness coverage map — CI command, test files for all P0 flows, pass/fail matrix; useful reference when adding new tests |
| [BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md](docs/backend/implementation/BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md) | `LIVE` | Unified schema/repository alignment audit for all 18 modules — Phase 1 (field renames fixed) + Phase 2 (10 new modules all aligned); combined 18/18 status table. Supersedes both originals *(created 2026-05-17)* |

---

## docs/backend/analysis/ — Gap & Audit Reports

Point-in-time analysis documents. Read these to understand current production readiness and outstanding gaps.

| File | Status | Description |
|------|--------|-------------|
| [BACKEND_GAP_ANALYSIS_2026_05_16.md](docs/backend/analysis/BACKEND_GAP_ANALYSIS_2026_05_16.md) | `LIVE` | Comprehensive gap scan dated 2026-05-16 — compares all 32 docs vs codebase reality, health score per doc, identifies stale claims and missing coverage |
| [SEO_OS_BACKEND_GAP_FILL_REPORT.md](docs/backend/analysis/SEO_OS_BACKEND_GAP_FILL_REPORT.md) | `LIVE` | Production readiness summary for original 8-module backend + domain layer — scope notice added; Phase 2 (10 new modules) not included; cross-check against BACKEND_GAP_ANALYSIS before using |
| [SEO_OS_DELTA_ANALYSIS_REPORT.md](docs/backend/analysis/SEO_OS_DELTA_ANALYSIS_REPORT.md) | `LIVE` | Delta analysis vs full SEO OS target capability model — scope notice added; maturity % based on pre-Phase-2 8-module state; recalculate figures against 18-module backend before using for planning |

---

## docs/backend/archive/ — Phase 1 Historical Records

Freeze records, QC reports, and gap scans from the original 8-module Phase 1 build. Kept for traceability. Not updated.

| File | Status | Description |
|------|--------|-------------|
| [BACKEND_QC_FINAL.md](docs/backend/archive/BACKEND_QC_FINAL.md) | `ARCHIVE` | Phase 1 QC freeze verdict (10/10) for original 8 modules — dated 2026-04-22; explicitly scoped to Phase 1 only |
| [BACKEND_QC_REPORT.md](docs/backend/archive/BACKEND_QC_REPORT.md) | `ARCHIVE` | Phase 1 QC audit (10/10) for original 8 modules with module pass/fail matrix — dated 2026-04-22 |
| [BACKEND_V1_FROZEN.md](docs/backend/archive/BACKEND_V1_FROZEN.md) | `ARCHIVE` | Phase 1 freeze status record for original 8 modules — dated 2026-04-22; marks V1 as stable before Phase 2 expansion |
| [BACKEND_V1_HARDENED.md](docs/backend/archive/BACKEND_V1_HARDENED.md) | `ARCHIVE` | Phase 1 hardening validation record — checks module catalog, activation, orchestration, tests, HTTP server for original 8 modules |
| [BACKEND_BUILD_SEQUENCE.md](docs/backend/archive/BACKEND_BUILD_SEQUENCE.md) | `ARCHIVE` | Original Phase 1 build sequence for 8 modules — documentation-first order, architecture setup, implementation sequence; not updated for Phase 2 |
| [BACKEND_IMPLEMENTATION_GAP_SCAN.md](docs/backend/archive/BACKEND_IMPLEMENTATION_GAP_SCAN.md) | `ARCHIVE` | Phase 1 only gap scan for original 8 modules — all declared fixed; superseded by BACKEND_GAP_ANALYSIS_2026_05_16.md which covers all 18 |
| [BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md](docs/backend/archive/BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md) | `ARCHIVE` | Phase 1 schema/repository alignment fix for original 8 modules — documents 5 field-name mismatches resolved 2026-05-06; superseded by BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md |
| [BACKEND_DOMAIN_BOUNDARY_MAP.md](docs/backend/archive/BACKEND_DOMAIN_BOUNDARY_MAP.md) | `ARCHIVE` | Original Phase 1 domain boundary map for 8 modules — moved from reference/; fully superseded by BACKEND_DOMAIN_BOUNDARIES.md *(archived 2026-05-17)* |
| [BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md](docs/backend/archive/BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md) | `ARCHIVE` | Original implementation record for the 8-domain bounded context layer — moved from implementation/; fully superseded by BACKEND_DOMAIN_BOUNDARIES.md *(archived 2026-05-17)* |
| [BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_PHASE2.md](docs/backend/archive/BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_PHASE2.md) | `ARCHIVE` | Original Phase 2 alignment audit for 10 expansion modules — moved from implementation/; fully superseded by BACKEND_SCHEMA_REPOSITORY_ALIGNMENT.md *(archived 2026-05-17)* |

---

## docs/frontend/reference/ — Live Design System Rules

The frozen, active design system and content rules. These govern all UI development decisions.

| File | Status | Description |
|------|--------|-------------|
| [FRONTEND_DESIGN_LANGUAGE.md](docs/frontend/reference/FRONTEND_DESIGN_LANGUAGE.md) | `LIVE` | Frozen design language spec — typography, colour palette, spacing scale, elevation, motion principles; renamed from PHASE_07_DESIGN_LANGUAGE.md to reflect active reference status |
| [FRONTEND_DESIGN_SYSTEM.md](docs/frontend/reference/FRONTEND_DESIGN_SYSTEM.md) | `LIVE` | Frozen design system spec — component tokens, grid system, breakpoints, theming rules; renamed from PHASE_08_DESIGN_SYSTEM.md to reflect active reference status |
| [CURRENT_UI_BASELINE.md](docs/frontend/reference/CURRENT_UI_BASELINE.md) | `LIVE` | Current UI component inventory and screen count — baseline state snapshot for iterative design reference |
| [FRONTEND_MICROCOPY_RULES.md](docs/frontend/reference/FRONTEND_MICROCOPY_RULES.md) | `LIVE` | Microcopy rules — labels, empty states, error messages, CTA text standards across all screens |
| [FRONTEND_BACKEND_CONTENT_MAPPING.md](docs/frontend/reference/FRONTEND_BACKEND_CONTENT_MAPPING.md) | `LIVE` | Maps each backend module's output fields to the specific UI elements that display them |
| [FRONTEND_MODULE_FEATURE_MAPPING.md](docs/frontend/reference/FRONTEND_MODULE_FEATURE_MAPPING.md) | `LIVE` | Maps all 18 backend modules to frontend feature surfaces — full commercial job, screen blocks, and demo data for all 18; Phase 2 expansion modules (9–18) documented with planned feature surfaces *(backfilled 2026-05-17)* |

---

## docs/frontend/planning/ — Active Planning Docs

Live planning and capability mapping documents used to guide frontend build decisions.

| File | Status | Description |
|------|--------|-------------|
| [FRONTEND_MASTER_PLAN.md](docs/frontend/planning/FRONTEND_MASTER_PLAN.md) | `LIVE` | Master frontend plan — full screen list, implementation phases, feature priorities; product surface now lists all 18 modules across MVP / gated / Phase 2 expansion / opt-in tiers *(backfilled 2026-05-17)* |
| [FRONTEND_SCREEN_ARCHETYPES.md](docs/frontend/planning/FRONTEND_SCREEN_ARCHETYPES.md) | `LIVE` | Screen archetype definitions — the 6 reusable screen patterns used across the app, with composition rules |
| [FRONTEND_BACKEND_CAPABILITY_AUDIT.md](docs/frontend/planning/FRONTEND_BACKEND_CAPABILITY_AUDIT.md) | `LIVE` | Audit of which backend capabilities are surfaced in the frontend vs pending; Phase 1 (7 original modules) and Phase 2 (10 expansion modules) both listed as pending *(backfilled 2026-05-17)* |
| [FRONTEND_CAPABILITY_TO_FEATURE_WORKFLOW_MAP.md](docs/frontend/planning/FRONTEND_CAPABILITY_TO_FEATURE_WORKFLOW_MAP.md) | `LIVE` | Maps backend capabilities to frontend feature workflows end-to-end — from API response to user-facing feature |
| [FRONTEND_CONTENT_FULL_SYSTEM.md](docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md) | `LIVE` | Authoritative full content system — all screen-specific patterns, pattern combination rules, allowed insight formats, and module-specific insight examples; absorbs CONTENT_SYSTEM, CONTENT_PATTERNS_BASE, and INSIGHT_STRUCTURE *(updated 2026-05-17, 1095 lines)* |
| [FRONTEND_PHASE_INDEX.md](docs/frontend/planning/FRONTEND_PHASE_INDEX.md) | `LIVE` | Index of all 13 frontend design phases with status, deliverable summary, and completion date |

---

## docs/frontend/phases/ — Completed Phase Deliverables

Historical design phase outputs from PHASE_01 through PHASE_13. Kept for traceability and as source material for the live reference docs. Do not update these; they are frozen deliverables.

| File | Status | Description |
|------|--------|-------------|
| [PHASE_01_ARCHETYPES_AND_MAPPING.md](docs/frontend/phases/PHASE_01_ARCHETYPES_AND_MAPPING.md) | `ARCHIVE` | Phase 1 deliverable — initial screen archetypes and module-to-screen mapping |
| [PHASE_02_BEHAVIOUR_AND_MARKET_OVERLAY.md](docs/frontend/phases/PHASE_02_BEHAVIOUR_AND_MARKET_OVERLAY.md) | `ARCHIVE` | Phase 2 deliverable — user behaviour research and market context overlay applied to design |
| [PHASE_03_MARKET_OVERLAY.md](docs/frontend/phases/PHASE_03_MARKET_OVERLAY.md) | `ARCHIVE` | Phase 3 deliverable — market positioning overlay applied to the design language |
| [PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md](docs/frontend/phases/PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md) | `ARCHIVE` | Phase 3 supplemental — pattern language foundations and system primitives |
| [PHASE_04_IMPLEMENTATION_BLUEPRINT.md](docs/frontend/phases/PHASE_04_IMPLEMENTATION_BLUEPRINT.md) | `ARCHIVE` | Phase 4 deliverable — implementation blueprint for translating design decisions to code |
| [PHASE_04_INSPIRATION_PATTERN_EXTRACTION.md](docs/frontend/phases/PHASE_04_INSPIRATION_PATTERN_EXTRACTION.md) | `ARCHIVE` | Phase 4 supplemental — design patterns extracted from the inspiration library |
| [PHASE_04_INSPIRATION_VISUAL_AUDIT.md](docs/frontend/phases/PHASE_04_INSPIRATION_VISUAL_AUDIT.md) | `ARCHIVE` | Phase 4 supplemental — visual audit of inspiration images with pattern annotations |
| [PHASE_05_PATTERN_EXTRACTION_CHECKLIST.md](docs/frontend/phases/PHASE_05_PATTERN_EXTRACTION_CHECKLIST.md) | `ARCHIVE` | Phase 5 deliverable — checklist of all extracted design patterns with adoption status |
| [PHASE_12_ITERATION_PASSES.md](docs/frontend/phases/PHASE_12_ITERATION_PASSES.md) | `ARCHIVE` | Phase 12 deliverable — structured iteration pass methodology and pass definitions |
| [PHASE_13_IMPLEMENTATION_SEQUENCE.md](docs/frontend/phases/PHASE_13_IMPLEMENTATION_SEQUENCE.md) | `ARCHIVE` | Phase 13 deliverable — ordered implementation sequence for the full frontend build |

---

## docs/frontend/archive/ — Archived Frontend Docs

Superseded or stub-only docs moved here during 2026-05-17 deduplication pass. Not updated.

| File | Status | Description |
|------|--------|-------------|
| [FRONTEND_CONTENT_SYSTEM.md](docs/frontend/archive/FRONTEND_CONTENT_SYSTEM.md) | `ARCHIVE` | Base content system spec — fully subsumed by FRONTEND_CONTENT_FULL_SYSTEM.md which contains all its content plus module-specific patterns *(archived 2026-05-17)* |
| [FRONTEND_CONTENT_PATTERNS_BASE.md](docs/frontend/archive/FRONTEND_CONTENT_PATTERNS_BASE.md) | `ARCHIVE` | Base pattern rules — unique "Pattern Combination Rules" section migrated to FRONTEND_CONTENT_FULL_SYSTEM.md; remainder subsumed *(archived 2026-05-17)* |
| [FRONTEND_INSIGHT_STRUCTURE.md](docs/frontend/archive/FRONTEND_INSIGHT_STRUCTURE.md) | `ARCHIVE` | Insight structure spec — unique sections (Allowed Insight Formats, module-specific examples) migrated to FRONTEND_CONTENT_FULL_SYSTEM.md *(archived 2026-05-17)* |
| [PHASE_06_PATTERN_LIBRARY.md](docs/frontend/archive/PHASE_06_PATTERN_LIBRARY.md) | `ARCHIVE` | Phase 6 stub — thin spec (42 lines); actual pattern library is in code under ui/lib/shared/widgets/ *(archived 2026-05-17)* |
| [PHASE_09_SVG_ICON_LAYER.md](docs/frontend/archive/PHASE_09_SVG_ICON_LAYER.md) | `ARCHIVE` | Phase 9 stub — requirements spec only (28 lines); icon layer implemented in code; content covered by PHASE_10 *(archived 2026-05-17)* |
| [PHASE_10_COMPONENT_SYSTEM.md](docs/frontend/archive/PHASE_10_COMPONENT_SYSTEM.md) | `ARCHIVE` | Phase 10 stub — requirements spec only (31 lines); component system implemented in code; governance covered by PHASE_05 *(archived 2026-05-17)* |
| [PHASE_11_ARCHETYPE_ASSEMBLY.md](docs/frontend/archive/PHASE_11_ARCHETYPE_ASSEMBLY.md) | `ARCHIVE` | Phase 11 stub — spec and closure notes only (45 lines); assembly covered by PHASE_01 + PHASE_04; closure notes are in ITERATION_PASS_LOG *(archived 2026-05-17)* |

---

## docs/frontend/logs/ — Implementation Logs & Protocols

Running records and event logs. Append-only; do not rewrite historical entries.

| File | Status | Description |
|------|--------|-------------|
| [GAP_REGISTER.md](docs/frontend/logs/GAP_REGISTER.md) | `LIVE` | Live register of known frontend gaps — missing screens, incomplete features, content gaps; updated as gaps are found or closed |
| [IMAGE_PROTOCOL.md](docs/frontend/logs/IMAGE_PROTOCOL.md) | `DECISION` | Protocol for handling images in the frontend — naming conventions, compression rules, placeholder standards |
| [FRONTEND_CONTENT_IMPLEMENTATION_LOG.md](docs/frontend/logs/FRONTEND_CONTENT_IMPLEMENTATION_LOG.md) | `LOG` | Running log of content implementation decisions and changes made session by session |
| [ITERATION_PASS_LOG.md](docs/frontend/logs/ITERATION_PASS_LOG.md) | `LOG` | Log of all iteration passes run on frontend screens — what changed, what was improved, pass outcomes |
| [UI_IMPLEMENTATION_HISTORY.md](docs/frontend/logs/UI_IMPLEMENTATION_HISTORY.md) | `LOG` | Chronological history of all UI implementation sessions with key decisions and outcomes |

---

## docs/product/ — Product Docs

Active product planning, specification, and architecture docs.

| File | Status | Description |
|------|--------|-------------|
| [PRODUCT_SEO_OS_BUILD_PLAN.md](docs/product/PRODUCT_SEO_OS_BUILD_PLAN.md) | `LIVE` | **Authoritative full-product expansion build plan** — all phases, 25 tasks, deliverables, priorities; supersedes MASTER_BUILD_SPEC for planning purposes |
| [SYSTEMATIC_UI_ARCHITECTURE.md](docs/product/SYSTEMATIC_UI_ARCHITECTURE.md) | `LIVE` | UI architecture governance — screen hierarchy, navigation model, state management rules, layout system |
| [MASTER_BUILD_SPEC.md](docs/product/MASTER_BUILD_SPEC.md) | `LIVE` | Original product build specification — updated 2026-05-17 to acknowledge 18-module state; PRODUCT_SEO_OS_BUILD_PLAN is now the planning authority |
| [PRODUCTION_READINESS_GAPS.md](docs/product/PRODUCTION_READINESS_GAPS.md) | `LIVE` | **Production readiness gap register** — 5 P0s, 14 P1s, 10 P2s identified by 4-agent audit + manual verification 2026-05-17; each item has exact file/line evidence and fix instructions; update in place as gaps are resolved |

---

## docs/product/archive/ — Historical Product Records

| File | Status | Description |
|------|--------|-------------|
| [MARKET_RESEARCH_PLAYSTORE.md](docs/product/archive/MARKET_RESEARCH_PLAYSTORE.md) | `ARCHIVE` | Historical Play Store competitor market validation — written pre-backend build as initial market context; retained as a historical decision record |
| [MVP_TO_FULL_SUITE_ROLLOUT.md](docs/product/archive/MVP_TO_FULL_SUITE_ROLLOUT.md) | `ARCHIVE` | Original 7-phase MVP-to-full-suite rollout plan — superseded by PRODUCT_SEO_OS_BUILD_PLAN Part 7; moved from product/ to archive/ *(archived 2026-05-17)* |

---

## App READMEs

| File | Status | Description |
|------|--------|-------------|
| [ui/README.md](ui/README.md) | `LIVE` | Flutter UI prototype README — design archetype layer; points to app/README.md (production app) and docs/frontend/ (all frontend docs) |
| [app/README.md](app/README.md) | `LIVE` | BLoC Flutter app README — canonical production app; setup, BLoC architecture overview, state management guide |

---

## Maintenance

When adding, moving, or deleting any `.md` file:
1. Add / update / remove the corresponding row in this catalogue
2. Update the total count in the header
3. Keep the description to one sentence — purpose only, not content summary
