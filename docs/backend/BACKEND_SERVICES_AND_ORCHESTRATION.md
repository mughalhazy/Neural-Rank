# Backend Services And Orchestration

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER BUILD SPEC.md](</D:/Neural Rank/MASTER BUILD SPEC.md>)
- [docs/backend/BACKEND_MASTER_SPEC.md](</D:/Neural Rank/docs/backend/BACKEND_MASTER_SPEC.md>)
- [docs/backend/BACKEND_MODULE_BOUNDARIES.md](</D:/Neural Rank/docs/backend/BACKEND_MODULE_BOUNDARIES.md>)

This document defines backend service structure and orchestration boundaries for the current 18-module state. It covers the module service layer, both orchestrators, and the parallel domain service layer.

## Service Layer Principles

Backend service structure must follow these principles:

- services are organized around the 18 explicit backend modules
- service boundaries must preserve explicit module ownership
- shared backend services may exist only where genuinely reused
- shared services must not collapse the module structure into a monolith
- service structure must support all 18 modules, including `local_seo` which is built but inactive by default
- service structure must support the mandatory system flow `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- service structure must support later activation of built-but-inactive modules without major structural rewrite

## Domain / Data / Orchestration Separation

Backend architecture must keep these responsibilities distinct:

### Domain

Domain responsibilities include:

- module-specific business logic
- module-specific input handling
- module-specific analysis logic
- module-specific insight generation
- module-specific prioritized action generation

### Data

Data responsibilities include:

- persistence access
- source-of-truth reads and writes in Postgres
- storage interaction where needed
- preservation of module ownership in persisted records

### Orchestration

Orchestration responsibilities include:

- routing work into the correct explicit module
- coordinating module execution order where needed
- applying activation boundaries
- combining module outputs where permitted
- preserving the path from insight to priority to action

Orchestration must not absorb domain ownership from the modules it coordinates.

## Per-Module Service Expectations

Each explicit module has backend service responsibilities for:

- intake of module-relevant inputs
- execution of module-specific analysis
- production of module-specific insights
- production of module-specific prioritized actions
- persistence interaction for module-owned records

All 18 modules satisfy this contract. Each module's `service.js` exports a `run(moduleInput, context)` function that returns:

```js
{
  moduleKey,
  displayName,
  defaultActive,
  initialState,
  activeByDefault,
  status,            // "completed" | "actions_empty"
  flow: {
    input,           // normalized input payload
    analysis,        // analysis result
    insight,         // insights array
    priority,        // priority payload
    action,          // actions array
  },
  intakeResult,
  analysisResult,
  insightResult,
  actionResult,
  persistence,       // { persisted: boolean, savedRecord? }
  integrationStatus, // adapter status string
}
```

## Service Registry

`src/orchestration/serviceRegistry.js` registers all 18 module services and defines the `executionOrder` array. This is the authoritative source for which modules participate in orchestration and in what sequence.

All 18 modules are registered in `serviceRegistry` regardless of activation state. The activation gate in the orchestrators — not the registry — determines which modules actually run.

## Default Orchestration: runDefaultMvpFlow

`src/orchestration/defaultMvpOrchestrator.js` exports `runDefaultMvpFlow` (aliased as `runDefaultBackendFlow`).

Behaviour:

1. Calls `assertModuleCatalogIntegrity()` — throws if any activation-set key is missing from the catalog.
2. Calls `getDefaultActivationState()` — resolves all 18 keys; `local_seo` resolves to `false`.
3. Iterates `getRegisteredModuleKeys()` (the `executionOrder` array).
4. For each key: skips if `activationState[moduleKey] !== true`.
5. Calls `service.run(moduleInput, moduleContext)` with `activatedBy: "default_backend_orchestrator"`.
6. Returns `{ activationState, inactiveModules, moduleResults, results }`.

Result: 17 modules run; `local_seo` is skipped. `inactiveModules` contains `["local_seo"]`.

### Default Execution Order

Modules run in this order:

1. `technical_seo_audit` — first; provides foundational crawl/performance signals
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
17. `local_seo` — registered; skipped in default flow (`defaultActive: false`)
18. `unified_workflow_layer` — last; synthesizes all preceding module outputs

## Activation-Aware Orchestration: runActivationAwareFlow

`src/orchestration/activationAwareOrchestrator.js` exports `runActivationAwareFlow`.

Signature:

```js
runActivationAwareFlow(moduleInputs, context, activationOverrides, options)
```

Behaviour differences from the default orchestrator:

- calls `resolveActivationState(activationOverrides, options)` instead of `getDefaultActivationState()`
- supports deactivating default-active modules via `activationOverrides: { moduleKey: false }`
- supports activating `local_seo` (and any future built-but-inactive modules) via `activationOverrides: { local_seo: true }` plus `options: { allowInactiveActivation: true }`
- tags each module context with `activatedBy: "default_activation"` or `activatedBy: "explicit_activation_override"` depending on whether the resolved state matches the default state
- otherwise follows the same execution-order loop as the default orchestrator

`allowInactiveActivation` guard: if `options.allowInactiveActivation` is not `true`, any override that attempts to activate a `BUILT_BUT_INACTIVE_MODULES` entry is silently rejected. `local_seo` will remain inactive even if `{ local_seo: true }` is passed without the flag.

## Built-But-Inactive Orchestration: local_seo

`local_seo` is the only module currently in `BUILT_BUT_INACTIVE_MODULES`. In the default orchestration state:

- it remains part of the backend architecture and service design
- it is registered in `serviceRegistry` at position 17 in `executionOrder`
- it does not participate in default active orchestration
- its existence must not be faked as active product behavior
- it is structurally ready for immediate activation when explicitly opted in

## Domain Service Layer

Operating alongside the module layer is a domain service layer organized into 8 bounded contexts. These domains provide higher-level semantic services and are not part of default module orchestration — they are not invoked by either orchestrator. They consume module outputs and platform data through their own adapters and service interfaces.

The 8 domain bounded contexts are:

| Domain | Path | Primary Responsibility |
|--------|------|------------------------|
| `execution` | `src/domains/execution/` | Audit log writing, execution status tracking, run repository |
| `governance` | `src/domains/governance/` | Policy registry, governance rule evaluation, result model |
| `measurement` | `src/domains/measurement/` | Metric source registry, metric models, measurement repository |
| `technical-operations` | `src/domains/technical-operations/` | HTML source analysis, technical analyzer contracts |
| `search-intelligence` | `src/domains/search-intelligence/` | 7-intent classifier, SERP pattern models, opportunity scoring, provider interface |
| `business-intelligence` | `src/domains/business-intelligence/` | Business metric models, business intelligence repository |
| `site-intelligence` | `src/domains/site-intelligence/` | Review and content listing adapters, site intelligence contract |
| `content-operations` | `src/domains/content-operations/` | Optimization layer and creative messaging adapters, content operations contract |

Domain services are exposed via `getDomainServices()` and `getDomainBoundaryMap()` from `src/domains/index.js`. They are not in the execution order and do not have their own records tables in the module-run schema.

The `search-intelligence` domain contains a richer 7-intent classifier (`domains/search-intelligence/intentClassifier.js`) distinct from the module-layer core classifier. See `BACKEND_DUAL_CLASSIFIER_DECISION.md` for the architectural decision on these two classifiers.

## Orchestration Rules

Backend orchestration must:

- accept only anchored backend input types
- route work to the correct explicit module
- preserve module boundaries during execution
- apply activation rules before default module participation
- support backend outputs as insights and prioritized actions rather than raw data only
- allow workflow-level coordination without re-owning module internals

Backend orchestration must not:

- merge all modules into one vague backend service
- bypass explicit module ownership
- activate built-but-inactive modules by default
- replace module-specific analysis with generic orchestration logic

## Unified Workflow Layer Relationship

The Unified Workflow Layer is an explicit backend module, not a replacement for the other 17 modules.

Its relationship to the rest of the service structure is:

- it runs last in the execution order, after all other active modules
- it coordinates across explicit module outputs
- it centralizes insight and action planning across modules
- it depends on module-owned outputs rather than reimplementing module analysis paths
- it must preserve the ownership of all 17 other modules

## Prioritization Flow Support

Backend service structure and orchestration must support the prioritization flow explicitly.

That means:

- module services must not stop at analysis only
- orchestration must preserve the path from insight to priority to action
- prioritized outputs must remain distinguishable from raw or intermediate analysis outputs
- workflow coordination must preserve prioritized action planning without erasing module ownership

## Non-Goals

This document does not define:

- frontend behavior
- UI behavior
- screen-level flows
- concrete controller or endpoint design
- specific class structures
- specific service framework patterns
