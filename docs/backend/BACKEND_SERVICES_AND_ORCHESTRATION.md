# Backend Services And Orchestration

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER BUILD SPEC.md](</D:/Neural Rank/MASTER BUILD SPEC.md>)
- [docs/backend/BACKEND_MASTER_SPEC.md](</D:/Neural Rank/docs/backend/BACKEND_MASTER_SPEC.md>)
- [docs/backend/BACKEND_MODULE_BOUNDARIES.md](</D:/Neural Rank/docs/backend/BACKEND_MODULE_BOUNDARIES.md>)

This document defines backend service structure and orchestration boundaries so the backend can later be implemented cleanly without collapsing module boundaries or drifting from the master spec.

## Service Layer Principles

Backend service structure must follow these principles:

- services are organized around the eight explicit backend modules only
- service boundaries must preserve explicit module ownership
- shared backend services may exist only where genuinely reused
- shared services must not collapse the module structure into a monolith
- service structure must support all modules now, even when not all modules are active by default
- service structure must support the mandatory system flow `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- service structure must support later activation without major structural rewrite

## Domain/Data/Orchestration Separation

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

Each explicit module should have backend service responsibilities for:

- intake of module-relevant inputs
- execution of module-specific analysis
- production of module-specific insights
- production of module-specific prioritized actions
- persistence interaction for module-owned records

### Review Analysis

Service expectation:

- process review inputs
- run review analysis
- produce review insights
- produce prioritized review-derived actions

### Content / Listing Insights

Service expectation:

- process website/app listing inputs relevant to this module
- run content/listing analysis
- produce content/listing insights
- produce prioritized content/listing actions

### Keyword Analysis

Service expectation:

- process keyword inputs
- run keyword opportunity analysis
- produce keyword insights
- produce prioritized keyword-related actions

### Rank Tracking

Service expectation:

- process rank-tracking inputs
- run ranking analysis
- produce ranking insights
- produce prioritized rank-related actions

### Competitor Analysis

Service expectation:

- process competitor inputs where relevant
- run competitor comparison analysis
- produce competitor insights
- produce prioritized competitor-related actions

### Optimization Layer

Service expectation:

- consume optimization-relevant intelligence within module boundaries
- produce optimization guidance
- produce prioritized optimization actions

### Creative / Messaging Layer

Service expectation:

- process creative/messaging-relevant inputs where relevant
- run creative/messaging analysis within module scope
- produce creative/messaging suggestions
- produce prioritized creative/messaging actions

### Unified Workflow Layer

Service expectation:

- coordinate explicit module outputs
- centralize workflow-level planning
- produce workflow-level prioritized actions when activated

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

The Unified Workflow Layer is an explicit backend module, not a replacement for the other modules.

Its relationship to the rest of the service structure is:

- it coordinates across explicit module outputs
- it centralizes insight and action planning across modules
- it depends on module-owned outputs rather than reimplementing module analysis paths
- it must preserve the ownership of Review Analysis, Content / Listing Insights, Keyword Analysis, Rank Tracking, Competitor Analysis, Optimization Layer, and Creative / Messaging Layer

## MVP-Active Orchestration Behavior

The default active orchestration behavior includes only:

- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking

In the MVP-active state:

- orchestration routes default active work only through these modules
- these modules support the full required path from input to prioritized action
- orchestration returns insights and prioritized actions from the active module set

## Built-But-Inactive Orchestration Behavior

The built-but-inactive modules are:

- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer beyond MVP activation

In the default inactive state:

- these modules remain part of the backend architecture
- these modules remain part of service design
- these modules do not participate in default active orchestration as active capabilities
- their existence must not be faked as active product behavior

At the same time:

- they must remain structurally ready for later activation
- later activation must reuse existing service boundaries rather than requiring major redesign

## Prioritization Flow Support

Backend service structure and orchestration must support the prioritization flow explicitly.

That means:

- module services must not stop at analysis only
- orchestration must preserve the path from insight to priority to action
- prioritized outputs must remain distinguishable from raw or intermediate analysis outputs
- workflow coordination, where active, must preserve prioritized action planning without erasing module ownership

## Non-Goals

This document does not define:

- frontend behavior
- UI behavior
- screen-level flows
- concrete controller or endpoint design
- specific class structures
- specific service framework patterns
- extra modules beyond the anchored eight
