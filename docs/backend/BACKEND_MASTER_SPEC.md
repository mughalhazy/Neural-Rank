# Backend Master Spec

Anchor: `MASTER_PRODUCT_BUILD_SPEC.md` as contained in [MASTER BUILD SPEC.md](</D:/Neural Rank/MASTER BUILD SPEC.md>)

This document translates the master product build specification into a backend-only master spec. It does not add product scope, module scope, activation rules, or technology beyond the anchor.

## Backend Purpose

The backend exists to support the Unified SEO Platform as an operational SEO and ASO system that:

- analyzes SEO performance
- identifies opportunities
- supports execution of improvements

The backend must support insight and prioritized action generation. It must not stop at raw data delivery.

## Backend Product Coverage

The backend product coverage is:

- Web SEO
- App Store SEO / ASO

## Backend Stack

The backend stack is limited to:

- Supabase
- Postgres as source of truth
- Auth
- Storage
- Edge Functions only where needed

No extra backend technology is defined here.

## Backend Module List

The backend must include these explicit modules only:

1. Review Analysis
2. Content / Listing Insights
3. Keyword Analysis
4. Rank Tracking
5. Competitor Analysis
6. Optimization Layer
7. Creative / Messaging Layer
8. Unified Workflow Layer

## Backend Responsibilities Per Module

Each backend module must support:

- input handling path
- analysis path
- insight generation path
- action and prioritization path

### Review Analysis

Backend responsibility:

- handle review/customer feedback inputs
- support complaint clustering
- support feature request detection
- produce review insights and actions

### Content / Listing Insights

Backend responsibility:

- handle website content inputs
- handle app listing inputs
- analyze content quality for SEO
- analyze listing quality for app stores
- produce action-oriented outputs

### Keyword Analysis

Backend responsibility:

- handle keyword inputs
- support keyword suggestion generation
- support keyword opportunity identification
- support prioritized SEO / ASO discovery outputs

### Rank Tracking

Backend responsibility:

- handle tracked keyword inputs
- track keyword positions
- monitor changes
- surface actionable rank movement

### Competitor Analysis

Backend responsibility:

- handle competitor URLs / apps where relevant
- track competitors
- compare signals
- identify gaps and opportunities

### Optimization Layer

Backend responsibility:

- produce content suggestions
- produce metadata improvement suggestions
- turn intelligence into execution guidance

### Creative / Messaging Layer

Backend responsibility:

- support screenshot/content presentation critique inputs where relevant
- generate messaging suggestions
- support conversion-oriented optimization outputs

### Unified Workflow Layer

Backend responsibility:

- combine all modules into one operating workflow
- centralize insight and action planning
- support one product workflow instead of fragmented tool behavior

## Backend Activation Model

Build all modules now.

MVP-active by default:

- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking

Built but inactive by default:

- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer beyond MVP activation

Inactive means:

- module exists in architecture
- module exists in codebase
- module is gated from initial activation and exposure

Inactive does not mean:

- omitted
- commented out
- fake shell only
- absent from architecture

## Backend Primary Flow

The backend primary flow is:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

This flow is mandatory across all modules.

The backend must not stop at:

- input -> raw data
- input -> chart
- input -> report without prioritization

The backend must always aim to convert:

- data -> insight
- insight -> action

## Backend Input Types

The backend must support these input types:

- website URL
- app URL
- keywords
- reviews
- competitor URLs / apps where relevant

## Backend Output Types

The backend must support these output types:

- keyword insights
- ranking insights
- content insights
- review insights
- competitor insights
- optimization actions
- prioritized actions

Core output rule:

- system must output insights
- system must output prioritized actions
- system must not output raw data without interpretation

## Backend Architecture Principles

The backend must follow these principles from the master spec:

- all modules must exist as explicit bounded modules
- domain logic, data logic, and presentation logic must be separated
- activation boundaries must be explicit
- future module activation must not require major rewrite
- backend architecture must be scalable from day 1
- shared primitives may be built where genuinely reused
- avoid speculative enterprise complexity not discussed
- keep business logic separated from UI
- keep platform-specific integrations abstracted where needed
- do not make mobile-only assumptions that block later web expansion
- do not lock the product into a stack that forces rewrite for later expansion

## Backend Non-Goals

The backend must not:

- reduce the product to ASO only
- reduce the product to web SEO only
- reduce the product to utility tools only
- collapse all modules into one vague backend layer
- expose inactive modules as if they are active
- assume rewrite later for web app or client portal expansion
- treat public marketing website needs as the primary driver of backend architecture
- define frontend architecture
- define UI content

## Backend Done Condition

The backend master spec is satisfied when backend implementation later results in:

1. All product modules present in the codebase.
2. MVP modules activated by default.
3. Full-suite modules built but inactive by default.
4. Backend stack aligned to Supabase, Postgres, Auth, Storage, and Edge Functions only where needed.
5. Backend outputs aligned to insight and prioritized action generation.
6. Backend architecture able to expand later without major structural rewrite.
