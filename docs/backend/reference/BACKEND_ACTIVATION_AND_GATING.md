# Backend Activation And Gating

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER_BUILD_SPEC.md](../../product/MASTER_BUILD_SPEC.md)
- [BACKEND_MASTER_SPEC.md](BACKEND_MASTER_SPEC.md)

This document defines backend activation and gating for the current 18-module state. As of the SEO OS expansion (2026-05-15), `BUILT_BUT_INACTIVE_MODULES` is non-empty for the first time: `local_seo` is the sole opt-in module.

## Activation Model Overview

The backend activation model is:

- all 18 modules are built
- 17 modules are active in backend by default
- 1 module (`local_seo`) is built but inactive by default — it exists in the catalog and the service registry but is excluded from default orchestration
- activation rules are enforced at runtime by `assertModuleCatalogIntegrity()` on every orchestrator entry point

## Current Activation Sets

### DEFAULT_ACTIVE_MODULES (17 entries)

Defined in `src/core/activation.js`:

```
review_analysis
content_listing_insights
keyword_analysis
rank_tracking
competitor_analysis
optimization_layer
creative_messaging_layer
unified_workflow_layer
technical_seo_audit
on_page_seo_scorer
backlink_intelligence
eeat_signals
search_intent_classifier
serp_feature_analyzer
topical_authority
site_architecture
analytics_integration
```

All 17 of these participate in default orchestration via `runDefaultMvpFlow()`.

### BUILT_BUT_INACTIVE_MODULES (1 entry)

Defined in `src/core/activation.js`:

```
local_seo
```

`local_seo` is present in the module catalog, registered in `serviceRegistry`, and has full 5-file implementation (analysis, insights, actions, service, repository). It does not participate in default orchestration. It can be activated only through an explicit override with `allowInactiveActivation: true`.

## Built Vs Active

### Built

Built means:

- the module exists in backend architecture
- the module exists in backend codebase
- the module has explicit boundaries
- the module has backend input, analysis, insight, priority, action, and persistence paths

### Active

Active means:

- the module participates in default backend execution
- the module participates in default backend orchestration
- the module contributes backend outputs in the default runtime state

### Built But Inactive

Built-but-inactive means:

- the module satisfies all "built" criteria above
- the module does not participate in default execution
- `getDefaultActivationState()` returns `false` for this module key
- the service is registered in `serviceRegistry` so it can be invoked when explicitly activated
- the module is excluded from default orchestration by the activation gate in `runDefaultMvpFlow()`

## Default Backend Activation State

The default backend activation state is:

- architecture includes all 18 modules
- default backend execution runs 17 modules (all except `local_seo`)
- default backend orchestration skips `local_seo` because its activation state is `false`
- default backend outputs include module results from all 17 active modules

The mandatory backend flow remains:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

## Local SEO: The Opt-In Module

`local_seo` is the first and currently only member of `BUILT_BUT_INACTIVE_MODULES`. It is held inactive by default because:

- its data requirements (Google Business Profile, citation providers, geo-specific rank data) are not universally applicable to all product targets
- activating it by default for non-local businesses would produce empty or misleading outputs
- it is ready for activation immediately when a user or context explicitly opts in

To activate `local_seo`, call `resolveActivationState` with an override and the `allowInactiveActivation` option:

```js
resolveActivationState(
  { local_seo: true },
  { allowInactiveActivation: true }
)
```

Without `allowInactiveActivation: true`, the override is silently ignored and `local_seo` remains inactive even if `{ local_seo: true }` is passed.

## assertModuleCatalogIntegrity() Behaviour

`assertModuleCatalogIntegrity()` is called at the entry point of both orchestrators (`runDefaultMvpFlow`, `runActivationAwareFlow`). It verifies:

1. Every key in `DEFAULT_ACTIVE_MODULES` is present in the module catalog.
2. Every key in `BUILT_BUT_INACTIVE_MODULES` is present in the module catalog.

It does **not** enforce full bidirectional coverage — catalog entries that appear in neither set will not cause a failure. The invariant being checked is: "nothing in the activation model is pointing at a module that doesn't exist." The inverse — a catalog entry that is in neither set — is a documentation gap, not a runtime error.

Consequence: if a new module is added to the catalog without being added to either set, `assertModuleCatalogIntegrity()` will not catch it. The addition must be made manually to one of the two sets.

## Gating Principles

Backend gating must follow these principles:

- gating must not remove modules from backend runtime by default unless explicitly documented in `BUILT_BUT_INACTIVE_MODULES`
- gating must preserve module boundaries
- gating must not collapse modules into one vague backend service
- gating must remain explicit when a module is intentionally disabled
- backend activation must not be coupled to frontend exposure rules

Backend gating must not:

- redefine the module list
- treat any default-active module as optional
- silently skip a module that is listed in `DEFAULT_ACTIVE_MODULES`

## Override Mechanism

`resolveActivationState(overrides, options)` supports per-request activation overrides:

- `overrides` — a map of `{ moduleKey: boolean }` entries
- `options.allowInactiveActivation` — boolean; when `true`, modules in `BUILT_BUT_INACTIVE_MODULES` can be activated via override; when `false` or absent, overrides for inactive modules are silently rejected
- default-active modules can be deactivated via override without special options (e.g., `{ review_analysis: false }`)
- unknown module keys in `overrides` are silently ignored
- the resolved state is used by `runActivationAwareFlow()`, which tags each module run with `activatedBy: "default_activation"` or `activatedBy: "explicit_activation_override"` depending on whether the module's resolved state matches its default state

## Rules For Future Restriction

If a default-active module ever needs runtime restriction later, that restriction must:

- be explicit — move the module key to `BUILT_BUT_INACTIVE_MODULES` in `activation.js`
- be temporary and technically justified
- not redefine the architecture
- not erase the module from persistence or orchestration design
- not be presented as the default product model

## Constraints To Prevent Fake Exposure

The backend must not pretend a module is active if it is not executable.

To prevent fake exposure:

- each module must have executable runtime code
- each module must produce backend outputs through the documented flow
- each module must have a persistence path
- each module must be testable through real execution paths

## Implementation Notes

- `MVP_ACTIVE_MODULES` is an alias for `DEFAULT_ACTIVE_MODULES` exported from `activation.js` for backward compatibility with code written before the 18-module expansion
- `getDefaultActivationState()` returns a plain object keyed by all 18 module keys; `local_seo` maps to `false`, all others map to `true`
- `listModulesByActivation()` returns `{ active: [...17 keys], inactive: ["local_seo"] }`
- `listInactiveModules(activationState)` returns all keys where the activation state is `false`; in the default state this is `["local_seo"]`

## This Document Does Not Define

- frontend exposure logic
- UI exposure logic
- specific feature flag products
- specific configuration systems
