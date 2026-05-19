# Backend Domain Service Routes

Anchors:

- [BACKEND_MASTER_SPEC.md](../reference/BACKEND_MASTER_SPEC.md)
- [BACKEND_MODULE_BOUNDARIES.md](../reference/BACKEND_MODULE_BOUNDARIES.md)
- `backend/src/server.js`
- `backend/src/domains/`

This document describes the four domain services and their current HTTP route exposure. All four were initially deployed without direct HTTP routes (documented as "routeless" in the original decision). Direct routes were added on 2026-05-15 once identity and authentication infrastructure matured. The original "routeless" rationale is preserved below for historical context.

---

## Current HTTP Route Inventory (server.js)

All 26 routes are versioned under `/v1/`. Legacy unversioned paths redirect 301 with `Deprecation: true`.

| Method | Path | Description |
|---|---|---|
| GET | `/v1/health` | Backend health, module activation state |
| GET | `/v1/ready` | Readiness check |
| GET | `/v1/modules` | Module catalog listing |
| POST | `/v1/run/default` | Run all default-active modules |
| POST | `/v1/run/activation-aware` | Run with activation overrides |
| POST | `/v1/modules/:moduleKey/run` | Run a single module by key |
| GET | `/v1/execution/recommendations` | List recommendations |
| POST | `/v1/execution/recommendations` | Create recommendation |
| PATCH | `/v1/execution/recommendations/:id/status` | Update recommendation status |
| POST | `/v1/execution/recommendations/:id/tasks` | Create task from recommendation |
| GET | `/v1/execution/tasks` | List tasks |
| GET | `/v1/execution/tasks/:id` | Get task by ID |
| PATCH | `/v1/execution/tasks/:id/status` | Update task status |
| GET | `/v1/execution/tasks/:id/history` | Get task status history |
| GET | `/v1/execution/audit-logs` | List audit log entries |
| GET | `/v1/measurement/metrics` | Metric source registry |
| POST | `/v1/measurement/snapshots` | Record baseline / post-change snapshot |
| POST | `/v1/measurement/attributions` | Record attribution link |
| GET | `/v1/measurement/attributions/:id` | Measurement summary by attribution ID |
| POST | `/v1/technical-operations/audit` | Source HTML technical SEO audit |
| POST | `/v1/search-intelligence/classify` | Intent classification |
| POST | `/v1/search-intelligence/analyze` | Full SERP query analysis |
| GET | `/v1/business-intelligence/profiles` | List business profiles |
| POST | `/v1/business-intelligence/profiles` | Create business profile |
| GET | `/v1/openapi.json` | OpenAPI 3.1 spec |
| GET | `/v1/docs` | Swagger UI |

---

## Domain Services With HTTP Routes

### 1. Measurement Service

**Location:** `backend/src/domains/measurement/service.js`
**Contract key:** `measurementService`
**Domain key:** `measurement`

**Current HTTP routes:**

| Method | Path | Handler |
|---|---|---|
| `GET` | `/v1/measurement/metrics` | `handleMeasurementMetrics` |
| `POST` | `/v1/measurement/snapshots` | `handleMeasurementSnapshots` |
| `POST` | `/v1/measurement/attributions` | `handleMeasurementAttributions` |
| `GET` | `/v1/measurement/attributions/:id` | `handleMeasurementAttributions` |

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

**Repository:** Falls back to an in-memory repository if no Postgres query function is in context.

---

### 2. Technical Operations Service

**Location:** `backend/src/domains/technical-operations/service.js`
**Contract key:** `technicalOperationsService`
**Domain key:** `technical_operations`

**Current HTTP routes:**

| Method | Path | Handler |
|---|---|---|
| `POST` | `/v1/technical-operations/audit` | `handleTechnicalOperationsAudit` |

**What it does:** Owns source HTML technical SEO analysis contracts. Runs a set of source HTML analyzers against provided HTML input, classifies findings by severity, and returns structured findings with severity, evidence, recommended action, governance risk, and confidence.

**Public methods (from `createTechnicalOperationsService()`):**

| Method | Signature | Description |
|---|---|---|
| `auditSourceHtml` | `(input)` | Runs `runSourceHtmlAnalyzers(input)` against the provided HTML; summarizes findings by severity count; returns findings plus rendered DOM placeholder. |
| `auditTechnicalSeo` | `(input)` | Alias for `auditSourceHtml` — provided for semantic clarity at call sites. |

---

### 3. Search Intelligence Service

**Location:** `backend/src/domains/search-intelligence/service.js`
**Contract key:** `searchIntelligenceService`
**Domain key:** `search_intelligence`

**Current HTTP routes:**

| Method | Path | Handler |
|---|---|---|
| `POST` | `/v1/search-intelligence/classify` | `handleSearchIntelligenceClassify` |
| `POST` | `/v1/search-intelligence/analyze` | `handleSearchIntelligenceAnalyze` |

**What it does:** Coordinates keyword analysis, rank tracking, and competitor analysis intelligence through a unified provider-based query interface. Classifies search query intent, fetches SERP data via a pluggable provider interface, computes opportunity scores, and models SERP volatility.

**Public methods (from `createSearchIntelligenceService()`):**

| Method | Signature | Description |
|---|---|---|
| `classifyIntent` | `(input)` | Creates a query record and classifies its intent, returning `{ query, intent }`. |
| `analyzeQuery` | `(input, context)` | Full query analysis: classifies intent, fetches SERP data, detects SERP features and competitor results, computes opportunity score (0–100), derives volatility. Returns `{ contract, query, intent, serp, competitorResults, opportunity, volatility, providerStatus }`. |

**Compatibility adapters:** `keyword_analysis`, `rank_tracking`, `competitor_analysis`.

---

### 4. Business Intelligence Service

**Location:** `backend/src/domains/business-intelligence/service.js`
**Contract key:** `businessIntelligenceService`
**Domain key:** `business_intelligence`

**Current HTTP routes:**

| Method | Path | Handler |
|---|---|---|
| `GET` | `/v1/business-intelligence/profiles` | `handleBusinessIntelligenceProfiles` |
| `POST` | `/v1/business-intelligence/profiles` | `handleBusinessIntelligenceProfiles` |

**What it does:** Owns manual-input business objective contracts. Stores business profiles containing target page value, funnel stage, lead/revenue relevance, and content ROI scores. Provides a priority extension method that enriches recommendation scoring with business value evidence.

**Public methods (from `createBusinessIntelligenceService()`):**

| Method | Signature | Description |
|---|---|---|
| `createBusinessProfile` | `(input, context)` | Creates and persists a business profile record. |
| `listBusinessProfiles` | `(context)` | Returns all business profiles from the repository. |
| `extendPriorityWithBusinessValue` | `(priorityInput, businessProfile)` | Merges available business value fields from a profile into a priority scoring input. Returns `null` business value if no evidence-backed value is present. |

**Repository:** Falls back to an in-memory repository if no Postgres query function is in context.

---

## Historical Decision Record: Originally Routeless Domain Services

**Original decision (pre-2026-05-15):** The four domain services above were intentionally routeless — accessible only via internal orchestration.

**Original rationale:**
1. All four were fully implemented and callable internally. Lack of HTTP routes did not indicate incomplete implementation.
2. Each service had a specific reason for deferral: credential injection strategies (search intelligence), user identity scoping (business intelligence, measurement), or interface boundary decisions (technical operations).
3. Exposing them prematurely without addressing these dependencies would create routes that either did not work in production or created security surface without proper guarding.

**Route addition (2026-05-15):** Direct routes were added once the `resolveRequestIdentity` / `requireIdentity` infrastructure matured and the frontend integration layer required direct domain service access. See CHANGELOG.md entry for 2026-05-15 for the full list of routes added.

**Current status:** All four domain services have dedicated HTTP routes. The original "routeless" classification no longer applies.
