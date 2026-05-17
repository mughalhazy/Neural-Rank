# Backend Domain Service Routes

Anchors:

- [BACKEND_MASTER_SPEC.md](../reference/BACKEND_MASTER_SPEC.md)
- [BACKEND_MODULE_BOUNDARIES.md](../reference/BACKEND_MODULE_BOUNDARIES.md)
- `backend/src/server.js`
- `backend/src/domains/`

This document records the four domain services that are fully implemented in the backend but have no HTTP routes exposed through `server.js`. It documents what each service does, its public methods, and the explicit decision that these services are intentionally routeless at this stage — accessed internally by orchestration only. Exposing them via HTTP is flagged as planned P1 work.

---

## Current HTTP Route Inventory (server.js)

For reference, these are the routes that currently exist:

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Backend health, module activation state |
| GET | `/ready` | Readiness check |
| GET | `/modules` | Module catalog listing |
| POST | `/run/default` | Run all default-active modules |
| POST | `/run/activation-aware` | Run with activation overrides |
| POST | `/modules/:moduleKey/run` | Run a single module by key |
| GET | `/execution/recommendations` | List recommendations |
| POST | `/execution/recommendations` | Create recommendation |
| PATCH | `/execution/recommendations/:id/status` | Update recommendation status |
| POST | `/execution/recommendations/:id/tasks` | Create task from recommendation |
| GET | `/execution/tasks` | List tasks |
| GET | `/execution/tasks/:id` | Get task by ID |
| PATCH | `/execution/tasks/:id/status` | Update task status |
| GET | `/execution/tasks/:id/history` | Get task status history |
| GET | `/execution/audit-logs` | List audit log entries |

The four domain services below are not represented in this list.

---

## Domain Services Without HTTP Routes

### 1. Measurement Service

**Location:** `backend/src/domains/measurement/service.js`
**Contract key:** `measurementService`
**Domain key:** `measurement`

**What it does:** Owns baseline and post-change metric snapshot contracts, metric source registry management, and attribution link records. Its core purpose is to separate observed metric movement from confirmed causal impact — a change can be attributed to a recommendation or task without claiming confirmed impact until evidence supports that classification.

**Public methods (from `createMeasurementService()`):**

| Method | Signature | Description |
|---|---|---|
| `listMetricSources` | `(context)` | Returns all registered metric sources, upserting the static registry into the repository if not already present. |
| `ensureMetricSources` | `(context)` | Same as `listMetricSources` — idempotent upsert of the metric source catalog. |
| `recordBaselineSnapshot` | `(input, context)` | Validates `metricId` against the registry, creates and persists a baseline snapshot record. |
| `recordPostChangeSnapshot` | `(input, context)` | Validates `metricId`, creates and persists a post-change snapshot record. |
| `recordAttributionLink` | `(input, context)` | Creates an attribution record linking a metric, snapshots, and an impact classification (`unknown`, `observed_correlation`, `confirmed_impact`). |
| `getMeasurementSummary` | `(attributionId, context)` | Fetches an attribution record plus its related snapshots and metric source, returns a built measurement summary object. |

**Repository:** Falls back to an in-memory repository if no Postgres query function is in context. A `createPostgresMeasurementRepository` is also available for production use.

**Why no HTTP route yet:** The measurement service is consumed internally by the execution domain and by orchestration flows that track recommendation outcomes. Exposing it via HTTP requires designing authentication and scoping rules for snapshot creation (a POST endpoint for baseline snapshots could be misused without proper guarding). This is deferred until the recommendation-outcome tracking flow is productized.

**Planned future route shape:**
```
GET  /measurement/metric-sources
POST /measurement/snapshots/baseline
POST /measurement/snapshots/post-change
POST /measurement/attributions
GET  /measurement/attributions/:attributionId/summary
```

---

### 2. Technical Operations Service

**Location:** `backend/src/domains/technical-operations/service.js`
**Contract key:** `technicalOperationsService`
**Domain key:** `technical_operations`

**What it does:** Owns source HTML technical SEO analysis contracts. Runs a set of source HTML analyzers against provided HTML input, classifies findings by severity, and returns structured findings with severity, evidence, recommended action, governance risk, and confidence. Deliberately keeps source HTML analysis separate from rendered DOM analysis (rendered DOM is represented as a placeholder pending future headless browser integration).

**Public methods (from `createTechnicalOperationsService()`):**

| Method | Signature | Description |
|---|---|---|
| `auditSourceHtml` | `(input)` | Runs `runSourceHtmlAnalyzers(input)` against the provided HTML, summarizes findings by severity count (total, critical, high, medium, low), and returns findings plus a rendered DOM placeholder. |
| `auditTechnicalSeo` | `(input)` | Alias for `auditSourceHtml` — provided for semantic clarity at call sites. |

**Why no HTTP route yet:** The technical-operations domain is consumed internally by the `technical_seo_audit` module, which calls it as part of the module's analysis phase. Exposing it directly via HTTP creates a question about whether callers should go through the module (which persists results and applies the full `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION` flow) or through the domain service (which returns raw findings only). That interface boundary decision is deferred to P1.

**Planned future route shape:**
```
POST /domains/technical-operations/audit/source-html
```

---

### 3. Search Intelligence Service

**Location:** `backend/src/domains/search-intelligence/service.js`
**Contract key:** `searchIntelligenceService`
**Domain key:** `search_intelligence`

**What it does:** Coordinates keyword analysis, rank tracking, and competitor analysis intelligence through a unified provider-based query interface. Classifies search query intent, fetches SERP data via a pluggable provider interface, computes opportunity scores, and models SERP volatility. Provides compatibility adapters for three legacy module keys: `keyword_analysis`, `rank_tracking`, `competitor_analysis`.

**Public methods (from `createSearchIntelligenceService()`):**

| Method | Signature | Description |
|---|---|---|
| `classifyIntent` | `(input)` | Creates a query record and classifies its intent, returning `{ query, intent }`. |
| `analyzeQuery` | `(input, context)` | Full query analysis: classifies intent, fetches SERP data from the resolved provider, detects SERP features and competitor results, computes an opportunity score (0–100), and models volatility status. Returns `{ contract, query, intent, serp, competitorResults, opportunity, volatility, providerStatus }`. |

**Compatibility adapters:** `keyword_analysis`, `rank_tracking`, `competitor_analysis` — these adapters allow the domain service to be invoked from orchestration flows that reference legacy module keys.

**Why no HTTP route yet:** The search intelligence domain has the most complex dependency surface of the four routeless services. It requires a configured SERP provider in context to return live data, and its `analyzeQuery` method is designed for orchestration-internal use where context already carries provider credentials. Exposing it via HTTP requires a separate auth-aware credential injection strategy for the SERP provider. Deferred to P1.

**Planned future route shape:**
```
POST /domains/search-intelligence/classify-intent
POST /domains/search-intelligence/analyze-query
```

---

### 4. Business Intelligence Service

**Location:** `backend/src/domains/business-intelligence/service.js`
**Contract key:** `businessIntelligenceService`
**Domain key:** `business_intelligence`

**What it does:** Owns manual-input business objective contracts. Stores business profiles containing target page value, funnel stage, lead/revenue relevance, and content ROI scores. Provides a priority extension method that enriches recommendation scoring with business value evidence — but only when evidence-backed business values exist. Unknown business values remain as `null` rather than being invented.

**Public methods (from `createBusinessIntelligenceService()`):**

| Method | Signature | Description |
|---|---|---|
| `createBusinessProfile` | `(input, context)` | Creates and persists a business profile record (target URL, funnel stage, value scores, etc.). |
| `listBusinessProfiles` | `(context)` | Returns all business profiles from the repository. |
| `extendPriorityWithBusinessValue` | `(priorityInput, businessProfile)` | Merges available business value fields from a profile into a priority scoring input, creating a `businessPriorityExtension`. Returns `null` business value if no evidence-backed value is present. |

**Repository:** Falls back to an in-memory repository if no Postgres query function is in context.

**Why no HTTP route yet:** Business profile creation is a user-driven manual input flow that belongs in a frontend-facing API layer with proper user identity scoping. The in-memory fallback used in current orchestration is adequate while the frontend is being built. A production route requires user/workspace identity binding that is not yet wired into the server. Deferred to P1.

**Planned future route shape:**
```
GET  /domains/business-intelligence/profiles
POST /domains/business-intelligence/profiles
```

---

## Decision Record: Routeless Domain Services

**Decision:** The four domain services above are intentionally routeless at this stage.

**Rationale:**
1. All four are fully implemented and callable internally. Lack of HTTP routes does not indicate incomplete implementation.
2. Each service has a specific reason for deferral that involves a dependency outside the current backend scope: credential injection strategies (search intelligence), user identity scoping (business intelligence, measurement), or interface boundary decisions (technical operations).
3. Exposing them prematurely as HTTP routes without addressing these dependencies would create routes that either do not work in production or create security surface without proper guarding.
4. The execution domain (recommendations, tasks, audit logs) was prioritized first because it has a clearer, self-contained auth surface that the existing `extractRequestIdentity` / `requireMutationIdentity` infrastructure already covers.

**Status:** Flagged as planned P1 work to expose these four services via HTTP routes as the frontend integration layer matures and credential/identity infrastructure is extended.

**Owner:** Backend architecture — no action required from module owners or integration adapters.
