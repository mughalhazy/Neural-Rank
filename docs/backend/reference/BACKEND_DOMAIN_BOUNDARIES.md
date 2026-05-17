# Backend Domain Boundaries

> This document supersedes BACKEND_DOMAIN_BOUNDARY_MAP.md and BACKEND_DOMAIN_BOUNDARIES_IMPLEMENTATION_REPORT.md

Last updated: 2026-05-17

---

## Why the Domain Layer Exists

The domain boundary layer was introduced on 2026-05-06 to give Neural Rank's backend an explicit bounded-context structure that could grow without collapsing into a monolith. The goals were:

- Create explicit SEO OS bounded context folders that group related modules by capability, not by implementation history
- Add service contract/interface files for each domain so cross-domain consumers have a stable surface to depend on
- Add compatibility adapters so all legacy module services remain runnable without disruption during phased migration
- Centralize duplicated product target normalization in shared core (`backend/src/core/targeting.js`)
- Preserve all existing server routes and module execution behavior

The domain layer prepares the backend for phased implementation growth without requiring a rewrite of any existing module boundary or endpoint contract.

---

## The 8 Bounded Contexts

| Domain | Folder |
|--------|--------|
| `site-intelligence` | `backend/src/domains/site-intelligence` |
| `search-intelligence` | `backend/src/domains/search-intelligence` |
| `content-operations` | `backend/src/domains/content-operations` |
| `technical-operations` | `backend/src/domains/technical-operations` |
| `execution` | `backend/src/domains/execution` |
| `measurement` | `backend/src/domains/measurement` |
| `governance` | `backend/src/domains/governance` |
| `business-intelligence` | `backend/src/domains/business-intelligence` |

Runtime registry: `backend/src/domains/index.js`

---

## All 18 Modules — Bounded Context Assignment

This section maps all 18 Neural Rank modules to their bounded contexts.

### site-intelligence

Owns signals that characterize a target site's authority, reputation, and local presence.

| Module Key | Display Name | Activation |
|------------|--------------|------------|
| `rank_tracking` | Rank Tracking | defaultActive: true |
| `competitor_analysis` | Competitor Analysis | defaultActive: true |
| `backlink_intelligence` | Backlink Intelligence | defaultActive: true |
| `eeat_signals` | E-E-A-T Signals | defaultActive: true |
| `topical_authority` | Topical Authority | defaultActive: true |
| `local_seo` | Local SEO | defaultActive: false (opt-in) |

### search-intelligence

Owns keyword discovery, intent classification, and SERP-level opportunity analysis.

| Module Key | Display Name | Activation |
|------------|--------------|------------|
| `keyword_analysis` | Keyword Analysis | defaultActive: true |
| `search_intent_classifier` | Search Intent Classifier | defaultActive: true |
| `serp_feature_analyzer` | SERP Feature Analyzer | defaultActive: true |

### content-operations

Owns content quality evaluation, optimization guidance, messaging, and review intelligence.

| Module Key | Display Name | Activation |
|------------|--------------|------------|
| `content_listing_insights` | Content / Listing Insights | defaultActive: true |
| `optimization_layer` | Optimization Layer | defaultActive: true |
| `creative_messaging_layer` | Creative / Messaging Layer | defaultActive: true |
| `review_analysis` | Review Analysis | defaultActive: true |
| `on_page_seo_scorer` | On-Page SEO Scorer | defaultActive: true |

### technical-operations

Owns technical health auditing and site structural analysis.

| Module Key | Display Name | Activation |
|------------|--------------|------------|
| `technical_seo_audit` | Technical SEO Audit | defaultActive: true |
| `site_architecture` | Site Architecture | defaultActive: true |

### execution

Owns cross-module workflow coordination and recommendation lifecycle.

| Module Key | Display Name | Activation |
|------------|--------------|------------|
| `unified_workflow_layer` | Unified Workflow Layer | defaultActive: true |

### measurement

Owns analytics ingestion, performance snapshots, and attribution.

| Module Key | Display Name | Activation |
|------------|--------------|------------|
| `analytics_integration` | Analytics Integration | defaultActive: true |

### governance

Owns white-hat guardrails and policy registry. No modules assigned at this time — governance logic is enforced via shared policy primitives.

### business-intelligence

Owns business profiles and priority scoring. No modules assigned at this time — business intelligence surfaces through shared scoring primitives used across multiple domains.

---

## Compatibility Mapping (Phase 1 — 2026-05-06)

The initial domain boundary work established compatibility adapters for 8 modules. These adapters delegate directly to existing module `run()` functions without replacing any endpoint contracts.

| Module Key | Bounded Context |
|------------|----------------|
| `review_analysis` | `site-intelligence` (later reclassified to `content-operations` — see above) |
| `content_listing_insights` | `site-intelligence` (later reclassified to `content-operations` — see above) |
| `keyword_analysis` | `search-intelligence` |
| `rank_tracking` | `search-intelligence` (later reclassified to `site-intelligence` — see above) |
| `competitor_analysis` | `search-intelligence` (later reclassified to `site-intelligence` — see above) |
| `optimization_layer` | `content-operations` |
| `creative_messaging_layer` | `content-operations` |
| `unified_workflow_layer` | `execution` |

The authoritative assignment for all 18 modules is the table in the section above. The compatibility mapping reflects the initial adapter wiring; reclassifications do not require adapter changes because adapters delegate to module-level `run()` functions regardless of domain grouping.

---

## Shared Core

| Component | File | Purpose |
|-----------|------|---------|
| Target normalization | `backend/src/core/targeting.js` | Centralizes `normalizeProductTarget()` — removed from 8 individual module `analysis.js` files |
| Domain contract helper | `backend/src/core/domainContracts.js` | Shared factory for service contract creation |

---

## Compatibility Rule

- Existing module services remain the runtime source of truth
- New domain services expose compatibility adapters that delegate to existing module `run()` functions
- No existing endpoint contract was replaced during domain boundary introduction
- This prepares phased implementation without breaking existing endpoints

---

## Runtime Exports

The backend root (`backend/src/index.js`) exposes:

- `getDomainBoundaryMap`
- `getDomainServices`
- `normalizeProductTarget`

---

## Verification

| Test | File | Status |
|------|------|--------|
| Domain boundary verification | `backend/src/domain-boundaries.test.js` | PASS |
| Full backend validation | `backend/src/full-backend-validation.test.js` | PASS |
| Old modules still run | — | PASS |
| New backend structure ready for phased implementation | — | PASS |
| Duplicated target normalization centralized | — | PASS |
