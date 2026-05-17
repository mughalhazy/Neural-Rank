# Frontend Module Feature Mapping

## Anchors
- `MASTER BUILD SPEC.md`
- `MASTER_BEHAVIOUR_DOC.md`
- `MARKET_RESEARCH_PLAYSTORE.md`
- `docs/backend/BACKEND_MASTER_SPEC.md`
- `docs/backend/BACKEND_MODULE_BOUNDARIES.md`
- `docs/frontend/FRONTEND_CONTENT_SYSTEM.md`
- `docs/frontend/FRONTEND_BACKEND_CONTENT_MAPPING.md`
- `docs/frontend/FRONTEND_PATTERN_LIBRARY.md`

## Purpose
This document converts backend module capability into frontend feature surfaces with clear commercial value.

The previous content-system mapping defined how insight should be written, but it did not fully define what each module sells as a product feature. This mapping corrects that gap.

## Core Rule
Every frontend module must expose a feature, not just an insight.

Feature flow:

`Module capability -> Commercial job -> Frontend feature surface -> Evidence -> Priority -> Action`

## Commercial Product Rule
The frontend must not present modules as passive dashboards. Each module must make the user feel they are using an operating system for SEO / ASO execution.

Each module screen must answer:
- What commercial job does this module perform?
- What decision does it help the user make?
- What evidence supports the decision?
- What action should the user take now?
- What value does this feature create?

## Module 1: Review Analysis

### Backend Capability
- complaint clustering
- feature request detection
- review summary generation
- prioritized review actions

### Backend Action Types
- `investigate_complaint_cluster`
- `evaluate_feature_request_pattern`
- `review_analysis_follow_up`

### Commercial Job
Turn customer feedback into product, trust, and conversion decisions.

### Frontend Feature Surfaces
- Complaint Risk Board
- Feature Request Demand Map
- Trust Damage Priority
- Review Action Queue

### Required Screen Blocks
- top complaint cluster
- complaint severity and recurrence
- sample evidence
- feature request opportunity
- highest-priority review action

### Commercial Value
The user can identify what customer feedback is damaging growth and what review-derived work should be done first.

### Demo Data Requirement
Use review clusters, severity, recurrence, sample comments, feature-request count, and priority action.

## Module 2: Content / Listing Insights

### Backend Capability
- website content quality analysis
- app listing quality analysis
- keyword coverage gap detection
- prioritized content/listing actions

### Backend Action Types
- `improve_listing_quality`
- `improve_content_quality`
- `content_listing_follow_up`

### Commercial Job
Turn listing and content weaknesses into conversion and discoverability improvements.

### Frontend Feature Surfaces
- Listing Quality Gap Board
- Metadata Coverage Map
- Opening Copy Weakness Detector
- Content Rewrite Queue

### Required Screen Blocks
- listing quality score context
- missing keyword coverage
- weak section diagnosis
- rewrite priority
- next content action

### Commercial Value
The user can see which listing or content section is limiting visibility or conversion and what to rewrite first.

### Demo Data Requirement
Use missing keywords, weak section, severity, affected surface, rewrite action, and follow-up validation action.

## Module 3: Keyword Analysis

### Backend Capability
- keyword suggestion generation
- opportunity banding
- high-opportunity keyword detection
- prioritized keyword actions

### Backend Action Types
- `prioritize_high_opportunity_keywords`
- `review_keyword_expansion_set`
- `keyword_analysis_follow_up`

### Commercial Job
Find keyword opportunities worth targeting now.

### Frontend Feature Surfaces
- Opportunity Keyword Board
- Keyword Expansion Set
- High-Intent Target List
- Keyword Action Priority

### Required Screen Blocks
- high-opportunity keywords
- opportunity score or band
- intent/use case
- recommended placement
- follow-up optimization action

### Commercial Value
The user can identify which keywords deserve listing, metadata, content, or creative work.

### Demo Data Requirement
Use keyword, band, movement, intent, opportunity reason, recommended placement, and priority.

## Module 4: Rank Tracking

### Backend Capability
- position tracking
- decline detection
- improvement detection
- rank movement summary
- prioritized rank actions

### Backend Action Types
- `investigate_rank_decline`
- `reinforce_rank_improvement`
- `review_rank_tracking_summary`

### Commercial Job
Protect ranking gains and respond to losses before they become revenue or visibility loss.

### Frontend Feature Surfaces
- Rank Decline Watchlist
- Gain Protection Board
- Movement Priority Feed
- Rank Recovery Action Queue

### Required Screen Blocks
- top decline
- top improvement
- tracked coverage summary
- decline cause hypothesis
- recovery or protection action

### Commercial Value
The user can decide whether to recover declining terms, protect winners, or expand into new targets.

### Demo Data Requirement
Use keyword, previous position, current position, movement, severity, evidence count, and action.

## Module 5: Competitor Analysis

### Backend Capability
- competitor comparison
- pressure scoring
- strongest gap dimension detection
- competitor monitoring
- prioritized competitive gap actions

### Backend Action Types
- `competitive_gap_action`
- `competitor_monitoring_action`

### Commercial Job
Show where competitors are beating the target and what gap should be closed first.

### Frontend Feature Surfaces
- Competitor Pressure Map
- Strongest Gap Detector
- Rival Advantage Board
- Competitive Response Queue

### Required Screen Blocks
- competitor pressure score
- strongest gap dimension
- keyword/content/rank/review gap
- recommended competitive response
- monitoring action

### Commercial Value
The user can understand which competitor threat matters commercially and which gap needs action.

### Demo Data Requirement
Use competitor ref, pressure score, strongest dimension, gap values, and response action.

## Module 6: Optimization Layer

### Backend Capability
- section optimization analysis
- metadata completeness checks
- keyword coverage checks
- thin content detection
- prioritized optimization actions

### Backend Action Types
- `optimization_improvement_action`
- `optimization_monitoring_action`

### Commercial Job
Turn upstream intelligence into specific execution guidance.

### Frontend Feature Surfaces
- Optimization Workbench
- Section Fix Queue
- Metadata Completion Board
- Keyword Coverage Repair Plan

### Required Screen Blocks
- section requiring optimization
- issue type
- missing keyword count
- metadata coverage
- concrete fix action

### Commercial Value
The user gets execution-ready work instead of needing to interpret upstream analysis manually.

### Demo Data Requirement
Use section ref, issue list, missing keyword count, metadata coverage, priority, and fix action.

## Module 7: Creative / Messaging Layer

### Backend Capability
- creative asset critique
- messaging gap detection
- theme alignment checks
- CTA checks
- prioritized messaging suggestions

### Backend Action Types
- `messaging_suggestion_action`
- `messaging_monitoring_action`

### Commercial Job
Improve conversion by making creative and messaging clearer, more aligned, and more actionable.

### Frontend Feature Surfaces
- Creative Critique Board
- Message Alignment Map
- CTA Gap Detector
- Screenshot Copy Fix Queue

### Required Screen Blocks
- asset needing work
- primary messaging issue
- matched or missing themes
- CTA or headline gap
- rewrite action

### Commercial Value
The user can improve conversion-facing creative without guessing what message is weak.

### Demo Data Requirement
Use asset ref, headline, issue list, matched themes, audience signal count, and rewrite action.

## Module 8: Unified Workflow Layer

### Backend Capability
- cross-module action consolidation
- priority ordering
- module summary generation
- workflow coordination actions

### Backend Action Types
- `unified_workflow_action`
- `workflow_coordination_action`

### Commercial Job
Convert fragmented SEO / ASO tools into one prioritized operating workflow.

### Frontend Feature Surfaces
- Unified Action Queue
- Cross-Module Priority Stack
- Execution Sequence
- Workflow Coordination Board

### Required Screen Blocks
- top actions across modules
- source module
- priority
- reference/evidence
- execution sequence
- coordination action

### Commercial Value
The user gets one next-best-action workflow instead of disconnected analytics modules.

### Demo Data Requirement
Use source module, action type, priority, evidence, dependency, and execution order.

## Frontend Rewiring Requirements

### Replace Generic Insight Emphasis
Generic cards are not enough. Existing insight cards can remain as a supporting pattern, but module screens must lead with feature surfaces.

### Add Feature-Level Demo Models
The frontend should add demo models for:
- feature value proposition
- commercial job
- decision supported
- evidence metrics
- priority reason
- action type
- next action

### Add Shared Feature Components
Required components:
- `FeatureHeroCard`
- `FeatureEvidenceBoard`
- `FeatureActionCard`
- `CommercialValueStrip`
- `ModuleDecisionMap`

### Screen-Level Change
Each module screen should be structured as:
- feature promise
- decision board
- evidence board
- priority/action queue
- supporting insight details

### MVP Rule
MVP-active modules must show complete feature surfaces:
- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking

### Gated Rule
Gated modules must still show feature previews with commercial value:
- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer

Gated screens must not look like empty scaffolds. They should communicate what the feature will commercially do when activated.

## Implementation Batches

### Batch 1: Feature Data Model
Create frontend models that represent module features, evidence, commercial value, decisions, and actions.

### Batch 2: Shared Feature Components
Build reusable components for feature promise, evidence, and action mapping.

### Batch 3: MVP Module Rewire
Apply full feature surfaces to:
- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking

### Batch 4: Gated Module Feature Preview
Apply feature-value previews to:
- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer

### Batch 5: Dashboard and Workflow Consolidation
Rebuild dashboard content around cross-module commercial decisions and next-best-action flow.

## Acceptance Checklist
- Each module has a named commercial feature surface.
- Each module maps backend action types to frontend actions.
- Each module shows what user decision is being supported.
- Each module shows why the feature matters commercially.
- MVP modules do not look like generic dashboards.
- Gated modules do not look like empty placeholders.
- Unified workflow shows one prioritized action path across modules.
