# Backend Module Boundaries

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER_BUILD_SPEC.md](../../product/MASTER_BUILD_SPEC.md)
- [BACKEND_MASTER_SPEC.md](BACKEND_MASTER_SPEC.md)

This document defines explicit backend module boundaries so implementation does not drift, merge modules, or collapse into a monolith. It covers all 18 modules: the original 8 plus the 10 SEO OS expansion modules added 2026-05-15.

## Boundary Rules

- no merging of modules
- no vague shared module ownership
- each module remains explicitly bounded
- each module supports the required backend path from input through action
- shared primitives may exist only where genuinely reused
- shared primitives must not erase module ownership
- Unified Workflow Layer coordinates modules but does not replace them

---

## Module 1: Review Analysis

### Module Name

Review Analysis

### Backend Purpose

Analyze review and customer feedback signals, cluster complaints, detect feature requests, and convert review data into insights and actions.

### Core Backend Responsibility

- own the backend processing path for review-derived intelligence
- keep review intelligence separate from keyword, rank, content/listing, competitor, optimization, creative, and workflow ownership

### Input Responsibility

- handle review inputs
- persist review-source intake relevant to this module

### Analysis Responsibility

- analyze review and customer feedback signals
- support complaint clustering
- support feature request detection

### Insight/Action Responsibility

- produce review insights
- produce prioritized review-derived actions

### Persistence Responsibility

- persist review inputs handled by this module
- persist review analysis outputs
- persist review insights
- persist review-derived prioritized actions

### Orchestration Relationship

- participates as an explicit module in the system flow
- provides review-derived outputs to orchestration
- may be consumed by Unified Workflow Layer, but is not replaced by it

### Activation State

`defaultActive: true`, `initialState: "mvp_active"`

---

## Module 2: Content / Listing Insights

### Module Name

Content / Listing Insights

### Backend Purpose

Analyze content quality for SEO, analyze listing quality for app stores, and convert observations into action-oriented outputs.

### Core Backend Responsibility

- own the backend processing path for content and listing intelligence
- keep content/listing intelligence separate from review, keyword, rank, competitor, optimization, creative, and workflow ownership

### Input Responsibility

- handle website URL and related content inputs
- handle app URL and related listing inputs

### Analysis Responsibility

- analyze content quality for SEO
- analyze listing quality for app stores
- convert observations into backend analysis outputs

### Insight/Action Responsibility

- produce content insights
- produce listing-related insights within this module scope
- produce prioritized action-oriented outputs derived from content/listing analysis

### Persistence Responsibility

- persist content/listing inputs handled by this module
- persist content/listing analysis outputs
- persist content/listing insights
- persist content/listing prioritized actions

### Orchestration Relationship

- participates as an explicit module in the system flow
- provides content/listing outputs to orchestration
- may be consumed by Unified Workflow Layer, but is not replaced by it

### Activation State

`defaultActive: true`, `initialState: "mvp_active"`

---

## Module 3: Keyword Analysis

### Module Name

Keyword Analysis

### Backend Purpose

Generate keyword suggestions, identify keyword opportunities, and support prioritized SEO / ASO discovery.

### Core Backend Responsibility

- own the backend processing path for keyword opportunity discovery
- keep keyword analysis separate from rank tracking, review analysis, content/listing analysis, competitor analysis, optimization, creative, and workflow ownership

### Input Responsibility

- handle keyword inputs
- handle keyword sets used for keyword analysis in this module

### Analysis Responsibility

- generate keyword suggestions
- identify keyword opportunities
- support prioritized SEO / ASO discovery analysis

### Insight/Action Responsibility

- produce keyword insights
- produce prioritized keyword-related actions within this module scope

### Persistence Responsibility

- persist keyword inputs handled by this module
- persist keyword analysis outputs
- persist keyword insights
- persist keyword-priority and keyword-action outputs

### Orchestration Relationship

- participates as an explicit module in the system flow
- provides keyword-derived outputs to orchestration
- remains separate from Rank Tracking even when the same keywords are involved

### Activation State

`defaultActive: true`, `initialState: "mvp_active"`

---

## Module 4: Rank Tracking

### Module Name

Rank Tracking

### Backend Purpose

Track keyword positions, monitor changes, and surface actionable rank movement.

### Core Backend Responsibility

- own the backend processing path for ranking history and rank movement
- keep rank tracking separate from keyword opportunity discovery, review analysis, content/listing analysis, competitor analysis, optimization, creative, and workflow ownership

### Input Responsibility

- handle tracked keyword inputs for ranking purposes
- handle rank-tracking targets required by this module

### Analysis Responsibility

- track keyword positions
- monitor ranking changes
- analyze actionable rank movement

### Insight/Action Responsibility

- produce ranking insights
- produce prioritized rank-movement actions

### Persistence Responsibility

- persist tracked keyword rank data handled by this module
- persist ranking analysis outputs
- persist ranking insights
- persist prioritized rank-related actions

### Orchestration Relationship

- participates as an explicit module in the system flow
- provides ranking outputs to orchestration
- remains separate from Keyword Analysis even when both operate on related keyword sets

### Activation State

`defaultActive: true`, `initialState: "mvp_active"`

---

## Module 5: Competitor Analysis

### Module Name

Competitor Analysis

### Backend Purpose

Track competitors, compare signals, and identify gaps and opportunities.

### Core Backend Responsibility

- own the backend processing path for competitor comparison and gap analysis
- keep competitor analysis separate from primary ownership of review, content/listing, keyword, rank, optimization, creative, and workflow paths

### Input Responsibility

- handle competitor URLs / apps where relevant
- handle competitor targets used for this module

### Analysis Responsibility

- track competitors
- compare signals
- identify gaps and opportunities

### Insight/Action Responsibility

- produce competitor insights
- produce prioritized competitor-derived actions within this module scope

### Persistence Responsibility

- persist competitor inputs handled by this module
- persist competitor comparison outputs
- persist competitor insights
- persist competitor-priority and competitor-action outputs

### Orchestration Relationship

- participates as an explicit module in the system flow
- provides competitor outputs to orchestration when activated
- may inform Unified Workflow Layer later, but remains separately bounded

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

(Corrected from original spec which listed this as built-but-inactive. As of 2026-05-15 this module is default-active.)

---

## Module 6: Optimization Layer

### Module Name

Optimization Layer

### Backend Purpose

Produce content suggestions, produce metadata improvement suggestions, and turn intelligence into execution guidance.

### Core Backend Responsibility

- own backend generation of optimization guidance
- keep optimization outputs separate from upstream analysis ownership in other modules

### Input Responsibility

- handle optimization-relevant inputs available from the anchored product inputs and module outputs
- consume upstream module intelligence where needed without taking over upstream module ownership

### Analysis Responsibility

- analyze available module intelligence for optimization purposes
- support translation of intelligence into execution guidance

### Insight/Action Responsibility

- produce optimization actions
- produce prioritized execution guidance within this module scope

### Persistence Responsibility

- persist optimization-related inputs used by this module
- persist optimization guidance outputs
- persist optimization insights where generated
- persist prioritized optimization actions

### Orchestration Relationship

- consumes outputs from explicit analysis modules where needed
- provides execution guidance outputs to orchestration when activated
- does not replace source module ownership of upstream analysis

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

(Corrected from original spec which listed this as built-but-inactive. As of 2026-05-15 this module is default-active.)

---

## Module 7: Creative / Messaging Layer

### Module Name

Creative / Messaging Layer

### Backend Purpose

Critique screenshot/content presentation, generate messaging suggestions, and support conversion-oriented optimization.

### Core Backend Responsibility

- own the backend processing path for creative and messaging suggestion outputs
- keep creative/messaging outputs separate from content/listing, optimization, and workflow ownership

### Input Responsibility

- handle inputs relevant to screenshot/content presentation critique where relevant
- handle inputs relevant to messaging suggestion generation where relevant

### Analysis Responsibility

- support critique of screenshot/content presentation
- support messaging-oriented analysis within this module scope
- support conversion-oriented optimization analysis within this module scope

### Insight/Action Responsibility

- produce creative and messaging suggestions
- produce prioritized creative/messaging actions within this module scope

### Persistence Responsibility

- persist creative/messaging inputs handled by this module
- persist creative/messaging analysis outputs
- persist creative/messaging insights and suggestions
- persist prioritized creative/messaging actions

### Orchestration Relationship

- participates as an explicit module when activated
- provides creative/messaging outputs to orchestration
- may inform Unified Workflow Layer later, but remains separately bounded

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

(Corrected from original spec which listed this as built-but-inactive. As of 2026-05-15 this module is default-active.)

---

## Module 8: Unified Workflow Layer

### Module Name

Unified Workflow Layer

### Backend Purpose

Combine all modules into one operating workflow, centralize insight and action planning, and provide one product workflow instead of fragmented tool behavior.

### Core Backend Responsibility

- own backend coordination of cross-module workflow composition
- centralize insight and action planning across explicit modules
- keep coordination separate from source analysis ownership in other modules

### Input Responsibility

- handle workflow-relevant inputs from explicit module outputs
- handle workflow planning inputs required to support the primary system flow

### Analysis Responsibility

- analyze cross-module outputs for workflow-level planning
- support centralized planning across explicit modules

### Insight/Action Responsibility

- produce workflow-level prioritized actions
- centralize cross-module insight and action planning outputs

### Persistence Responsibility

- persist workflow-level aggregation state
- persist workflow-level planning outputs
- persist workflow-level prioritized actions

### Orchestration Relationship

- runs last in execution order; coordinates all preceding module outputs
- depends on module outputs rather than reimplementing module internals
- does not replace ownership of any of the 17 other modules

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

(Corrected from original spec which listed this as built-but-inactive beyond MVP activation. As of 2026-05-15 this module is default-active and always runs last in the execution order.)

---

## Module 9: Technical SEO Audit

### Module Name

Technical SEO Audit

### Backend Purpose

Audit the technical health of a website by evaluating crawl data, Core Web Vitals, robots/sitemap configuration, and structured data. Produces a ranked list of technical remediation actions. This module runs first in execution order because its outputs provide foundational signals for other modules.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects one or more of: `url` (string), `crawlData` (array of `{ url, statusCode, title? }`), `pageSpeedData` (`{ lcp, cls, inp }`), `robotsData` (`{ disallowedPaths, hasSitemapReference }`), `schemaData` (array). Normalizer: `normalizeAuditInput()` in `analysis.js`.

### Output Contract

Returns `{ moduleKey, status, flow: { input, analysis, insight, priority, action }, intakeResult, analysisResult, insightResult, actionResult, persistence, integrationStatus }`. Actions are prioritized technical remediation items (e.g. fix broken URLs, improve LCP, add sitemap reference).

### Integration Boundary

Checks for a registered adapter at `technical_seo_audit` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.technical_seo_audit_records`. Factory: `createPostgresTechnicalSeoAuditRepository(query)`.

---

## Module 10: On-Page SEO Scorer

### Module Name

On-Page SEO Scorer

### Backend Purpose

Score individual pages against on-page SEO signals including title tags, meta descriptions, heading hierarchy, and keyword density. Produces per-page scoring insights and a ranked list of on-page improvement actions.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `pages` (array of page objects with URL, title, meta description, headings, body content). Normalizer: `normalizeOnPageInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope with `{ flow: { input, analysis, insight, priority, action } }`. Actions are page-specific on-page fixes (missing/duplicate titles, thin content, missing keywords).

### Integration Boundary

Checks for a registered adapter at `on_page_seo_scorer` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.on_page_seo_records`. Factory: `createPostgresOnPageSeoRepository(query)`.

---

## Module 11: Backlink Intelligence

### Module Name

Backlink Intelligence

### Backend Purpose

Analyze backlink profiles and referring domain data to evaluate link quality, anchor text distribution, and domain authority signals. Identifies link acquisition opportunities and flags toxic or unnatural links for disavow consideration.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `backlinks` (array of `{ url, anchorText, domainAuthority? }`) and/or `referringDomains` (array of domain objects). Normalizer: `normalizeBacklinkInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope. Actions include link acquisition targets, disavow candidates, and anchor text diversification recommendations.

### Integration Boundary

Checks for a registered adapter at `backlink_intelligence` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected. Designed to accept output from third-party backlink tools (Ahrefs, Majestic, etc.) via adapter normalization.

### Persistence

Records table: `app_public.backlink_intelligence_records`. Factory: `createPostgresBacklinkIntelligenceRepository(query)`.

---

## Module 12: E-E-A-T Signals

### Module Name

E-E-A-T Signals

### Backend Purpose

Evaluate Google's Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) signals across pages and site-level trust markers. Produces a scored assessment and a prioritized list of trust-building actions.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `pages` (array of page objects with author, credentials, citations) and/or `trustSignals` (array of site-level trust indicators). Normalizer: `normalizeEeatInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope. Actions include adding author bios, improving About/Contact pages, acquiring editorial citations, and adding trust schema markup.

### Integration Boundary

Checks for a registered adapter at `eeat_signals` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.eeat_signal_records`. Factory: `createPostgresEeatSignalsRepository(query)`.

---

## Module 13: Search Intent Classifier

### Module Name

Search Intent Classifier

### Backend Purpose

Classify keyword sets by search intent using the core heuristic token-based classifier (`core/intentClassifier.js`). Maps each keyword to an intent category and generates content-format alignment recommendations. This module uses the 4-intent taxonomy (informational, navigational, transactional, commercial) from the core classifier layer.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `keywords` (array of keyword strings or objects with `keyword` field). Normalizer: `normalizeSearchIntentInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope. Actions include content-format recommendations aligned to detected intent (e.g. create comparison page for commercial intent, create how-to article for informational intent).

### Integration Boundary

Checks for a registered adapter at `search_intent_classifier` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.search_intent_records`. Factory: `createPostgresSearchIntentRepository(query)`.

---

## Module 14: SERP Feature Analyzer

### Module Name

SERP Feature Analyzer

### Backend Purpose

Analyze SERP feature presence and ownership opportunities across target keywords. Identifies which features (featured snippets, AI overviews, local packs, knowledge panels, People Also Ask boxes) are triggering and whether the target URL owns them. Produces structured-data and content recommendations to capture unowned features.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `serpEntries` (array of SERP result objects with `keyword`, `features`, `positions`). Normalizer: `normalizeFeatureInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope. Actions include implementing schema markup types, restructuring content for featured-snippet eligibility, and building local signals for local-pack inclusion.

### Integration Boundary

Checks for a registered adapter at `serp_feature_analyzer` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected. Designed to accept SERP provider data via adapter normalization.

### Persistence

Records table: `app_public.serp_feature_records`. Factory: `createPostgresSerpFeatureRepository(query)`.

---

## Module 15: Topical Authority

### Module Name

Topical Authority

### Backend Purpose

Evaluate the depth and breadth of a site's content coverage across target topic clusters. Identifies topical gaps — subtopics and related queries not covered by existing content — relative to authority targets. Produces a content cluster plan with gap-fill priorities.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `targetTopics` (array of topic strings or objects) and/or `existingContent` (array of content objects with URL, title, topic tags). Normalizer: `normalizeTopicalInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope. Actions include creating new content pieces for identified gaps, consolidating thin topical coverage, and building internal links to strengthen cluster signals.

### Integration Boundary

Checks for a registered adapter at `topical_authority` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.topical_authority_records`. Factory: `createPostgresTopicalAuthorityRepository(query)`.

---

## Module 16: Site Architecture

### Module Name

Site Architecture

### Backend Purpose

Analyze internal link structure, crawl depth, page hierarchy, and URL organization to evaluate how well the site's architecture supports search engine crawling and user navigation. Produces structural improvement recommendations.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `pages` (array of page objects with URL, internal links, crawl depth, parent page). Normalizer: `normalizeArchitectureInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope. Actions include flattening deep crawl hierarchies, adding internal links to orphaned pages, improving URL structure, and creating hub pages for content clusters.

### Integration Boundary

Checks for a registered adapter at `site_architecture` key via `getModuleAdapter()`. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.site_architecture_records`. Factory: `createPostgresSiteArchitectureRepository(query)`.

---

## Module 17: Analytics Integration

### Module Name

Analytics Integration

### Backend Purpose

Ingest Google Search Console search analytics and GA4 page metrics, correlate performance data with SEO signals across modules, and produce data-backed performance insights. This module bridges raw analytics data into the insight-and-action pipeline.

### Activation State

`defaultActive: true`, `initialState: "backend_active"`

### Input Contract

Expects `gsc` (`{ searchAnalytics: [] }`) and/or `ga4` (`{ pageMetrics: [] }`). Normalizer: `normalizeAnalyticsInput()` in `analysis.js`. Has direct-input detection: `gsc.searchAnalytics.length > 0 || ga4.pageMetrics.length > 0`.

### Output Contract

Returns standard flow envelope. Actions include traffic recovery recommendations, click-through-rate improvement actions for high-impression / low-CTR queries, and page performance improvement priorities.

### Integration Boundary

Checks for a registered adapter at `analytics_integration` key via `getModuleAdapter()`. Designed to accept GSC and GA4 data via adapter normalization. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.analytics_integration_records`. Factory: `createPostgresAnalyticsIntegrationRepository(query)`.

---

## Module 18: Local SEO

### Module Name

Local SEO

### Backend Purpose

Analyze local citation consistency, Google Business Profile completeness, and geo-specific rank factors for businesses with physical locations or service areas. Produces local visibility insights and citation / profile improvement actions. This module is opt-in only and does not run in default orchestration.

### Activation State

`defaultActive: false`, `initialState: "backend_active"`. Present in `BUILT_BUT_INACTIVE_MODULES`. Must be activated via `resolveActivationState(overrides, { allowInactiveActivation: true })`.

### Input Contract

Expects `businessName` (string), `citations` (array of citation objects), and/or `localKeywords` (array of geo-targeted keyword strings). Normalizer: `normalizeLocalSeoInput()` in `analysis.js`.

### Output Contract

Returns standard flow envelope. Actions include NAP consistency fixes, Google Business Profile optimization recommendations, local schema markup implementation, and local link building targets.

### Integration Boundary

Checks for a registered adapter at `local_seo` key via `getModuleAdapter()`. Designed to accept GMB API and citation-provider data via adapter normalization. Falls back gracefully to direct input if no adapter is connected.

### Persistence

Records table: `app_public.local_seo_records`. Factory: `createPostgresLocalSeoRepository(query)`.
