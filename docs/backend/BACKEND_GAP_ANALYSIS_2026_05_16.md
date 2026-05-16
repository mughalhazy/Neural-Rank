# Backend Gap Analysis — Code vs Docs
> Date: 2026-05-16 | Scope: D:\Neural Rank\backend vs D:\Neural Rank\docs\backend

---

## 1. Doc Inventory

| Doc file | One-line summary |
|---|---|
| `BACKEND_MASTER_SPEC.md` | Top-level backend spec: 8 modules, activation model (4 MVP-active + 4 built-but-inactive), primary flow, stack, and done conditions |
| `BACKEND_MODULE_BOUNDARIES.md` | Per-module boundary rules for the original 8 modules: responsibilities, activation states |
| `BACKEND_DATA_AND_PERSISTENCE.md` | Architecture-level persistence principles: Postgres as source of truth, module ownership of data, future-safe schema rules |
| `BACKEND_SERVICES_AND_ORCHESTRATION.md` | Service layer principles, domain/data/orchestration separation, MVP-active vs built-but-inactive orchestration behavior |
| `BACKEND_INTEGRATION_BOUNDARIES.md` | Provider/adapter boundary concept, rules for incomplete integrations, module-to-integration separation |
| `BACKEND_BUILD_SEQUENCE.md` | Ordered documentation-first and architecture setup sequences, module implementation order |
| `BACKEND_IMPLEMENTATION_GAP_SCAN.md` | Gap scan across the original 8 modules and cross-cutting concerns; all items closed |
| `BACKEND_ACTIVATION_AND_GATING.md` | Corrected activation model: all modules active in backend by default, gating principles |
| `BACKEND_V1_HARDENED.md` | Hardening validation record for original 8 modules, activation and orchestration confirmed |
| `BACKEND_QC_REPORT.md` | QC audit 10/10 dated 2026-04-22, covering 8 modules only |
| `BACKEND_QC_FINAL.md` | Final freeze verdict for 8-module backend, dated 2026-04-22 |
| `BACKEND_V1_FROZEN.md` | Freeze status record: 8 active modules, deployment-ready, Render blueprint live |
| `BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md` | Repo/schema field alignment fix: 8 original modules, shared persistence.js helper added |
| `BACKEND_DOMAIN_BOUNDARY_MAP.md` | New bounded contexts (8 domains) and compatibility mapping from original 8 modules to domains |
| `BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md` | Implementation record for 8-domain layer, compatibility adapters, shared core centralization |
| `BACKEND_EXECUTION_LIFECYCLE_IMPLEMENTATION_REPORT.md` | Execution domain: recommendations, tasks, audit logs, approval gating, status history |
| `BACKEND_GOVERNANCE_ENGINE_IMPLEMENTATION_REPORT.md` | Governance domain: policy registry, 9 guardrails, block/warn/approve/allow classification |
| `BACKEND_MEASUREMENT_ATTRIBUTION_IMPLEMENTATION_REPORT.md` | Measurement domain: before/after snapshots, attribution links, metric source registry |
| `BACKEND_TECHNICAL_OPERATIONS_IMPLEMENTATION_REPORT.md` | Technical-operations domain: source HTML analyzers, rendered DOM placeholder |
| `BACKEND_SEARCH_INTELLIGENCE_IMPLEMENTATION_REPORT.md` | Search-intelligence domain: intent classifier (7 intents), provider interface, opportunity scoring |
| `BACKEND_BUSINESS_INTELLIGENCE_IMPLEMENTATION_REPORT.md` | Business-intelligence domain: business profiles, scoring, priority extension |
| `BACKEND_RECOMMENDATION_SCORING_IMPLEMENTATION_REPORT.md` | recommendationScoring.js: 9-dimension weighted scoring, priority derivation |
| `BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md` | API hardening: response envelope, validation, identity headers, 14 routes audited |
| `BACKEND_TEST_HARNESS_REPORT.md` | CI test harness: npm run test:backend, full-backend-validation.test.js, P0 coverage |
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Post-freeze gap fill summary: partial/missing items (auth, rate limiting, route gaps, typecheck) |

---

## 2. Code Inventory Summary

**Modules (18 total):** review-analysis, content-listing-insights, keyword-analysis, rank-tracking, competitor-analysis, optimization-layer, creative-messaging-layer, unified-workflow-layer, technical-seo-audit, on-page-seo-scorer, backlink-intelligence, eeat-signals, search-intent-classifier, serp-feature-analyzer, topical-authority, site-architecture, analytics-integration, local-seo

**Core utilities:** moduleCatalog.js, activation.js, prioritization.js, intentClassifier.js, seoScorer.js, domainAuthorityScorer.js, targeting.js, persistence.js, recommendationScoring.js, domainContracts.js, runtimeContext.js, createProviderAdapter.js

**Domain layer (8 bounded contexts):** execution, governance, measurement, technical-operations, search-intelligence, business-intelligence, site-intelligence, content-operations

**Adapters (5 implemented):** google-search-console, google-analytics-4, pagespeed-insights, backlink-provider, serp-provider

**Orchestration:** serviceRegistry.js (18 modules, execution order), defaultMvpOrchestrator.js, activationAwareOrchestrator.js

**API surface (server.js — 15 routes):** GET /health, GET /ready, GET /modules, POST /run/default, POST /run/activation-aware, POST /modules/:moduleKey/run, GET /execution/recommendations, POST /execution/recommendations, PATCH /execution/recommendations/:id/status, POST /execution/recommendations/:id/tasks, GET /execution/tasks, GET /execution/tasks/:id, PATCH /execution/tasks/:id/status, GET /execution/tasks/:id/history, GET /execution/audit-logs

---

## 3. Stale Doc Content

| Doc file | Stale claim | Actual code state |
|---|---|---|
| `BACKEND_MASTER_SPEC.md` | Lists 8 modules as "these explicit modules only" | Code has 18 modules in moduleCatalog.js |
| `BACKEND_MASTER_SPEC.md` | MVP-active: 4 modules; Built-but-inactive: 4 modules | DEFAULT_ACTIVE_MODULES includes all 17; BUILT_BUT_INACTIVE_MODULES is empty Set |
| `BACKEND_MODULE_BOUNDARIES.md` | Competitor Analysis: "Built-but-inactive initially" | defaultActive: true, initialState: "backend_active" |
| `BACKEND_MODULE_BOUNDARIES.md` | Optimization Layer: "Built-but-inactive initially" | defaultActive: true, initialState: "backend_active" |
| `BACKEND_MODULE_BOUNDARIES.md` | Creative/Messaging Layer: "Built-but-inactive initially" | defaultActive: true, initialState: "backend_active" |
| `BACKEND_MODULE_BOUNDARIES.md` | Unified Workflow Layer: "Built-but-inactive initially" | defaultActive: true, initialState: "backend_active" |
| `BACKEND_MODULE_BOUNDARIES.md` | Only 8 modules defined | 10 additional modules exist with no boundary definition |
| `BACKEND_SERVICES_AND_ORCHESTRATION.md` | "services organized around the eight explicit backend modules only" | serviceRegistry.js registers 18 modules |
| `BACKEND_SERVICES_AND_ORCHESTRATION.md` | Built-but-inactive modules "do not participate in default active orchestration" | No module is in BUILT_BUT_INACTIVE_MODULES; all 17 participate |
| `BACKEND_DATA_AND_PERSISTENCE.md` | "persistence must support all eight modules" | 18 module persistence paths exist; 10 have no documented ownership |
| `BACKEND_ACTIVATION_AND_GATING.md` | "eight modules" throughout | Code has 18 modules; "eight" is stale in every occurrence |
| `BACKEND_BUILD_SEQUENCE.md` | References "eight modules"; built-but-inactive section lists 4 specific modules | Those 4 are now fully active; 10 new modules have no sequence |
| `BACKEND_IMPLEMENTATION_GAP_SCAN.md` | P1 repository factory listed as unresolved | core/persistence.js exists and provides createPostgresModuleRunRepository — resolved |
| `BACKEND_IMPLEMENTATION_GAP_SCAN.md` | competitor_analysis etc. "kept built-but-inactive by default" | All are defaultActive: true; none in BUILT_BUT_INACTIVE_MODULES |
| `BACKEND_V1_HARDENED.md` | "Modules Completed" lists only original 8 | 10 additional modules exist and are fully implemented |
| `BACKEND_QC_REPORT.md` | Pass matrix for 8 modules only; dated 2026-04-22 | 10 additional modules have no QC pass record |
| `BACKEND_QC_FINAL.md` | Freeze verdict based on 8-module coverage | 10 additional modules unscoped by freeze |
| `BACKEND_V1_FROZEN.md` | Frozen module list names only 8 | 17 modules active by default; 10 new modules not in freeze record |
| `BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md` | Covers "all eight module repositories" | 10 additional module repositories not covered |
| `BACKEND_DOMAIN_BOUNDARY_MAP.md` | Compatibility mapping only for 8 original modules | 10 new modules have no domain mapping defined |
| `BACKEND_SEARCH_INTELLIGENCE_IMPLEMENTATION_REPORT.md` | Intent taxonomy: 7 intents (informational, navigational, commercial, transactional, local, comparison, investigative) | core/intentClassifier.js uses only 4 intents — two separate classifiers with different taxonomies exist |
| `BACKEND_INTEGRATION_BOUNDARIES.md` | "No specific external providers defined here"; only original 8 modules | integrations/catalog.js defines 5 implemented adapters for specific providers |

---

## 4. Docs Missing Coverage (code exists, no doc)

| Code area | What it does | Gap severity |
|---|---|---|
| `modules/technical-seo-audit/` | Full 5-file module; uses pagespeedInsightsAdapter (implemented) | High |
| `modules/on-page-seo-scorer/` | On-page SEO scoring module | High |
| `modules/backlink-intelligence/` | Backlink analysis; uses backlinkProviderAdapter (implemented) | High |
| `modules/eeat-signals/` | E-E-A-T signal analysis module | High |
| `modules/search-intent-classifier/` | Search intent classification using core/intentClassifier.js | High |
| `modules/serp-feature-analyzer/` | SERP feature analysis; uses serpProviderAdapter (implemented) | High |
| `modules/topical-authority/` | Topical authority analysis module | High |
| `modules/site-architecture/` | Site architecture analysis module | High |
| `modules/analytics-integration/` | GSC + GA4 aggregation; uses googleAnalytics4Adapter (implemented) | High |
| `modules/local-seo/` | Local SEO module; defaultActive: false but missing from both activation sets — orphan | High |
| `core/runtimeContext.js` | buildModuleContext() factory: aliased context with integrations, repositories, prior results | High |
| `core/createProviderAdapter.js` | Adapter factory with collect() and normalizeInput(), returns integration_not_connected / integration_incomplete | High |
| `core/intentClassifier.js` | 4-intent heuristic keyword classifier | Med |
| `core/seoScorer.js` | CTR model, content depth tiers, readability scoring, keyword density | Med |
| `core/domainAuthorityScorer.js` | DA tier scoring, toxicity risk, anchor distribution | Med |
| `core/targeting.js` | normalizeProductTarget(), inferTargetType() | Med |
| `core/domainContracts.js` | createDomainServiceContract() factory for typed domain contracts | Med |
| `integrations/catalog.js` | 18-entry catalog with isImplemented flag; 5 adapters implemented | High |
| `integrations/adapters/google-search-console.js` | Implemented GSC adapter | High |
| `integrations/adapters/google-analytics-4.js` | Implemented GA4 adapter | High |
| `integrations/adapters/pagespeed-insights.js` | Implemented PageSpeed Insights adapter | High |
| `integrations/adapters/backlink-provider.js` | Implemented backlink provider adapter | High |
| `integrations/adapters/serp-provider.js` | Implemented SERP provider adapter | High |
| `api/errors.js` + `api/validation.js` | ApiError, normalizeError(), 7 validation functions, identity extraction | Med |
| Domain services: measurement, technical-operations, search-intelligence, business-intelligence | Implemented but no HTTP routes; unreachable via API | High |
| Dual classifier issue | core/intentClassifier.js (4-intent) vs domains/search-intelligence/intentClassifier.js (7-intent) — undocumented parallel implementations | High |

---

## 5. Unimplemented Doc Promises

| Doc file | Promise | Status |
|---|---|---|
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Replace placeholder actor header auth with real Supabase Auth enforcement | Still placeholder — x-neural-rank-actor header only |
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Add dedicated API routes for measurement, technical-operations, search-intelligence, business-intelligence | No routes exist; domains unreachable via HTTP |
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Wire compliant SERP provider through search-intelligence domain providerInterface | serp-provider.js adapter exists but domain providerInterface has no concrete provider wired |
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Add persistent rate limiting and tenant/workspace enforcement | X-RateLimit-Policy: placeholder; workspace-id extracted but not enforced |
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Add rendered DOM analysis behind explicit renderer contract | buildRenderedDomPlaceholder() exists; no renderer implemented |
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | Add lint/typecheck scripts to CI | Not present in package.json |
| `BACKEND_DOMAIN_BOUNDARY_MAP.md` | Clear mapping of technical-operations domain to technical_seo_audit module | Boundary between module and domain responsibility is undefined in code |

---

## 6. Overall Health Score Per Doc File

| Doc file | Accuracy | Coverage | Verdict |
|---|---|---|---|
| `BACKEND_MASTER_SPEC.md` | Low | Low | Needs full update |
| `BACKEND_MODULE_BOUNDARIES.md` | Low | Low (55% of modules missing) | Needs full update |
| `BACKEND_DATA_AND_PERSISTENCE.md` | Medium | Low | Needs update |
| `BACKEND_SERVICES_AND_ORCHESTRATION.md` | Low | Low | Needs full update |
| `BACKEND_INTEGRATION_BOUNDARIES.md` | Medium | Low | Needs update |
| `BACKEND_BUILD_SEQUENCE.md` | Low | Low | Needs update |
| `BACKEND_IMPLEMENTATION_GAP_SCAN.md` | Medium | Low | Needs supplemental scan |
| `BACKEND_ACTIVATION_AND_GATING.md` | Low | Low | Needs full update |
| `BACKEND_V1_HARDENED.md` | Low | Low (44% scope) | Stale milestone |
| `BACKEND_QC_REPORT.md` | Low | Low | Stale QC record |
| `BACKEND_QC_FINAL.md` | Low | Low | Stale freeze |
| `BACKEND_V1_FROZEN.md` | Low | Low | Stale freeze |
| `BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md` | Medium | Low | Needs supplemental audit |
| `BACKEND_DOMAIN_BOUNDARY_MAP.md` | High | Medium | Mostly accurate, needs completion |
| `BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md` | High | Medium | Mostly accurate |
| `BACKEND_EXECUTION_LIFECYCLE_IMPLEMENTATION_REPORT.md` | High | High | Accurate |
| `BACKEND_GOVERNANCE_ENGINE_IMPLEMENTATION_REPORT.md` | High | High | Accurate |
| `BACKEND_MEASUREMENT_ATTRIBUTION_IMPLEMENTATION_REPORT.md` | High | High | Accurate |
| `BACKEND_TECHNICAL_OPERATIONS_IMPLEMENTATION_REPORT.md` | High | High | Accurate |
| `BACKEND_SEARCH_INTELLIGENCE_IMPLEMENTATION_REPORT.md` | Medium | Medium | Partially accurate (dual classifier undocumented) |
| `BACKEND_BUSINESS_INTELLIGENCE_IMPLEMENTATION_REPORT.md` | High | High | Accurate |
| `BACKEND_RECOMMENDATION_SCORING_IMPLEMENTATION_REPORT.md` | High | High | Accurate |
| `BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md` | High | High | Accurate |
| `BACKEND_TEST_HARNESS_REPORT.md` | High | Medium | Mostly accurate |
| `SEO_OS_BACKEND_GAP_FILL_REPORT.md` | High | High | Accurate — most useful current-state doc |

---

## 7. Priority Fix List

### P0 — Correctness blockers

1. **Fix `local_seo` activation orphan in code.** `moduleCatalog.js` has `defaultActive: false` for `local_seo` but `activation.js` has it in neither `DEFAULT_ACTIVE_MODULES` nor `BUILT_BUT_INACTIVE_MODULES`. `assertModuleCatalogIntegrity()` will not catch this. Add `local_seo` to `BUILT_BUT_INACTIVE_MODULES` so the integrity check covers it and its activation state is explicit.

2. **Update `BACKEND_MASTER_SPEC.md` to 18 modules.** Remove "these explicit modules only." Update activation model section. The 4 originally-built-but-inactive modules are now all active; the 10 new modules have their own activation states.

3. **Update `BACKEND_MODULE_BOUNDARIES.md` with 10 missing module boundary definitions.** Add boundary sections for all 10 new modules. Correct the activation state for `competitor_analysis`, `optimization_layer`, `creative_messaging_layer`, `unified_workflow_layer` from "Built-but-inactive" to "backend_active".

4. **Update `BACKEND_ACTIVATION_AND_GATING.md`.** Replace all "eight modules" language. Document that `BUILT_BUT_INACTIVE_MODULES` is currently an empty Set except for `local_seo`. Document the `local_seo` opt-in status explicitly.

### P1 — Significant drift causing operational confusion

5. **Update `BACKEND_SERVICES_AND_ORCHESTRATION.md`.** Replace "eight modules only" language with 18. Correct MVP-active/built-but-inactive orchestration section — all 17 participate by default.

6. **Issue supplemental QC report (`BACKEND_QC_PHASE2.md`) for the 10 new modules.** Each needs: exists, active by default (or documented inactive), flow complete, tested.

7. **Issue supplemental schema/repository alignment for the 10 new module repositories.** Verify each new module's repository.js uses the correct createPostgresModuleRunRepository() pattern.

8. **Document the dual intent classifier.** `core/intentClassifier.js` (4-intent) and `domains/search-intelligence/intentClassifier.js` (7-intent) are parallel implementations. Decide if they should be consolidated or documented as distinct utilities with different use cases.

### P2 — Missing coverage

9. **Document all 5 implemented integration adapters** in `BACKEND_INTEGRATION_BOUNDARIES.md`. Add table: adapter name, implementation status, modules served.

10. **Add documentation for post-V1 core utilities:** `runtimeContext.js`, `createProviderAdapter.js`, `seoScorer.js`, `domainAuthorityScorer.js`, `intentClassifier.js`, `targeting.js`, `domainContracts.js`.

11. **Update `BACKEND_DATA_AND_PERSISTENCE.md`** to enumerate persistence ownership for all 10 new modules and reference the 9 migration files now in supabase/migrations/.

12. **Clarify API route status for 4 domain services** (measurement, technical-operations, search-intelligence, business-intelligence). Confirm intentionally routeless or plan routes as a tracked gap item.

13. **Update freeze documents** (`BACKEND_V1_FROZEN.md`, `BACKEND_QC_FINAL.md`) to note they cover only the original 8-module scope and that a Phase 2 freeze is pending.
