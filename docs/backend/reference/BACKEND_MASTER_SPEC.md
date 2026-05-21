# Backend Master Spec

> Last updated 2026-05-17 — reflects 18-module state
>
> Version note: V1 (8 modules) frozen 2026-04-22. Expanded to 18 modules 2026-05-15.

Anchor: `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [ops/MASTER_BUILD_SPEC.md](../../product/ops/MASTER_BUILD_SPEC.md)

This document translates the master product build specification into a backend-only master spec. It does not add product scope, module scope, activation rules, or technology beyond the anchor.

## Backend Purpose

The backend exists to support the Unified SEO Platform as an operational SEO and ASO system that:

- analyzes SEO performance
- identifies opportunities
- supports execution of improvements

The backend must support insight and prioritized action generation. It must not stop at raw data delivery.

## Backend Product Coverage

The backend product coverage is:

- Web SEO
- App Store SEO / ASO

## Backend Stack

The backend stack is limited to:

- Supabase
- Postgres as source of truth
- Auth
- Storage
- Edge Functions only where needed

No extra backend technology is defined here.

## Backend Module List

The backend module set is extensible. The current 18 modules are:

| # | Module Key | Display Name | defaultActive | initialState |
|---|-----------|--------------|---------------|--------------|
| 1 | `review_analysis` | Review Analysis | `true` | `mvp_active` |
| 2 | `content_listing_insights` | Content / Listing Insights | `true` | `mvp_active` |
| 3 | `keyword_analysis` | Keyword Analysis | `true` | `mvp_active` |
| 4 | `rank_tracking` | Rank Tracking | `true` | `mvp_active` |
| 5 | `competitor_analysis` | Competitor Analysis | `true` | `backend_active` |
| 6 | `optimization_layer` | Optimization Layer | `true` | `backend_active` |
| 7 | `creative_messaging_layer` | Creative / Messaging Layer | `true` | `backend_active` |
| 8 | `unified_workflow_layer` | Unified Workflow Layer | `true` | `backend_active` |
| 9 | `technical_seo_audit` | Technical SEO Audit | `true` | `backend_active` |
| 10 | `on_page_seo_scorer` | On-Page SEO Scorer | `true` | `backend_active` |
| 11 | `backlink_intelligence` | Backlink Intelligence | `true` | `backend_active` |
| 12 | `eeat_signals` | E-E-A-T Signals | `true` | `backend_active` |
| 13 | `search_intent_classifier` | Search Intent Classifier | `true` | `backend_active` |
| 14 | `serp_feature_analyzer` | SERP Feature Analyzer | `true` | `backend_active` |
| 15 | `topical_authority` | Topical Authority | `true` | `backend_active` |
| 16 | `site_architecture` | Site Architecture | `true` | `backend_active` |
| 17 | `analytics_integration` | Analytics Integration | `true` | `backend_active` |
| 18 | `local_seo` | Local SEO | `false` | `backend_active` |

The `initialState` field describes when the module was introduced:
- `mvp_active` — present since the initial MVP build
- `backend_active` — added during the SEO OS expansion (2026-05-15)

## Backend Responsibilities Per Module

Each backend module must support:

- input handling path
- analysis path
- insight generation path
- action and prioritization path

### Review Analysis

Backend responsibility:

- handle review/customer feedback inputs
- support complaint clustering
- support feature request detection
- produce review insights and actions

### Content / Listing Insights

Backend responsibility:

- handle website content inputs
- handle app listing inputs
- analyze content quality for SEO
- analyze listing quality for app stores
- produce action-oriented outputs

### Keyword Analysis

Backend responsibility:

- handle keyword inputs
- support keyword suggestion generation
- support keyword opportunity identification
- support prioritized SEO / ASO discovery outputs

### Rank Tracking

Backend responsibility:

- handle tracked keyword inputs
- track keyword positions
- monitor changes
- surface actionable rank movement

### Competitor Analysis

Backend responsibility:

- handle competitor URLs / apps where relevant
- track competitors
- compare signals
- identify gaps and opportunities

### Optimization Layer

Backend responsibility:

- produce content suggestions
- produce metadata improvement suggestions
- turn intelligence into execution guidance

### Creative / Messaging Layer

Backend responsibility:

- support screenshot/content presentation critique inputs where relevant
- generate messaging suggestions
- support conversion-oriented optimization outputs

### Unified Workflow Layer

Backend responsibility:

- combine all modules into one operating workflow
- centralize insight and action planning
- support one product workflow instead of fragmented tool behavior

### Technical SEO Audit

Backend responsibility:

- audit crawl data for broken links, missing titles, and redirect chains
- evaluate Core Web Vitals (LCP, CLS, INP)
- analyze robots.txt and sitemap configuration
- evaluate structured data / schema markup presence
- produce technical health insights and prioritized remediation actions

### On-Page SEO Scorer

Backend responsibility:

- score individual pages against on-page SEO signals
- evaluate title, meta description, heading structure, and keyword usage
- produce page-level scoring insights and improvement actions

### Backlink Intelligence

Backend responsibility:

- analyze backlink profiles and referring domain data
- evaluate link quality, anchor text distribution, and authority signals
- identify link gap opportunities relative to competitors
- produce backlink insights and acquisition / disavow actions

### E-E-A-T Signals

Backend responsibility:

- evaluate Experience, Expertise, Authoritativeness, and Trustworthiness signals
- analyze author credentials, trust markers, and citation patterns
- produce E-E-A-T scoring insights and improvement actions

### Search Intent Classifier

Backend responsibility:

- classify keyword sets by search intent using the core heuristic classifier
- support content alignment recommendations based on intent category
- produce intent classification insights and content strategy actions

### SERP Feature Analyzer

Backend responsibility:

- analyze SERP feature presence and ownership opportunities
- detect featured snippet, AI overview, local pack, and knowledge panel opportunities
- produce SERP feature targeting insights and structured-data actions

### Topical Authority

Backend responsibility:

- evaluate content coverage depth and breadth across target topic clusters
- identify topical gaps relative to authority targets
- produce content cluster planning insights and gap-fill actions

### Site Architecture

Backend responsibility:

- analyze internal link structure, crawl depth, and page hierarchy
- evaluate URL structure and silo organization
- produce site architecture insights and structural improvement actions

### Analytics Integration

Backend responsibility:

- ingest Google Search Console search analytics and GA4 page metrics
- correlate performance data with SEO signals
- produce data-backed performance insights and prioritized actions

### Local SEO

Backend responsibility:

- analyze local citation consistency and Google Business Profile signals
- evaluate local keyword targeting and geo-specific rank factors
- produce local visibility insights and citation / profile improvement actions
- note: this module is opt-in only; it does not run in default orchestration

## Backend Activation Model

Build all modules now.

Default-active (17 modules — run in all default orchestration flows):

- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking
- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer
- Technical SEO Audit
- On-Page SEO Scorer
- Backlink Intelligence
- E-E-A-T Signals
- Search Intent Classifier
- SERP Feature Analyzer
- Topical Authority
- Site Architecture
- Analytics Integration

Built but inactive by default (1 module — present in catalog and registered in serviceRegistry but excluded from default orchestration):

- Local SEO (`local_seo`) — opt-in activation only; requires `allowInactiveActivation: true` in `resolveActivationState`

`BUILT_BUT_INACTIVE_MODULES` is non-empty for the first time as of 2026-05-15. Previously all built modules were default-active; now Local SEO is intentionally held back because its data requirements (GMB, citation providers) are not universally applicable.

Inactive means:

- module exists in architecture
- module exists in codebase
- module is gated from default orchestration
- module requires explicit opt-in to activate

Inactive does not mean:

- omitted
- commented out
- fake shell only
- absent from architecture

## Backend Execution Order

Default orchestration runs modules in the following order (from `serviceRegistry.js`):

1. `technical_seo_audit`
2. `review_analysis`
3. `content_listing_insights`
4. `keyword_analysis`
5. `rank_tracking`
6. `competitor_analysis`
7. `optimization_layer`
8. `creative_messaging_layer`
9. `on_page_seo_scorer`
10. `backlink_intelligence`
11. `eeat_signals`
12. `search_intent_classifier`
13. `serp_feature_analyzer`
14. `topical_authority`
15. `site_architecture`
16. `analytics_integration`
17. `local_seo` (registered but skipped in default flow — `defaultActive: false`)
18. `unified_workflow_layer`

Technical SEO Audit runs first because its outputs (crawl health, page speed, robots/sitemap state) provide foundational signals that downstream modules can reference. Unified Workflow Layer runs last because it synthesizes cross-module outputs.

## Backend Primary Flow

The backend primary flow is:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

This flow is mandatory across all modules.

The backend must not stop at:

- input -> raw data
- input -> chart
- input -> report without prioritization

The backend must always aim to convert:

- data -> insight
- insight -> action

## Backend Input Types

The backend must support these input types:

- website URL
- app URL
- keywords
- reviews
- competitor URLs / apps where relevant
- crawl data (for technical audit)
- backlink profiles
- SERP data
- analytics data (GSC, GA4)
- local business data (for Local SEO opt-in)

## Backend Output Types

The backend must support these output types:

- keyword insights
- ranking insights
- content insights
- review insights
- competitor insights
- optimization actions
- prioritized actions
- technical health reports
- backlink intelligence reports
- E-E-A-T assessments
- intent classification results
- SERP feature opportunity maps
- topical authority gap reports
- site architecture improvement plans
- analytics performance insights
- local visibility insights (opt-in)

Core output rule:

- system must output insights
- system must output prioritized actions
- system must not output raw data without interpretation

## Backend Architecture Principles

The backend must follow these principles from the master spec:

- all modules must exist as explicit bounded modules
- domain logic, data logic, and presentation logic must be separated
- activation boundaries must be explicit
- future module activation must not require major rewrite
- backend architecture must be scalable from day 1
- shared primitives may be built where genuinely reused
- avoid speculative enterprise complexity not discussed
- keep business logic separated from UI
- keep platform-specific integrations abstracted where needed
- do not make mobile-only assumptions that block later web expansion
- do not lock the product into a stack that forces rewrite for later expansion

## Backend Non-Goals

The backend must not:

- reduce the product to ASO only
- reduce the product to web SEO only
- reduce the product to utility tools only
- collapse all modules into one vague backend layer
- expose inactive modules as if they are active
- assume rewrite later for web app or client portal expansion
- treat public marketing website needs as the primary driver of backend architecture
- define frontend architecture
- define UI content

## Backend Done Condition

The backend master spec is satisfied when backend implementation later results in:

1. All 18 product modules present in the codebase.
2. 17 modules activated by default; 1 module (Local SEO) explicitly opt-in.
3. All modules built with executable runtime code, not shells.
4. Backend stack aligned to Supabase, Postgres, Auth, Storage, and Edge Functions only where needed.
5. Backend outputs aligned to insight and prioritized action generation.
6. Backend architecture able to expand later without major structural rewrite.
7. `assertModuleCatalogIntegrity()` passes at startup, confirming all catalog entries are accounted for in either `DEFAULT_ACTIVE_MODULES` or `BUILT_BUT_INACTIVE_MODULES`.
