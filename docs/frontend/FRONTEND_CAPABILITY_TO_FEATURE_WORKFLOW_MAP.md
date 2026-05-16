# Frontend Capability To Feature Workflow Map

## Purpose
This document turns audited backend capabilities into deterministic frontend features, archetype subpages, workflows, and outcomes.

It must be updated after each module capability audit and before any UI implementation for that module.

## Anchors
- `docs/frontend/FRONTEND_BACKEND_CAPABILITY_AUDIT.md`
- `docs/frontend/FRONTEND_MODULE_FEATURE_MAPPING.md`
- `docs/frontend/PHASE_01_ARCHETYPES_AND_MAPPING.md`
- `docs/frontend/FRONTEND_CONTENT_SYSTEM.md`

## Mapping Rule
The mapping sequence is:

`Capability -> Screen Surface -> Archetype Subpage -> Feature -> Workflow Step -> Outcome`

No feature should be added unless it traces back to an audited backend capability.

## UI Simplicity Rule
The parent module screen should stay simple.

Use parent screens for:
- module purpose
- commercial feature list
- one-line feature descriptions
- navigation into subpages

Use archetype subpages for:
- cluster lists
- evidence samples
- setup details
- action queues
- detailed scoring or diagnosis

## Current Parent Screen Baseline
Before capability subpages are implemented, each module page should show only:
- a plain-language module header
- the commercial features available in that module
- one short line explaining what each feature does

No backend language, action type names, scoring formulas, or process chains should appear on parent screens.

The current visual/system baseline for those parent screens is defined in `CURRENT_UI_BASELINE.md`.

## Module 1: Review Analysis

### Parent Screen
Screen:
- `Review Analysis`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show the highest-risk review issue and the next response/product task

Parent surface:
- Feature: `Review issues that can hurt trust`
- Top issue: highest-severity complaint cluster
- Top action: highest-priority review action
- Secondary signal: feature-request count or review count

### Subpage Map

#### Subpage RA-SP-01: Complaint Clusters
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- RA-03 Severity Scoring
- RA-04 Complaint Cluster Matching
- RA-07 Complaint Insight Generation

Feature:
- `Complaint themes`

User job:
- understand which repeated complaints need attention

Workflow step:
- inspect complaint theme

Outcome:
- user identifies the trust or product issue to fix

#### Subpage RA-SP-02: Complaint Cluster Detail
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- RA-03 Severity Scoring
- RA-04 Complaint Cluster Matching
- RA-07 Complaint Insight Generation
- RA-11 Complaint Action Creation

Feature:
- `Complaint detail`

User job:
- review evidence and decide corrective response

Workflow step:
- inspect samples
- confirm severity
- define fix or response

Outcome:
- complaint cluster becomes an actionable response/product task

#### Subpage RA-SP-03: Feature Requests
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- RA-05 Feature Request Detection
- RA-08 Feature Request Insight Generation
- RA-12 Feature Request Action Creation

Feature:
- `Requested by users`

User job:
- identify recurring product requests worth roadmap review

Workflow step:
- review request demand
- decide roadmap or messaging treatment

Outcome:
- recurring review demand becomes roadmap or messaging input

#### Subpage RA-SP-04: Review Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- RA-10 Review Action Prioritization
- RA-11 Complaint Action Creation
- RA-12 Feature Request Action Creation
- RA-13 Review Follow-Up Action

Feature:
- `Review tasks`

User job:
- decide the order of review-driven work

Workflow step:
- choose top action
- complete response/product task
- re-run or monitor

Outcome:
- review intelligence becomes a prioritized task sequence

#### Subpage RA-SP-05: Review Source Setup
Archetype:
- Configuration Archetype

Backed by capabilities:
- RA-01 Review Input Normalization
- RA-02 Product Target Resolution
- RA-14 Integration Intake Resolution
- RA-15 Full Module Flow Output

Feature:
- `Review source status`

User job:
- confirm review data is connected and usable

Workflow step:
- check source
- connect adapter or provide direct reviews
- confirm target

Outcome:
- review analysis has reliable input before decisions are made

### Review Workflow
Workflow:
- source reviews
- detect complaint themes
- detect feature requests
- prioritize review actions
- inspect detail subpage
- execute response/product task
- re-run analysis after changes

Outcome:
- user protects trust and converts review feedback into product or messaging work

### Review Implementation Gate
Before UI changes:
- approve Review Analysis capability audit
- approve Review Analysis subpage map
- decide whether subpages are routes, tabs, or nested panels

Recommended first implementation:
- keep parent screen simple
- add subpage navigation cards below the top feature
- implement placeholder archetype subpages with audited capability names and demo data

## Pending Module Maps
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking
- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer
