# BACKEND_IMPLEMENTATION_GAP_SCAN.md

Anchors:
- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in `MASTER BUILD SPEC.md`
- `docs/backend/BACKEND_MASTER_SPEC.md`
- `docs/backend/BACKEND_MODULE_BOUNDARIES.md`
- `docs/backend/BACKEND_ACTIVATION_AND_GATING.md`
- `docs/backend/BACKEND_DATA_AND_PERSISTENCE.md`
- `docs/backend/BACKEND_SERVICES_AND_ORCHESTRATION.md`
- `docs/backend/BACKEND_INTEGRATION_BOUNDARIES.md`
- `docs/backend/BACKEND_BUILD_SEQUENCE.md`

## Purpose
This document records where the backend implementation still does not fully satisfy the frozen backend docs. It is backend-only and uses the backend docs as the source of truth.

## Priority Order For Fixes

### P1
- Replace placeholder integration adapters with concrete provider connections only when approved and available.
- Add a shared persisted repository factory or equivalent database binding path so repositories do not rely only on injected `query(...)` access.

### P2
- Add deeper validation and consistency checks around normalized inputs and stored outputs across modules.

## Module-By-Module Gap List

### Review Analysis
Status: fixed in current implementation.

Fixed files/functions:
- `backend/src/modules/review-analysis/service.js`
- `backend/src/modules/review-analysis/analysis.js`
- `backend/src/modules/review-analysis/insights.js`
- `backend/src/modules/review-analysis/actions.js`
- `backend/src/modules/review-analysis/repository.js`

Resolved items:
- review ingestion path is implemented
- grouping and clustering path is implemented
- insight generation is implemented
- prioritized action output is implemented
- module-specific persistence boundary is implemented

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

### Content / Listing Insights
Status: fixed in current implementation.

Fixed files/functions:
- `backend/src/modules/content-listing-insights/service.js`
- `backend/src/modules/content-listing-insights/analysis.js`
- `backend/src/modules/content-listing-insights/insights.js`
- `backend/src/modules/content-listing-insights/actions.js`
- `backend/src/modules/content-listing-insights/repository.js`

Resolved items:
- content/listing input handling is implemented
- analysis path is implemented
- insight generation is implemented
- prioritized action output is implemented
- module-specific persistence boundary is implemented

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

### Keyword Analysis
Status: fixed in current implementation.

Fixed files/functions:
- `backend/src/modules/keyword-analysis/service.js`
- `backend/src/modules/keyword-analysis/analysis.js`
- `backend/src/modules/keyword-analysis/insights.js`
- `backend/src/modules/keyword-analysis/actions.js`
- `backend/src/modules/keyword-analysis/repository.js`

Resolved items:
- keyword input handling is implemented
- suggestion and opportunity logic is implemented
- insight generation is implemented
- prioritized action output is implemented
- module-specific persistence boundary is implemented

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

### Rank Tracking
Status: fixed in current implementation.

Fixed files/functions:
- `backend/src/modules/rank-tracking/service.js`
- `backend/src/modules/rank-tracking/analysis.js`
- `backend/src/modules/rank-tracking/insights.js`
- `backend/src/modules/rank-tracking/actions.js`
- `backend/src/modules/rank-tracking/repository.js`

Resolved items:
- rank persistence path is implemented at the module repository boundary
- rank change detection path is implemented
- insight generation from rank movement is implemented
- prioritized alerts/actions are implemented

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

### Competitor Analysis
Status: fixed in current implementation and kept built-but-inactive by default.

Fixed files/functions:
- `backend/src/modules/competitor-analysis/service.js`
- `backend/src/modules/competitor-analysis/analysis.js`
- `backend/src/modules/competitor-analysis/insights.js`
- `backend/src/modules/competitor-analysis/actions.js`
- `backend/src/modules/competitor-analysis/repository.js`

Resolved items:
- competitor tracking and comparison path is implemented
- gap identification path is implemented
- insight generation is implemented
- prioritized action output is implemented
- module-specific persistence boundary is implemented
- built-but-inactive default state is preserved in module service output

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

### Optimization Layer
Status: fixed in current implementation and kept built-but-inactive by default.

Fixed files/functions:
- `backend/src/modules/optimization-layer/service.js`
- `backend/src/modules/optimization-layer/analysis.js`
- `backend/src/modules/optimization-layer/insights.js`
- `backend/src/modules/optimization-layer/actions.js`
- `backend/src/modules/optimization-layer/repository.js`

Resolved items:
- suggestion generation path is implemented
- metadata and content improvement path is implemented
- action recommendation output is implemented
- module-specific persistence boundary is implemented
- built-but-inactive default state is preserved in module service output

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

### Creative / Messaging Layer
Status: fixed in current implementation and kept built-but-inactive by default.

Fixed files/functions:
- `backend/src/modules/creative-messaging-layer/service.js`
- `backend/src/modules/creative-messaging-layer/analysis.js`
- `backend/src/modules/creative-messaging-layer/insights.js`
- `backend/src/modules/creative-messaging-layer/actions.js`
- `backend/src/modules/creative-messaging-layer/repository.js`

Resolved items:
- critique and suggestion path is implemented
- messaging suggestion outputs are implemented
- module-specific persistence boundary is implemented
- built-but-inactive default state is preserved in module service output

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

### Unified Workflow Layer
Status: fixed in current implementation and kept built-but-inactive by default.

Fixed files/functions:
- `backend/src/modules/unified-workflow-layer/service.js`
- `backend/src/modules/unified-workflow-layer/analysis.js`
- `backend/src/modules/unified-workflow-layer/insights.js`
- `backend/src/modules/unified-workflow-layer/actions.js`
- `backend/src/modules/unified-workflow-layer/repository.js`

Resolved items:
- orchestration support is implemented
- cross-module aggregation support is implemented
- cross-module prioritization and action consolidation support is implemented
- module-specific persistence boundary is implemented
- built-but-inactive default state is preserved in module service output

Remaining notes:
- relies on injected repository or generic Postgres-style `query(...)` runtime wiring
- external integration path still depends on later concrete provider work

## Cross-Cutting Gaps

### Backend Quality Cleanup
Status: fixed in current implementation.

Fixed files/functions:
- `backend/src/core/createModuleService.js`
- `backend/src/orchestration/defaultMvpOrchestrator.js`
- `backend/src/orchestration/activationAwareOrchestrator.js`
- `backend/src/modules/unified-workflow-layer/analysis.js`

Resolved items:
- removed leftover dead scaffold code no longer used by the named backend modules
- removed duplicated inactive-module filtering logic in the orchestrators
- simplified duplicated priority-weight logic to use the shared prioritization utility
- preserved the documented module boundaries and orchestration responsibilities

Remaining notes:
- cleanup did not change approved architecture or module scope
- backend runtime still depends on later concrete provider implementations where approved

### Cross-Module Prioritization Consistency
Status: fixed in current implementation.

Fixed files/functions:
- `backend/src/core/prioritization.js`
- `backend/src/modules/unified-workflow-layer/analysis.js`
- `backend/src/modules/unified-workflow-layer/actions.js`

Resolved items:
- priority labels are normalized consistently across modules
- cross-module priority items are deduplicated before consolidation
- consolidated priorities are ordered deterministically
- unified workflow actions are returned in ordered priority sequence

Remaining notes:
- module-specific priorities still depend on the quality of each module's local action generation
- orchestration-level persistence wiring remains a separate unfinished concern

### Runtime Persistence Wiring And Service Connection
Status: partially fixed in current implementation.

Fixed files/functions:
- `backend/src/core/runtimeContext.js`
- `backend/src/integrations/registry.js`
- `backend/src/orchestration/serviceRegistry.js`
- `backend/src/orchestration/defaultMvpOrchestrator.js`
- `backend/src/orchestration/activationAwareOrchestrator.js`
- `backend/src/index.js`

Resolved items:
- module execution order is explicit and stable
- orchestration now passes prior module results for cross-module aggregation paths
- integration adapters are mapped consistently by module key and context alias
- repository and integration context aliases are normalized consistently across modules
- shared backend exports now expose the connected runtime entry points

Remaining notes:
- module repositories still depend on injected repositories or generic Postgres-style `query(...)` adapters
- no shared persisted repository factory exists yet for automatic database binding

Priority: `P1`

### Integration Adapters Are Still Placeholders
Status: fixed at the boundary level in current implementation.

Fixed files/functions:
- `backend/src/core/createProviderAdapter.js`
- `backend/src/integrations/catalog.js`
- `backend/src/integrations/registry.js`

Resolved items:
- incomplete integrations remain explicit boundary adapters
- incomplete adapters now return transparent `integration_not_connected` or `integration_incomplete` states
- runtime-provided adapters can expose real working collection paths without changing module contracts
- no fake success path remains in the default integration boundary behavior

Remaining notes:
- no external providers are implemented yet, by design
- concrete provider work still requires later approved implementation

Priority: `resolved`

### Activation And Gating Need Stronger Runtime Enforcement For Future Expansion
Status: fixed in current implementation.

Fixed files/functions:
- `backend/src/core/activation.js`
- `backend/src/orchestration/serviceRegistry.js`
- `backend/src/orchestration/defaultMvpOrchestrator.js`
- `backend/src/orchestration/activationAwareOrchestrator.js`

Resolved items:
- MVP modules are active by default
- built-but-inactive modules remain present in the registry but inactive by default
- default orchestration no longer exposes inactive modules
- inactive module activation now requires explicit opt-in through orchestrator options
- catalog integrity checks prevent omission of required modules from the runtime model

Remaining notes:
- activation state is still runtime-managed rather than persisted in a database policy layer
- placeholder integrations remain a separate concern

Priority: `resolved`

## Current Fix Order
1. approved concrete integrations
