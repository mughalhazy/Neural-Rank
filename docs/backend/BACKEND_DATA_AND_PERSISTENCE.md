# Backend Data And Persistence

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER BUILD SPEC.md](</D:/Neural Rank/MASTER BUILD SPEC.md>)
- [docs/backend/BACKEND_MASTER_SPEC.md](</D:/Neural Rank/docs/backend/BACKEND_MASTER_SPEC.md>)
- [docs/backend/BACKEND_MODULE_BOUNDARIES.md](</D:/Neural Rank/docs/backend/BACKEND_MODULE_BOUNDARIES.md>)

This document defines the backend data and persistence model at an architectural level so later implementation can be done with low drift.

## Persistence Principles

Backend persistence must follow these principles:

- Postgres is the source of truth for structured product data
- persistence must preserve explicit module boundaries
- persistence must support the mandatory backend flow `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- persistence must support all eighteen modules from day 1
- persistence must support built-but-inactive modules without forcing immediate activation
- persistence must support later activation without major structural rewrite
- persistence must preserve source ownership when multiple modules relate to the same product subject
- persistence must support insight and prioritized action outputs rather than raw data only

## Postgres As Source Of Truth

Postgres is the source of truth for structured backend product state.

At an architecture level, Postgres must hold the durable records needed to support:

- product subject references derived from website URL and app URL inputs
- module input records
- module analysis results
- module insight outputs
- prioritized action outputs
- workflow-level aggregation and planning state where applicable
- activation-aware backend state where needed to support the defined activation model

Postgres must remain the authoritative backend store for structured product data across active and inactive modules.

## Supabase Role In Persistence/Auth/Storage

Supabase is the approved backend/data platform in the anchor spec.

Its architectural role is:

- Postgres for structured source-of-truth persistence
- Auth for identity and access control concerns
- Storage for object and file storage only where needed
- Edge Functions only where needed, without replacing Postgres as the system of record

Architectural separation must remain clear:

- Auth is not the primary persistence model for product data
- Storage is not the source of truth for structured product state
- Edge Functions do not redefine the core persistence model

## Persistence Ownership Table — All 18 Modules

All 18 modules share a uniform persistence shape provided by `core/persistence.js`. Each module writes to its own records table with foreign key to `app_public.product_targets`. The `defaultActive` column reflects the runtime activation state in `core/moduleCatalog.js`.

| Module | records table | defaultActive | Migration file |
|---|---|---|---|
| Review Analysis | `review_analysis_records` | true | `20260422020600_backend_foundation.sql` |
| Content / Listing Insights | `content_listing_insight_records` | true | `20260422020600_backend_foundation.sql` |
| Keyword Analysis | `keyword_analysis_records` | true | `20260422020600_backend_foundation.sql` |
| Rank Tracking | `rank_tracking_records` | true | `20260422020600_backend_foundation.sql` |
| Competitor Analysis | `competitor_analysis_records` | true | `20260422020600_backend_foundation.sql` |
| Optimization Layer | `optimization_layer_records` | true | `20260422020600_backend_foundation.sql` |
| Creative / Messaging Layer | `creative_messaging_layer_records` | true | `20260422020600_backend_foundation.sql` |
| Unified Workflow Layer | `unified_workflow_layer_records` | true | `20260422020600_backend_foundation.sql` |
| Technical SEO Audit | `technical_seo_audit_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| On-Page SEO Scorer | `on_page_seo_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| Backlink Intelligence | `backlink_intelligence_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| E-E-A-T Signals | `eeat_signal_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| Search Intent Classifier | `search_intent_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| SERP Feature Analyzer | `serp_feature_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| Topical Authority | `topical_authority_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| Site Architecture | `site_architecture_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| Analytics Integration | `analytics_integration_records` | true | `20260516120000_seo_os_expansion_modules.sql` |
| Local SEO | `local_seo_records` | **false** | `20260516120000_seo_os_expansion_modules.sql` |

Note: `local_seo` is the only module with `defaultActive: false`. Its records table and schema exist and are structurally available; activation requires an explicit override.

## Migration File Inventory

All migration files live in `supabase/migrations/`.

| Migration file | Purpose |
|---|---|
| `20260422020600_backend_foundation.sql` | Creates the initial backend schema: `app_public.product_targets` table plus module records tables for all 8 V1 modules (review_analysis, content_listing_insights, keyword_analysis, rank_tracking, competitor_analysis, optimization_layer, creative_messaging_layer, unified_workflow_layer). |
| `20260506120000_execution_lifecycle_foundation.sql` | Creates execution lifecycle schema: recommendations, tasks, and task status history tables supporting the execution domain service. |
| `20260506133000_governance_engine_foundation.sql` | Creates governance engine schema: governance rules, evaluation records, and policy state tables supporting the governance domain service. |
| `20260506150000_measurement_attribution_foundation.sql` | Creates measurement attribution schema: metric sources, baseline snapshots, post-change snapshots, and attribution link tables supporting the measurement domain service. |
| `20260506170000_search_intelligence_foundation.sql` | Creates search intelligence schema: query records, intent records, SERP pattern records, opportunity score records, and competitor result tables supporting the search-intelligence domain service. |
| `20260506183000_business_intelligence_foundation.sql` | Creates business intelligence schema: business profile records and priority extension records supporting the business-intelligence domain service. |
| `20260506193000_recommendation_scoring_foundation.sql` | Creates recommendation scoring schema: recommendation score dimension records supporting shared recommendation scoring infrastructure. |
| `20260516120000_seo_os_expansion_modules.sql` | Creates module records tables for all 10 Phase 2 modules: technical_seo_audit, on_page_seo, backlink_intelligence, eeat_signal, search_intent, serp_feature, topical_authority, site_architecture, analytics_integration, local_seo. |
| `20260516130000_fix_activation_defaults.sql` | Patches activation default records to align runtime catalog state with database defaults after Phase 2 expansion. |

## Data Separation Principles By Module

Persistence must preserve explicit module ownership.

### Review Analysis

- owns persisted review inputs it handles
- owns persisted review analysis results
- owns persisted review insights
- owns persisted review-priority and review-action outputs

### Content / Listing Insights

- owns persisted content/listing inputs it handles
- owns persisted content/listing analysis results
- owns persisted content/listing insights
- owns persisted content/listing prioritized actions

### Keyword Analysis

- owns persisted keyword inputs it handles
- owns persisted keyword analysis results
- owns persisted keyword insights
- owns persisted keyword-priority and keyword-action outputs

### Rank Tracking

- owns persisted rank-tracking inputs it handles
- owns persisted ranking analysis results
- owns persisted ranking insights
- owns persisted rank-priority and rank-action outputs

### Competitor Analysis

- owns persisted competitor inputs it handles
- owns persisted competitor analysis results
- owns persisted competitor insights
- owns persisted competitor-priority and competitor-action outputs

### Optimization Layer

- owns persisted optimization-relevant records used within its module scope
- owns persisted optimization outputs
- owns persisted optimization-priority and optimization-action outputs

### Creative / Messaging Layer

- owns persisted creative/messaging inputs it handles where relevant
- owns persisted creative/messaging analysis results
- owns persisted creative/messaging insights and suggestions
- owns persisted creative/messaging prioritized actions

### Unified Workflow Layer

- owns persisted workflow-level aggregation state
- owns persisted workflow planning outputs
- owns persisted workflow-level prioritized actions

### Technical SEO Audit

- owns persisted PageSpeed and Lighthouse input payloads
- owns persisted technical audit analysis results (CWV scores, failed audits)
- owns persisted technical SEO insights and prioritized remediation actions

### On-Page SEO Scorer

- owns persisted on-page input payloads (URL, content, meta fields)
- owns persisted on-page scoring analysis results
- owns persisted on-page SEO insights and prioritized action outputs

### Backlink Intelligence

- owns persisted backlink input payloads (backlink lists, referring domain lists)
- owns persisted backlink analysis results (authority score, toxicity risk, anchor distribution)
- owns persisted backlink insights and link-building action outputs

### E-E-A-T Signals

- owns persisted E-E-A-T signal input payloads
- owns persisted E-E-A-T analysis results
- owns persisted E-E-A-T insights and signal-improvement action outputs

### Search Intent Classifier

- owns persisted keyword intent classification inputs
- owns persisted intent analysis results (intent category, confidence, recommended formats)
- owns persisted intent insights and content-alignment action outputs

### SERP Feature Analyzer

- owns persisted SERP feature input payloads (keyword lists, provider results)
- owns persisted SERP feature analysis results (feature presence, organic positions)
- owns persisted SERP feature insights and feature-capture action outputs

### Topical Authority

- owns persisted topical authority input payloads
- owns persisted topical coverage analysis results
- owns persisted topical authority insights and gap-filling action outputs

### Site Architecture

- owns persisted site architecture input payloads
- owns persisted architecture analysis results (crawl structure, internal link patterns)
- owns persisted architecture insights and structural improvement action outputs

### Analytics Integration

- owns persisted GA4 and analytics input payloads
- owns persisted analytics analysis results (organic sessions, page performance)
- owns persisted analytics insights and traffic-improvement action outputs

### Local SEO

- owns persisted local SEO input payloads (NAP data, local signals)
- owns persisted local SEO analysis results
- owns persisted local SEO insights and local-optimization action outputs

Cross-module relationships may exist, but persistence must preserve source ownership instead of collapsing records into one vague shared domain.

## Activation-Aware Persistence Considerations

Because all modules are built now but not all are active by default, persistence must be activation-aware.

This means:

- inactive modules still require structurally valid persistence support
- active and inactive state must not force separate backend architectures
- persistence design must allow later activation without replacing the existing data model
- default active backend operation should only use the default-active module set, while inactive module persistence remains structurally available

As of 2026-05-15 expansion, 17 of 18 modules are `defaultActive: true`. The sole exception is `local_seo`, which is `defaultActive: false`. Its records table exists and is structurally ready for activation.

## Analysis Result Storage Considerations

Analysis results must be persistable at the module level.

At an architectural level, storage of analysis results should preserve:

- which module produced the analysis result
- which product subject or input set the result belongs to
- separation between raw input intake and interpreted backend analysis state
- the ability to support later insight generation and action prioritization

Analysis result persistence must not collapse directly into raw data storage only. It must support the backend requirement to move from analysis into insight and action.

## Prioritized Action Storage Considerations

Prioritized actions are mandatory outputs in the anchor spec and must be treated as first-class persisted backend outputs.

At an architectural level, prioritized action persistence should preserve:

- which module produced the action output
- which input or analysis context the action relates to
- separation between insight outputs and action outputs
- support for prioritized action handling within explicit module boundaries

Where Unified Workflow Layer later centralizes cross-module planning, workflow-level prioritized actions must still remain distinguishable from module-owned prioritized actions.

## Future-Safe Schema Principles

Final table design is not defined here, but later schema design must follow these principles:

- schema must preserve explicit module boundaries
- schema must preserve Postgres as source of truth
- schema must support all modules from day 1
- schema must support future activation without major structural rewrite
- schema must support product expansion later without mobile-only assumptions
- schema must preserve a clear path from input to analysis to insight to priority to action
- schema must preserve source ownership for module outputs even when workflow-level aggregation exists
- schema must avoid speculative complexity beyond the anchored scope

## Non-Goals

This document does not define:

- final table schema column sets
- unagreed fields
- alternate databases
- search systems
- queue systems
- analytics platforms
- frontend data models
