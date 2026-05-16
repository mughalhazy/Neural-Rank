# Backend Integration Boundaries

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER BUILD SPEC.md](</D:/Neural Rank/MASTER BUILD SPEC.md>)
- [docs/backend/BACKEND_MASTER_SPEC.md](</D:/Neural Rank/docs/backend/BACKEND_MASTER_SPEC.md>)

This document defines clean backend integration boundaries so external providers and future data sources can be added later without structural rewrite.

## Integration Boundary Principles

Backend integration design must follow these principles:

- internal backend module logic remains explicit and bounded
- integration concerns remain separate from module business logic
- provider-specific behavior is isolated from core backend logic
- integrations must not collapse module boundaries
- integrations must not redefine the approved backend stack
- integration growth later must not require structural rewrite of the backend architecture
- incomplete integrations must be represented honestly and not misrepresented as active completed capability

## Integration Catalog — All 18 Boundaries

The table below reflects the current state of `backend/src/integrations/catalog.js`. Five boundaries have concrete adapter implementations. The remaining thirteen are defined boundary stubs (adapter object exists in the registry, no live API calls).

| module_key | Provider / Adapter Name | isImplemented | Adapter File |
|---|---|---|---|
| `review_analysis` | `reviewAnalysisAdapterBoundary` | false | boundary stub only |
| `content_listing_insights` | `contentListingInsightsAdapterBoundary` | false | boundary stub only |
| `keyword_analysis` | `keywordAnalysisAdapterBoundary` | false | boundary stub only |
| `rank_tracking` | `googleSearchConsoleAdapter` | **true** | `adapters/google-search-console.js` |
| `competitor_analysis` | `competitorAnalysisAdapterBoundary` | false | boundary stub only |
| `optimization_layer` | `optimizationLayerAdapterBoundary` | false | boundary stub only |
| `creative_messaging_layer` | `creativeMessagingLayerAdapterBoundary` | false | boundary stub only |
| `unified_workflow_layer` | `unifiedWorkflowLayerAdapterBoundary` | false | boundary stub only |
| `technical_seo_audit` | `pageSpeedInsightsAdapter` | **true** | `adapters/pagespeed-insights.js` |
| `on_page_seo_scorer` | `onPageSeoScorerAdapterBoundary` | false | boundary stub only |
| `backlink_intelligence` | `backlinkProviderAdapter` | **true** | `adapters/backlink-provider.js` |
| `eeat_signals` | `eeatSignalsAdapterBoundary` | false | boundary stub only |
| `search_intent_classifier` | `searchIntentClassifierAdapterBoundary` | false | boundary stub only |
| `serp_feature_analyzer` | `serpProviderAdapter` | **true** | `adapters/serp-provider.js` |
| `topical_authority` | `topicalAuthorityAdapterBoundary` | false | boundary stub only |
| `site_architecture` | `siteArchitectureAdapterBoundary` | false | boundary stub only |
| `analytics_integration` | `googleAnalytics4Adapter` | **true** | `adapters/google-analytics-4.js` |
| `local_seo` | `localSeoAdapterBoundary` | false | boundary stub only |

All 18 boundaries support collection (`supportsCollection: true`) except `unified_workflow_layer` which is `false`.

## Implemented Adapters — Detail

### 1. Google Search Console Adapter

**File:** `backend/src/integrations/adapters/google-search-console.js`
**API wrapped:** Google Search Console API v3 (`searchconsole.googleapis.com`)
**Consumes module:** `rank_tracking`

**What it fetches:**
- `fetchSearchAnalytics` — POSTs to `/webmasters/v3/sites/{site}/searchAnalytics/query` returning rows of query, page, clicks, impressions, CTR, and average position for the last 90 days (default), up to 25,000 rows.
- `fetchIndexCoverage` — GETs `/webmasters/v3/sites/{site}/sitemaps` returning submitted sitemap counts and paths as a proxy for index coverage state.

**Exported collect paths:**
- `collect(context, request)` — returns `normalizedPayload.gscData` with `searchAnalytics`, `indexCoverage`, `crawlErrors`, and `coreWebVitals` keys.
- `collectForRankTracking(context, request)` — a narrower path that fetches 200 rows and maps them directly to `rankEntries` objects (rankId, keyword, currentPosition, clicks, impressions, ctr, rankingUrl).
- `normalizeInput(context, request)` — thin wrapper over `collect`.

**Credentials:** resolved from `context.gscCredentials`, `context.credentials.googleSearchConsole`, or environment variables `GSC_ACCESS_TOKEN` / `GSC_SITE_URL`.

---

### 2. Google Analytics 4 Adapter

**File:** `backend/src/integrations/adapters/google-analytics-4.js`
**API wrapped:** GA4 Data API v1 beta (`analyticsdata.googleapis.com`)
**Consumes module:** `analytics_integration`

**What it fetches:**
- `fetchOrganicLandingPages` — POSTs to `/v1beta/properties/{propertyId}:runReport` for two date ranges (current 90 days and prior 90 days). Filters to `Organic Search` channel group. Returns per-URL organic sessions, prior-period organic sessions, conversions, and bounce rate. Also aggregates total organic sessions.

**Exported collect paths:**
- `collect(context, request)` — returns `normalizedPayload.ga4Data` with `pageMetrics` (array) and `totalOrganicSessions`.
- `normalizeInput(context, request)` — thin wrapper.

**Credentials:** resolved from `context.ga4Credentials`, `context.credentials.googleAnalytics4`, or environment variables `GA4_ACCESS_TOKEN` / `GA4_PROPERTY_ID`.

---

### 3. PageSpeed Insights Adapter

**File:** `backend/src/integrations/adapters/pagespeed-insights.js`
**API wrapped:** PageSpeed Insights API v5 (`www.googleapis.com/pagespeedonline/v5`)
**Consumes module:** `technical_seo_audit`

**What it fetches:**
- `fetchPageSpeed(apiKey, url, strategy)` — GETs the PSI endpoint for a given URL and strategy (mobile or desktop). Extracts from the Lighthouse result: performance, accessibility, SEO, and best-practices category scores; CWV metrics (LCP, CLS, INP, FID, TTFB, TBT, SI, FCP) with status classifications (good / needs_improvement / poor); and up to 20 lowest-scoring failed audits.

**Exported collect paths:**
- `collect(context, request)` — runs both mobile and desktop strategies in parallel (configurable via `request.strategies`). Returns `normalizedPayload.pageSpeedData` with top-level CWV from the mobile strategy and a `byStrategy` breakdown.
- `normalizeInput(context, request)` — thin wrapper.

**Credentials:** API key resolved from `context.pageSpeedApiKey`, `context.credentials.pageSpeed.apiKey`, or `PAGESPEED_API_KEY` env var. The API key is optional — PSI works without it at rate-limited quota.

---

### 4. Backlink Provider Adapter

**File:** `backend/src/integrations/adapters/backlink-provider.js`
**API wrapped:** Ahrefs API v3, Semrush API, or Moz JSON-RPC API (provider-switchable)
**Consumes module:** `backlink_intelligence`

**What it fetches:**
- For each supported provider (ahrefs, semrush, moz): fetches up to 1,000 backlinks (source URL, domain, target URL, anchor, domain authority, dofollow flag, first/last seen, spam score) and up to 200 referring domains (domain, authority, backlink count, dofollow count).
- `fetchCompetitorBacklinks(provider, apiKey, competitors)` — fetches referring domains for up to 3 competitors and de-duplicates them into a flat list for link-gap analysis.

**Exported collect paths:**
- `collect(context, request)` — returns `normalizedPayload` with `domain`, `backlinks`, `referringDomains`, and `competitorBacklinks`.
- `normalizeInput(context, request)` — thin wrapper.

**Credentials:** provider name resolved from `context.backlinkCredentials.provider` or `BACKLINK_PROVIDER` env var. API key from `context.backlinkCredentials.apiKey` or `BACKLINK_API_KEY`. Target domain from `context.targetDomain` or `BACKLINK_TARGET`. Supported providers: `ahrefs`, `semrush`, `moz`.

---

### 5. SERP Provider Adapter

**File:** `backend/src/integrations/adapters/serp-provider.js`
**API wrapped:** SerpApi (`serpapi.com`) or DataForSEO (`api.dataforseo.com`) (provider-switchable)
**Consumes module:** `serp_feature_analyzer`

**What it fetches:**
- For each keyword: detects which SERP features are present (from a known set of 18 feature types: featured_snippet, local_pack, image_pack, sitelinks, knowledge_panel, people_also_ask, video_carousel, top_stories, shopping_results, answer_box, tweet_box, site_links_search_box, reviews, recipes, jobs, flights, events).
- Returns normalized organic result positions (url, title, display URL, sitelinks flag).
- SerpApi processes one keyword per request; DataForSEO batches up to 10 keywords per request.

**Exported collect paths:**
- `collect(context, request)` — requires `request.keywords` or `context.keywords`. Returns `normalizedPayload.serpEntries`, an array of per-keyword objects each containing `features`, `organicResults`, `totalResults`, and `searchMetadata`.
- `normalizeInput(context, request)` — thin wrapper.

**Credentials:** provider resolved from `context.serpCredentials.provider` or `SERP_PROVIDER` env var. API key from `context.serpCredentials.apiKey` or `SERP_API_KEY`. Supported providers: `serpapi`, `dataforseo`.

---

## Provider/Adapter Boundary Concept

At an architectural level, external-source interaction should be separated from internal module logic through a provider/adapter boundary.

Conceptually, this means:

- backend modules define internal responsibilities in module terms
- provider/adapter boundaries handle source-specific interaction concerns
- module logic consumes normalized backend-relevant inputs rather than depending directly on provider-specific behavior
- external-source specifics stay outside core module logic as much as possible

This is a boundary concept only. It does not prescribe a specific framework, package, class pattern, or implementation style.

## Rules For Incomplete Integrations

When an integration is incomplete:

- it must not be represented as a complete active backend capability
- it must not be used to fake module completeness
- it must not distort the defined MVP-active and built-but-inactive boundaries
- backend architecture may remain ready for the integration without claiming that the integration is operational

Incomplete integration state must remain honest at the architecture level:

- module boundaries can exist before all external-source connections are complete
- persistence and orchestration structure can exist before all external-source connections are complete
- default active behavior must not depend on pretending incomplete integrations are finished

## Separation Of Internal Logic From External Source Dependencies

Internal backend logic must remain separate from external source dependencies.

That means:

- module responsibilities remain defined by product scope, not by provider specifics
- analysis logic should not be tightly coupled to one external-source shape
- insight generation and prioritized action generation should remain module-owned backend responsibilities
- changes in external-source details later should not require redefining the internal module structure

External-source interaction may supply inputs into the backend flow, but it must not become the definition of the module itself.

## Module Relationship To External Integrations

Each module may depend on external-source inputs where relevant, but module ownership remains internal.

### Review Analysis

- may receive review-related external inputs where relevant
- retains internal ownership of review analysis, insight generation, and prioritized action outputs

### Content / Listing Insights

- may receive website/app listing-related external inputs where relevant
- retains internal ownership of content/listing analysis, insight generation, and prioritized action outputs

### Keyword Analysis

- may receive keyword-related external inputs where relevant
- retains internal ownership of keyword opportunity analysis, insight generation, and prioritized action outputs

### Rank Tracking

- may receive rank-related external inputs where relevant
- retains internal ownership of ranking analysis, insight generation, and prioritized action outputs

### Competitor Analysis

- may receive competitor-related external inputs where relevant
- retains internal ownership of competitor comparison, insight generation, and prioritized action outputs

### Optimization Layer

- may consume internal module outputs and externally derived inputs where relevant
- retains internal ownership of optimization guidance and prioritized action outputs

### Creative / Messaging Layer

- may receive creative/messaging-relevant external inputs where relevant
- retains internal ownership of creative/messaging analysis, suggestion generation, and prioritized action outputs

### Unified Workflow Layer

- may consume outputs that ultimately originated from integrated external-source inputs
- retains internal ownership of workflow-level coordination and planning
- must not become a provider-specific integration layer that bypasses module ownership

## Future Expansion Considerations

Future external providers or future data sources may be added later, but expansion must preserve:

- explicit module boundaries
- internal backend ownership of analysis, insight, priority, and action logic
- Postgres as source of truth for structured product state
- activation boundaries already defined in the backend architecture
- the mandatory flow `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

Future expansion should be able to:

- introduce additional external-source connections where relevant to existing module scope
- keep integration-specific concerns outside the core module architecture
- avoid rewriting module definitions when new source connections are added later

Future expansion must not:

- invent new product modules through integration growth alone
- collapse module architecture into one generic integration layer
- redefine inactive modules as active without following the activation model

## Non-Goals

This document does not define:

- specific external providers beyond those already implemented
- provider contracts not yet agreed
- concrete SDK choices
- frontend integration behavior
- UI integration behavior
- new backend modules
