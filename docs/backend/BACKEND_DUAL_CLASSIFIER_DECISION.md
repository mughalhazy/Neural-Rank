# Backend Dual Classifier Decision

Date: 2026-05-16
Files: `src/core/intentClassifier.js`, `src/domains/search-intelligence/intentClassifier.js`

---

## Overview

The backend contains two intent classifiers. This is intentional. They serve different abstraction layers and must not be merged.

---

## Classifier 1: Core Module-Layer Classifier

**Path:** `src/core/intentClassifier.js`

**Intent taxonomy (4 intents):**
- `informational`
- `navigational`
- `transactional`
- `commercial`

**Method:** Heuristic token-based scoring. The classifier tokenizes the keyword string on whitespace, hyphens, underscores, and slashes. Each token is checked against a frozen `INTENT_SIGNALS` map. Multi-word signals (e.g. "free trial", "pros cons") receive a double score. The intent with the highest cumulative score wins. Confidence is expressed as `highestScore / totalScore`.

**Exported functions:**
- `classifyIntent(keyword)` — classifies a single keyword string
- `batchClassifyIntents(keywords)` — classifies an array of keyword strings or `{ keyword }` objects
- `tokenize(keyword)` — exposes the tokenizer for testing

**Content format mapping:** Each intent maps to a list of recommended content formats (e.g. `commercial` → `["comparison page", "review article", "listicle", "roundup", "vs page"]`).

**Consumers:** The `search_intent_classifier` module (`src/modules/search-intent-classifier/`) uses this classifier via its `analysis.js`. This is the correct entry point for all module-layer intent classification.

---

## Classifier 2: Domain Search-Intelligence Classifier

**Path:** `src/domains/search-intelligence/intentClassifier.js`

**Intent taxonomy (7 intents):**
- `informational`
- `navigational`
- `commercial`
- `transactional`
- `local`
- `comparison`
- `investigative`

The 7-intent taxonomy is defined in `src/domains/search-intelligence/models.js` as `INTENT_TAXONOMY` and enforced by `assertIntentTaxonomy()`.

**Method:** Rule-based phrase matching. A prioritized `INTENT_RULES` array is iterated in order; the first rule whose phrases appear in the normalized query wins. Each rule carries a static confidence value. Fallback: queries of 2 words or fewer default to `commercial` (confidence 0.55); longer queries default to `informational` (confidence 0.55).

**Exported functions:**
- `classifyQueryIntent(query)` — classifies a single query string; returns `{ intent, confidence, rationale }`
- `assertIntentTaxonomy(intent)` — validates that an intent value is in the 7-entry taxonomy; throws `"invalid_search_intent"` if not

**Consumers:** The `search-intelligence` bounded context domain services (`src/domains/search-intelligence/service.js`, `opportunityScoring.js`). This domain operates on search query objects (not raw keyword strings) and needs richer intent resolution — specifically `local`, `comparison`, and `investigative` — to support SERP pattern analysis and opportunity scoring.

---

## Architectural Decision

**These two classifiers are intentionally separate utilities serving different abstraction layers. They must not be merged.**

### Rationale

**Different abstraction layers:** The core classifier is a module-layer primitive. It operates on raw keyword strings submitted by users and powers the `search_intent_classifier` module's output. The domain classifier is a domain-layer semantic service. It operates on normalized query records within the `search-intelligence` bounded context and powers cross-query opportunity scoring and SERP pattern interpretation.

**Different vocabulary needs:** The module layer needs a simple, user-facing 4-way split that maps cleanly to content format recommendations. The domain layer needs a richer 7-way split that distinguishes `local`, `comparison`, and `investigative` intents — categories that are meaningful for SERP analysis and opportunity scoring but would add noise to the module-layer content recommendation output.

**Different matching strategies:** The core classifier uses additive token scoring (multiple signals can accumulate); this is appropriate for keyword bags where partial signals should combine. The domain classifier uses first-match phrase rules with fixed confidence; this is appropriate for query intent classification where a single strong phrase (e.g. "near me") is sufficient to determine intent with high confidence.

**Different callers:** The module layer is called by orchestration via `service.run()`. The domain layer is called by domain service logic that is not part of default module orchestration.

---

## Consumption Map

| Classifier | Path | Used By |
|-----------|------|---------|
| Core (4-intent) | `src/core/intentClassifier.js` | `src/modules/search-intent-classifier/analysis.js` |
| Domain (7-intent) | `src/domains/search-intelligence/intentClassifier.js` | `src/domains/search-intelligence/service.js`, `src/domains/search-intelligence/opportunityScoring.js` |

---

## Consolidation Rule

**Do not merge these classifiers.**

If a new module needs intent classification, use the core classifier (`src/core/intentClassifier.js`). It is the correct entry point for the module layer.

If a domain service needs richer intent resolution — specifically when the 7-intent taxonomy (`local`, `comparison`, `investigative`) is semantically meaningful for the domain's logic — use the domain classifier (`src/domains/search-intelligence/intentClassifier.js`).

Do not introduce a third classifier. If neither classifier satisfies a new use case, extend the appropriate one after reviewing whether the extension belongs to the module layer or the domain layer. Document the extension decision here.

---

## Risk: Intent Label Divergence

The two classifiers can produce different intent labels for the same input string. For example:

- "best seo tool" → core classifier: `commercial` (matches "best" token in commercial signals)
- "best seo tool" → domain classifier: `comparison` (matches "best" phrase in comparison rule, which is checked before commercial)

This is by design: the two layers have different intent taxonomies and the labels are not interchangeable. However, if outputs from both layers are surfaced in the same product view without clear provenance labeling, users or downstream code could interpret different intent labels for the same keyword as a contradiction.

**Monitoring flag:** If any new feature or API endpoint mixes outputs from both classifiers in a single response object, add a `classifierLayer` provenance field to distinguish them. Do not present `commercial` from the core layer and `comparison` from the domain layer as equivalent intent labels — they are calculated by different models with different taxonomies.

This risk is low while the two layers remain separate in orchestration. It becomes a concrete concern if a future aggregation layer pulls from both without provenance tracking.
