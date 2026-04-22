# Backend Data And Persistence

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER BUILD SPEC.md](</D:/Neural Rank/MASTER BUILD SPEC.md>)
- [docs/backend/BACKEND_MASTER_SPEC.md](</D:/Neural Rank/docs/backend/BACKEND_MASTER_SPEC.md>)
- [docs/backend/BACKEND_MODULE_BOUNDARIES.md](</D:/Neural Rank/docs/backend/BACKEND_MODULE_BOUNDARIES.md>)

This document defines the backend data and persistence model at an architectural level so later implementation can be done with low drift.

## Persistence Principles

Backend persistence must follow these principles:

- Postgres is the source of truth for structured product data
- persistence must preserve explicit module boundaries
- persistence must support the mandatory backend flow `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- persistence must support all eight modules from day 1
- persistence must support built-but-inactive modules without forcing immediate activation
- persistence must support later activation without major structural rewrite
- persistence must preserve source ownership when multiple modules relate to the same product subject
- persistence must support insight and prioritized action outputs rather than raw data only

## Postgres As Source Of Truth

Postgres is the source of truth for structured backend product state.

At an architecture level, Postgres must hold the durable records needed to support:

- product subject references derived from website URL and app URL inputs
- module input records
- module analysis results
- module insight outputs
- prioritized action outputs
- workflow-level aggregation and planning state where applicable
- activation-aware backend state where needed to support the defined activation model

Postgres must remain the authoritative backend store for structured product data across active and inactive modules.

## Supabase Role In Persistence/Auth/Storage

Supabase is the approved backend/data platform in the anchor spec.

Its architectural role is:

- Postgres for structured source-of-truth persistence
- Auth for identity and access control concerns
- Storage for object and file storage only where needed
- Edge Functions only where needed, without replacing Postgres as the system of record

Architectural separation must remain clear:

- Auth is not the primary persistence model for product data
- Storage is not the source of truth for structured product state
- Edge Functions do not redefine the core persistence model

## Data Separation Principles By Module

Persistence must preserve explicit module ownership.

### Review Analysis

- owns persisted review inputs it handles
- owns persisted review analysis results
- owns persisted review insights
- owns persisted review-priority and review-action outputs

### Content / Listing Insights

- owns persisted content/listing inputs it handles
- owns persisted content/listing analysis results
- owns persisted content/listing insights
- owns persisted content/listing prioritized actions

### Keyword Analysis

- owns persisted keyword inputs it handles
- owns persisted keyword analysis results
- owns persisted keyword insights
- owns persisted keyword-priority and keyword-action outputs

### Rank Tracking

- owns persisted rank-tracking inputs it handles
- owns persisted ranking analysis results
- owns persisted ranking insights
- owns persisted rank-priority and rank-action outputs

### Competitor Analysis

- owns persisted competitor inputs it handles
- owns persisted competitor analysis results
- owns persisted competitor insights
- owns persisted competitor-priority and competitor-action outputs

### Optimization Layer

- owns persisted optimization-relevant records used within its module scope
- owns persisted optimization outputs
- owns persisted optimization-priority and optimization-action outputs

### Creative / Messaging Layer

- owns persisted creative/messaging inputs it handles where relevant
- owns persisted creative/messaging analysis results
- owns persisted creative/messaging insights and suggestions
- owns persisted creative/messaging prioritized actions

### Unified Workflow Layer

- owns persisted workflow-level aggregation state
- owns persisted workflow planning outputs
- owns persisted workflow-level prioritized actions

Cross-module relationships may exist, but persistence must preserve source ownership instead of collapsing records into one vague shared domain.

## Activation-Aware Persistence Considerations

Because all modules are built now but not all are active by default, persistence must be activation-aware.

This means:

- inactive modules still require structurally valid persistence support
- active and inactive state must not force separate backend architectures
- persistence design must allow later activation without replacing the existing data model
- default active backend operation should only use the MVP-active module set, while built-but-inactive module persistence remains structurally available

Activation-aware persistence must support:

- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking

as active by default, while still structurally supporting:

- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer beyond MVP activation

## Analysis Result Storage Considerations

Analysis results must be persistable at the module level.

At an architectural level, storage of analysis results should preserve:

- which module produced the analysis result
- which product subject or input set the result belongs to
- separation between raw input intake and interpreted backend analysis state
- the ability to support later insight generation and action prioritization

Analysis result persistence must not collapse directly into raw data storage only. It must support the backend requirement to move from analysis into insight and action.

## Prioritized Action Storage Considerations

Prioritized actions are mandatory outputs in the anchor spec and must be treated as first-class persisted backend outputs.

At an architectural level, prioritized action persistence should preserve:

- which module produced the action output
- which input or analysis context the action relates to
- separation between insight outputs and action outputs
- support for prioritized action handling within explicit module boundaries

Where Unified Workflow Layer later centralizes cross-module planning, workflow-level prioritized actions must still remain distinguishable from module-owned prioritized actions.

## Future-Safe Schema Principles

Final table design is not defined here, but later schema design must follow these principles:

- schema must preserve explicit module boundaries
- schema must preserve Postgres as source of truth
- schema must support all modules from day 1
- schema must support future activation without major structural rewrite
- schema must support product expansion later without mobile-only assumptions
- schema must preserve a clear path from input to analysis to insight to priority to action
- schema must preserve source ownership for module outputs even when workflow-level aggregation exists
- schema must avoid speculative complexity beyond the anchored scope

## Non-Goals

This document does not define:

- final table schema
- final table names
- final column sets
- unagreed fields
- alternate databases
- search systems
- queue systems
- analytics platforms
- frontend data models
