# Backend Core Utilities

Anchors:

- [BACKEND_MASTER_SPEC.md](BACKEND_MASTER_SPEC.md)
- [BACKEND_MODULE_BOUNDARIES.md](BACKEND_MODULE_BOUNDARIES.md)

This document catalogs the fourteen core utility modules in `backend/src/core/`. These files are shared infrastructure consumed by modules, domains, orchestration, and persistence layers. They do not contain business logic specific to any one module.

---

## 1. runtimeContext.js

**File:** `backend/src/core/runtimeContext.js`

**Purpose:** Builds the per-module execution context object passed into each module's `run` call during orchestration. Normalizes alias resolution so module keys and camelCase context keys both resolve to the same value.

**Key exports:**

- `buildModuleContext({ moduleKey, baseContext, activationState, defaultActivationState, moduleResults, integrations, repositories })` — assembles the context object passed to each module service. Merges base context, activation state, and prior module results. Exposes integration adapters and repositories under both snake_case module-key aliases and camelCase aliases so modules can access them by either naming convention.
- `moduleKeyToContextKey(moduleKey)` — converts a snake_case module key (e.g. `rank_tracking`) to a camelCase context key (e.g. `rankTracking`). Used internally by alias resolution.

**Consumed by:** `orchestration/defaultMvpOrchestrator.js`, `orchestration/activationAwareOrchestrator.js` — both orchestrators call `buildModuleContext` before invoking each module service.

**Design decision:** Dual-key alias maps (`integrations` and `providerAdapters` are the same object; `repositories` similarly aliased) allow module code to be written with either the original snake_case key or the camelCase context key without requiring the orchestrator to know which convention each module uses.

---

## 2. createProviderAdapter.js

**File:** `backend/src/core/createProviderAdapter.js`

**Purpose:** Factory for integration boundary stub objects. When a boundary is defined in the catalog but no concrete adapter file is bound, this factory produces a safe placeholder that returns honest `integration_not_connected` or `integration_incomplete` status instead of throwing or silently failing.

**Key exports:**

- `createProviderAdapter(config)` — accepts a `{ moduleKey, adapterName, supportsCollection, isImplemented, metadata }` config and returns an adapter object with `collect()` and `normalizeInput()` methods. If `supportsCollection` is false, `collect()` returns `integration_not_connected`. If `isImplemented` is false, `collect()` returns `integration_incomplete`. Both statuses carry the adapter name for diagnosis.
- `createIntegrationNotConnectedResult(moduleKey, reason, metadata)` — helper that creates a standard `{ status: "integration_not_connected", moduleKey, reason, metadata }` shape.
- `createIntegrationIncompleteResult(moduleKey, reason, metadata)` — helper that creates a standard `{ status: "integration_incomplete", moduleKey, reason, metadata }` shape.

**Consumed by:** `integrations/registry.js` — used to wrap catalog entries that have `isImplemented: false` so the registry can return a uniform adapter interface for all 18 boundaries.

**Design decision:** All 18 integration boundaries are present in the registry regardless of implementation state. Modules can call `adapter.collect()` on any boundary and receive a typed status result rather than a null or error. This preserves the invariant that incomplete integrations are surfaced explicitly.

---

## 3. seoScorer.js

**File:** `backend/src/core/seoScorer.js`

**Purpose:** Shared SEO scoring primitives for CTR modeling, content depth classification, readability assessment, and keyword density calculation. Provides deterministic, pure functions used across multiple content- and keyword-oriented modules.

**Key exports:**

- `expectedCtrByPosition(position)` — returns expected CTR from a position-to-CTR lookup table (positions 1–20). Position 1 maps to 0.28, position 10 to 0.02, beyond 20 returns 0.
- `ctrEfficiencyScore(actualCtr, position)` — ratio of actual CTR to expected CTR at a given position. A score above 1.0 means the page out-performs the position benchmark.
- `ctrOpportunityLift(actualCtr, position, impressions)` — estimated additional clicks available if CTR improved to the position benchmark. Calculated as `(expectedCtr - actualCtr) * impressions`.
- `contentDepthTier(wordCount)` — classifies content as `authoritative` (3000+ words), `comprehensive` (1500+), `moderate` (800+), `thin` (400+), or `very_thin`.
- `readabilityTier(avgSentenceLength)` — classifies as `accessible` (≤15 words/sentence), `moderate` (≤22), or `complex`.
- `estimateAvgSentenceLength(text)` — splits text on sentence-ending punctuation and returns average word count per sentence.
- `keywordDensity(text, keyword)` — returns keyword occurrence as a percentage of total words (× 10 for one decimal place representation).
- `normalizeScore(value, min, max)` — scales a value to 0–100 within a range.

**Constants exported:** `POSITION_CTR_MAP`, `CONTENT_DEPTH_THRESHOLDS`, `READABILITY_THRESHOLDS`.

**Consumed by:** `modules/rank-tracking`, `modules/keyword-analysis`, `modules/on-page-seo-scorer`, `modules/content-listing-insights`, and other modules that need CTR or content-quality metrics.

---

## 4. domainAuthorityScorer.js

**File:** `backend/src/core/domainAuthorityScorer.js`

**Purpose:** Shared backlink and domain authority scoring primitives. Computes authority tiers, toxicity risk, anchor text distribution, and anchor diversity scores from normalized backlink arrays.

**Key exports:**

- `authorityTier(da)` — classifies domain authority score as `high` (≥60), `medium` (≥30), or `low`.
- `authorityGapSeverity(targetDA, competitorDA)` — returns `critical` (gap ≥30), `significant` (gap ≥15), or `manageable`.
- `computeAuthorityScore(backlinks)` — weighted average over a backlink array. High-authority links score 3×, medium 2×, low 1×. Returns 0–100.
- `computeToxicityRisk(backlinks)` — counts links with spam score above `TOXICITY_THRESHOLD` (40) and returns `{ toxicCount, toxicRatio, riskLevel, toxicLinks }`. Risk levels: `high` (>15% toxic), `medium` (>5%), `low`.
- `computeAnchorDistribution(backlinks)` — classifies anchors into `branded`, `exactMatch`, `partial`, `generic`, `naked` buckets. Generic anchors are matched against a fixed set (click here, read more, here, etc.).
- `anchorDiversityScore(anchorDistribution, total)` — returns 0–100 score penalising exact-match ratio above 30%.

**Constants exported:** `DA_TIERS`, `TOXICITY_THRESHOLD`.

**Consumed by:** `modules/backlink-intelligence`. Also available to `modules/competitor-analysis` and domain services that perform authority comparisons.

---

## 5. intentClassifier.js

**File:** `backend/src/core/intentClassifier.js`

**Purpose:** Keyword intent classification using signal-word matching. Classifies a keyword string into one of four intent categories and recommends appropriate content formats. Used by the search-intent-classifier module and the search-intelligence domain.

**Key exports:**

- `classifyIntent(keyword)` — tokenizes the keyword, scores it against intent signal lists for all four categories, picks the highest-scoring category as `primaryIntent`, and returns `{ primaryIntent, confidence, recommendedFormats, scores }`. Falls back to `informational` with confidence 0 for empty or invalid input.
- `batchClassifyIntents(keywords)` — maps `classifyIntent` over an array of keyword strings or `{ keyword }` objects. Returns one classification result per entry.
- `tokenize(keyword)` — splits on whitespace, hyphens, underscores, and slashes; lowercases. Exported for testing and re-use.

**Constants exported:** `INTENT_SIGNALS` (signal words per intent category), `CONTENT_FORMAT_MAP` (recommended content formats per category).

**Intent categories:** `informational`, `navigational`, `transactional`, `commercial`.

**Consumed by:** `modules/search-intent-classifier`, `domains/search-intelligence` (which has its own `intentClassifier.js` that wraps a similar but domain-specific implementation).

**Design decision:** Multi-word signals (e.g. "free trial", "pros cons") receive a score of 2 when matched in the joined token string, single-word signals score 1. This gives phrase signals appropriate weight without requiring a full NLP pipeline.

---

## 6. targeting.js

**File:** `backend/src/core/targeting.js`

**Purpose:** Normalizes incoming product target inputs (website URL, app store URL, app ID, etc.) into a canonical `productTarget` object with consistent field names and type inference. Used early in orchestration to establish the target reference that all modules and persistence calls use.

**Key exports:**

- `normalizeProductTarget(input)` — accepts a loose input object and returns `{ targetRef, targetType, websiteUrl, appId, appStoreUrl, playStoreUrl }`. `targetRef` is the best available canonical identifier. Falls back to `"unknown_target"` if nothing is present.
- `inferTargetType(input)` — returns `"app_target"` if any app-related field is present (`appUrl`, `appStoreUrl`, `playStoreUrl`, `appId`), otherwise returns `"product_target"`.
- `normalizeText(value)` — null/undefined-safe string trim. Used internally and exported for re-use.

**Consumed by:** `backend/src/index.js` (exported as `normalizeProductTarget` for orchestration entry points), `core/persistence.js` (which re-implements compatible logic internally for the persistence layer).

**Design decision:** `targetType` is inferred from field presence rather than requiring callers to set it explicitly. This keeps the orchestration entry points simple and avoids incorrect type assignments when callers omit the field.

---

## 7. domainContracts.js

**File:** `backend/src/core/domainContracts.js`

**Purpose:** Factory for frozen domain service contract objects. Provides a single, consistent way to declare a domain service's identity, compatibility modules, and responsibility list. Used by all four domain services.

**Key exports:**

- `createDomainServiceContract({ domainKey, displayName, serviceKey, compatibilityModules, responsibilities })` — returns a `Object.freeze`d contract descriptor. `compatibilityModules` is the list of legacy module keys the domain service bridges. `responsibilities` is a freeform array of strings describing the domain service's obligations.

**Consumed by:** `domains/measurement/contract.js`, `domains/technical-operations/contract.js`, `domains/search-intelligence/contract.js`, `domains/business-intelligence/contract.js`. Each domain service's contract file calls this factory and exports the result.

**Design decision:** The contract is frozen to prevent accidental mutation at runtime. The factory enforces a consistent shape so that domain service introspection (e.g. listing domain responsibilities) can rely on a predictable structure.

---

## 8. persistence.js

**File:** `backend/src/core/persistence.js`

**Purpose:** Provides the shared Postgres repository factory and query-function resolver used by all 18 module repositories. All module `saveRun` calls go through this layer.

**Key exports:**

- `createPostgresModuleRunRepository({ recordsTable, query })` — returns an object with a single method `saveRun(payload)`. The `saveRun` method upserts a row into `app_public.product_targets` (creating or updating the target by `target_kind` + `canonical_ref`) and then inserts a row into `app_public.{recordsTable}` with columns: `target_id`, `integration_state`, `input_payload`, `analysis_payload`, `insights_payload`, `priority_payload`, `actions_payload`, `processing_status`. All payload columns are stored as `jsonb`.
- `resolveQueryFunction(context)` — resolves a Postgres query function from `context.query`, `context.db.query`, or `context.pg.query`. Returns `null` if none are present, allowing modules to gracefully skip persistence.
- `resolveTargetKind(productTarget)` — maps a product target to `"app"` or `"website"` for storage.
- `resolveCanonicalRef(productTarget)` — extracts the best canonical reference string from a product target.

**Consumed by:** all 18 module repository files. Each module repository calls `createPostgresModuleRunRepository` with its specific `recordsTable` name.

**Design decision:** The `product_targets` upsert uses `on conflict (target_kind, canonical_ref) do update set updated_at = now()`. This means the same target is never duplicated; all module runs reference the same target row via foreign key. The module run table name is the only per-module variation — the entire persistence shape is uniform across all 18 modules.

---

## 9. recommendationScoring.js

**File:** `backend/src/core/recommendationScoring.js`

**Purpose:** Computes a multi-dimensional recommendation priority score (0–100) for any prioritized action output. Used by modules and domain services when generating prioritized action lists to ensure consistent scoring logic across the backend.

**Key exports:**

- `createRecommendationScore({ severity, trafficImpact, conversionImpact, implementationDifficulty, confidence, governanceRisk, businessValue, expectedEffort, reversibility, rationale, governanceResult })` — computes a weighted overall score from nine dimensions. Positive drivers: severity (23%), trafficImpact (18%), conversionImpact (18%), businessValue (16%), confidence (15%), reversibility (10%). Negative drivers: implementationDifficulty (10%), expectedEffort (8%), governanceRisk (12%). Missing dimensions are assumed at 50 (neutral) but each missing input reduces confidence by 5 points (capped at 30-point reduction). Returns `{ dimensions, overallScore, derivedPriority, rationale, missingInputs }`.
- `derivePriorityLabel(overallScore)` — maps a 0–100 score to `"high"` (≥70), `"medium"` (≥40), or `"low"`.
- `mapGovernanceClassificationToRisk(governanceResult)` — converts a governance classification string (`block`, `require_approval`, `warn`, `allow`) to a numeric risk value (100, 75, 40, 10) suitable for the `governanceRisk` dimension.

**Consumed by:** modules that produce prioritized action outputs. Also used by the execution and governance domains when scoring cross-module recommendations.

**Design decision:** A base offset of +15 is added to the raw score before clamping to 0–100. This ensures that recommendations with all inputs at moderate neutral values (50) score above 50, reflecting that a recommendation with no strong negative signals is net-positive by default. Missing inputs do not zero out a recommendation; they reduce confidence only.

---

## 10. dbUtils.js

**File:** `backend/src/core/dbUtils.js`

**Purpose:** Shared database utility helpers used by module repositories and domain services when interacting with Postgres. Extracts common operations that would otherwise be duplicated across all 18 module repositories.

**Key exports:**

- `clone(value)` — deep-clones a value using `structuredClone` (Node.js 17+) with a JSON round-trip fallback for older runtimes. Used before mutating query result objects.
- `normalizeRows(result)` — normalizes a Postgres query result to a plain array. Accepts either an array directly or a `{ rows: [...] }` result object; returns `[]` for null/undefined. Prevents `result.rows` access errors across different pg client response shapes.
- `upsertProductTarget(query, target)` — inserts or updates a row in `app_public.product_targets` using `on conflict (target_kind, canonical_ref) do update set updated_at = now()`. Returns the resolved `id` for use as a foreign key in module records tables. Delegates to `resolveTargetKind` and `resolveCanonicalRef` from `core/persistence.js`.

**Consumed by:** module repositories that need to upsert the product target before inserting their own records; domain services that read or transform query results.

---

## 11. errorReporter.js

**File:** `backend/src/core/errorReporter.js`

**Purpose:** Zero-dependency Sentry error reporter. Posts error events to the Sentry HTTP store API using `node:https` directly — no Sentry SDK is installed. Is a no-op when `SENTRY_DSN` is absent or unparseable.

**Key exports:**

- `reportError(error, context)` — fire-and-forget POST to `sentry.io/api/{projectId}/store/`. Parses `SENTRY_DSN` at module load time to extract `sentryPublicKey` and `sentryProjectId`. The event payload includes `event_id` (random UUID), `timestamp`, `platform: "node"`, stack frames (up to 7 lines), and optional `tags` / `extra` from the `context` argument. Network errors are silently swallowed — reporting failures must not crash the server.

**Configuration:** Set `SENTRY_DSN` environment variable to a valid Sentry DSN (e.g. `https://<key>@sentry.io/<projectId>`). Module is disabled if the env var is absent.

**Consumed by:** `server.js` (unhandled request errors) and orchestrators (module timeout or unexpected failures).

---

## 12. moduleInputRequirements.js

**File:** `backend/src/core/moduleInputRequirements.js`

**Purpose:** Declares the per-module required input field sets. Used by validation middleware to gate module execution: at least one field from a module's required set must be present in `moduleInput` for the run to proceed. Modules with no meaningful input constraints are marked `"none"`.

**Key exports:**

- `MODULE_INPUT_REQUIREMENTS` — a frozen map of `{ [moduleKey]: string[] }` covering all 18 modules. Each value is an array of acceptable input field names; a non-empty intersection with the incoming `moduleInput` object satisfies the requirement. Example entries: `review_analysis: ["appId", "websiteUrl"]`, `local_seo: ["websiteUrl", "domain", "location"]`.

**Consumed by:** `api/validation.js` (per-module run validation for `POST /v1/modules/:key/run`) and the orchestration entry points when validating batch inputs.

---

## 13. prioritization.js

**File:** `backend/src/core/prioritization.js`

**Purpose:** Shared priority ordering and deduplication primitives used by module services when building their `priority` and `action` output arrays. Provides deterministic, stable sorting so that equivalent recommendations from different modules are ordered consistently.

**Key exports:**

- `normalizePriority(priority)` — coerces any string to `"high"`, `"medium"`, or `"low"`; unknown values fall back to `"low"`.
- `getPriorityScore(priority)` — maps `"high"` → 300, `"medium"` → 200, `"low"` → 100. Used as the primary sort key.
- `getReferenceValue(entry)` — extracts the best available reference string from an entry (`reference`, `sectionRef`, `assetRef`, `clusterKey`, `competitorRef`, `keyword`). Returns `null` if none are present.
- `orderPriorityEntries(entries)` — deduplicates and sorts priority entries. Primary key: `getPriorityScore` (descending). Secondary key: `businessValue` (descending, nulls last). Tertiary keys: `moduleKey` → `type` → `reference` (all ascending, for stable deterministic order).
- `orderActionEntries(actions)` — sorts action entries by the same priority ordering plus `action` string as a final tiebreaker.
- `dedupePriorityEntries(entries)` — deduplicates entries by `moduleKey:type:reference` composite key; on collision, keeps the higher-priority entry.
- `comparePriorityEntries(left, right)` — comparator function used internally; exported for custom sort extensions.

**Consumed by:** `backend/src/index.js` and all 18 module `service.js` files that produce priority or action output arrays.

---

## 14. rateLimiter.js

**File:** `backend/src/core/rateLimiter.js`

**Purpose:** In-memory sliding-window rate limiter. Enforces per-IP and per-actor request limits within a fixed 60-second window. Designed as a lightweight in-process limiter with no npm dependencies; state resets on server restart. A Redis-backed replacement is planned under T3-04.

**Key exports:**

- `DEFAULT_LIMIT` — `120` requests per minute per IP (applies to all routes).
- `MUTATION_LIMIT` — `30` requests per minute per actor (applies only to POST/PATCH mutation endpoints when an actor identity is present).
- `checkLimit(key, limit)` — increments the counter for `key` within the current 60-second window. Returns `{ allowed: boolean, remaining: number, resetAt: timestamp, limit }`. Creates a new window if none exists or the previous window expired.
- `getIpKey(request)` — extracts the real client IP from `X-Forwarded-For`, respecting `TRUSTED_PROXY_COUNT` (default 1 for Render) to prevent IP spoofing. Falls back to `request.socket.remoteAddress`. Returns a string in the form `ip:<address>`.
- `getActorKey(actor)` — returns `actor:<actor>` as the rate-limit key for per-actor mutation limiting.
- `resetForTests()` — clears all in-memory state. **Test-only.** Called between test cases in `server.test.js` to avoid cross-test rate-limit state bleed.

**Window cleanup:** A `setInterval` with `.unref()` runs every 5 minutes to evict expired window entries and prevent unbounded memory growth.

**Consumed by:** `server.js` — `applyRateLimit()` calls `checkLimit` for every incoming request.
