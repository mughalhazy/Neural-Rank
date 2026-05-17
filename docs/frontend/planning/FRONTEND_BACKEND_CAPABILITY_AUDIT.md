# Frontend Backend Capability Audit

## Purpose
This document is the deterministic source of truth for backend capability extraction before UI projection.

The frontend must not invent module capabilities. Each capability must be extracted from backend code, then projected into the existing UI framework, content system, and archetype subpages.

## Anchors
- `docs/product/MASTER_BUILD_SPEC.md`
- `docs/backend/reference/BACKEND_MASTER_SPEC.md`
- `docs/backend/reference/BACKEND_MODULE_BOUNDARIES.md`
- `docs/frontend/phases/PHASE_01_ARCHETYPES_AND_MAPPING.md`
- `docs/frontend/reference/FRONTEND_MODULE_FEATURE_MAPPING.md`
- `docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md`

## Deterministic Audit Protocol
For each module:
- inspect backend `analysis.js`
- inspect backend `insights.js`
- inspect backend `actions.js`
- inspect backend `service.js`
- inspect repository and tests where needed
- extract only actual implemented capabilities
- map each capability to input, analysis, insight, priority, and action
- identify frontend archetype subpages needed
- submit findings before UI changes

## Projection Rule
Capabilities should not be forced into one crowded module screen.

Each module gets:
- one parent screen
- focused archetype subpages for capability depth

Parent screen role:
- show top feature
- show top evidence
- show top action
- link into subpages

Subpage role:
- handle one capability deeply
- show evidence and action without cluttering the parent screen

## Module 1: Review Analysis

### Backend Files Audited
- `backend/src/modules/review-analysis/analysis.js`
- `backend/src/modules/review-analysis/insights.js`
- `backend/src/modules/review-analysis/actions.js`
- `backend/src/modules/review-analysis/service.js`

### Backend Module Key
`review_analysis`

### Implemented Backend Capabilities

#### Capability RA-01: Review Input Normalization
Source:
- `normalizeReviewInput`
- `normalizeReviews`
- `normalizeReviewAnalysisInput`

What it does:
- accepts review strings
- accepts review objects
- resolves review text from `text`, `content`, or `review`
- resolves review id from `reviewId`, `id`, or generated fallback
- normalizes rating to number or null
- assigns source fallback as `direct_input`
- filters empty or invalid reviews

Input:
- direct `reviews`
- adapter-provided `reviews`

Output:
- normalized review list

Frontend projection:
- parent screen should show whether reviews are connected or supplied directly
- subpage should expose source/readiness state only when user needs setup detail

Archetype subpage:
- Configuration Archetype subpage: `Review Source Setup`

UI implication:
- do not show raw normalized input on the Review parent screen
- show only source status and review count

#### Capability RA-02: Product Target Resolution
Source:
- `resolveProductTarget`

What it does:
- resolves `targetRef`
- resolves `targetType`
- supports website URL, app URL, app id, app store URL, Play Store URL
- falls back to `unknown_target`

Input:
- `targetRef`
- `websiteUrl`
- `appUrl`
- `appId`
- `appStoreUrl`
- `playStoreUrl`

Output:
- normalized product target object

Frontend projection:
- Review parent screen should name the active app/listing target
- setup or settings subpage should own target editing

Archetype subpage:
- Configuration Archetype subpage: `Target Setup`

UI implication:
- target metadata should not compete with review findings on the parent screen

#### Capability RA-03: Severity Scoring
Source:
- `calculateSeverityScore`

What it does:
- adds severity for ratings of 1-2
- adds lower severity for rating 3
- adds severity for crash, broken, not working, cannot
- adds severity for slow, lag, delay

Input:
- review text
- review rating

Output:
- severity score

Frontend projection:
- show severity as user-facing risk level
- hide numeric scoring formula unless in detail view

Archetype subpage:
- Detail Drilldown Archetype subpage: `Complaint Severity Detail`

UI implication:
- parent screen should say `High trust risk`, not `severityScore: 7`

#### Capability RA-04: Complaint Cluster Matching
Source:
- `CLUSTER_DEFINITIONS`
- `getMatchedClusters`
- `buildComplaintClusters`

Implemented clusters:
- Performance
- Stability
- UX
- Billing
- Support

What it does:
- matches review text against fixed cluster keyword lists
- counts evidence per cluster
- accumulates severity score
- stores review ids
- stores up to 3 sample reviews
- sorts clusters by severity then evidence count

Input:
- normalized reviews

Output:
- complaint clusters

Frontend projection:
- parent screen should show the highest-risk complaint cluster
- subpage should show all complaint clusters and samples

Archetype subpages:
- Analysis Feed Archetype subpage: `Complaint Clusters`
- Detail Drilldown Archetype subpage: `Complaint Cluster Detail`

UI implication:
- do not show all clusters on the parent unless space permits
- parent should show one primary complaint and one secondary count

#### Capability RA-05: Feature Request Detection
Source:
- `FEATURE_REQUEST_MARKERS`
- `buildFeatureRequests`

Markers:
- `please add`
- `please include`
- `would like`
- `wish`
- `need`
- `could you add`
- `it would be great`
- `feature request`

What it does:
- identifies reviews that contain feature-request language
- stores request summary
- attaches severity score

Input:
- normalized reviews

Output:
- feature request records

Frontend projection:
- parent screen can show feature request count if commercially relevant
- subpage should own demand/request review

Archetype subpages:
- Analysis Feed Archetype subpage: `Feature Requests`
- Detail Drilldown Archetype subpage: `Feature Request Detail`

UI implication:
- feature requests should become roadmap or messaging opportunities, not generic insight cards

#### Capability RA-06: Review Summary
Source:
- `buildSummary`
- `analyzeReviews`

What it does:
- counts reviews
- calculates average rating when ratings exist
- counts complaint clusters
- counts feature requests
- identifies highest-severity cluster key

Input:
- reviews
- complaint clusters
- feature requests

Output:
- review summary

Frontend projection:
- parent screen should show review count and highest-risk issue
- subpage can show full summary and history

Archetype subpage:
- Dashboard Archetype subpage: `Review Summary`

UI implication:
- summary should answer readiness and risk, not become a dashboard of raw stats

#### Capability RA-07: Complaint Insight Generation
Source:
- `createComplaintInsight`
- `generateReviewInsights`

What it does:
- converts complaint clusters into insights
- sets severity high when severity score is at least 5
- includes cluster key, title, summary, evidence count, severity score, and sample reviews

Input:
- complaint clusters

Output:
- complaint insights

Frontend projection:
- parent screen should convert insight into plain-language issue
- detail subpage should show samples and evidence

Archetype subpage:
- Detail Drilldown Archetype subpage: `Complaint Insight Detail`

UI implication:
- user-facing copy should not expose cluster keys unless they are readable labels

#### Capability RA-08: Feature Request Insight Generation
Source:
- `createFeatureRequestInsight`

What it does:
- creates feature-request insight when feature requests exist
- severity is medium when at least 3 requests exist, otherwise low
- includes sample requests

Input:
- feature request records

Output:
- feature request insight

Frontend projection:
- subpage should group requests by opportunity
- parent can show this only when it competes with complaint risk

Archetype subpage:
- Analysis Feed Archetype subpage: `Feature Request Demand`

UI implication:
- feature-request insight should become `requested by users`, not `feature_request_pattern`

#### Capability RA-09: Review Summary Insight
Source:
- `createSummaryInsight`

What it does:
- creates summary insight
- marks high severity if average rating is at or below 2.5
- includes review count, complaint cluster count, and feature request count

Input:
- review summary

Output:
- review summary insight

Frontend projection:
- parent screen can use this as health context
- should not be shown as a separate noisy card unless it changes action

Archetype subpage:
- Dashboard Archetype subpage: `Review Health`

UI implication:
- summary insight belongs in compact status context

#### Capability RA-10: Review Action Prioritization
Source:
- `toPriority`
- `prioritizeReviewActions`

What it does:
- converts insight evidence and severity into priority
- high priority threshold is score >= 8
- medium priority threshold is score >= 4
- sorts actions by priority, then title

Input:
- review insights

Output:
- priority payload
- actions payload

Frontend projection:
- parent screen should show one top review action
- subpage should show full ordered review action queue

Archetype subpages:
- Analysis Feed Archetype subpage: `Review Action Queue`
- Detail Drilldown Archetype subpage: `Action Detail`

UI implication:
- action priority should use user language: `Do first`, `Do next`, `Monitor`

#### Capability RA-11: Complaint Action Creation
Source:
- `createComplaintAction`

Action type:
- `investigate_complaint_cluster`

What it does:
- creates action to investigate recurring complaint cluster
- includes priority
- includes cluster key
- includes evidence count, severity score, and sample reviews

Frontend projection:
- parent screen primary action should come from highest-priority complaint action
- detail subpage should show sample reviews and corrective response task

Archetype subpage:
- Detail Drilldown Archetype subpage: `Complaint Action`

UI implication:
- wording should be `Review this complaint and plan the fix`, not backend action type

#### Capability RA-12: Feature Request Action Creation
Source:
- `createFeatureRequestAction`

Action type:
- `evaluate_feature_request_pattern`

What it does:
- creates action to assess recurring feature requests
- includes priority
- includes sample requests

Frontend projection:
- feature request subpage should turn this into roadmap or messaging review

Archetype subpage:
- Analysis Feed Archetype subpage: `Feature Request Queue`

UI implication:
- user-facing action should be `Decide if this belongs on the roadmap`

#### Capability RA-13: Review Follow-Up Action
Source:
- `createSummaryAction`

Action type:
- `review_analysis_follow_up`

What it does:
- if reviews exist, recommends re-running analysis after corrective changes
- if reviews do not exist, recommends collecting more review input
- priority is low

Frontend projection:
- parent screen should not show this unless no higher-priority action exists
- empty state should use this capability when no reviews are available

Archetype subpage:
- Empty State path in Analysis Feed Archetype

UI implication:
- follow-up belongs in empty/monitoring state, not primary action

#### Capability RA-14: Integration Intake Resolution
Source:
- `resolveIntegrationInput`

What it does:
- uses direct review input when provided
- otherwise resolves registered module adapter
- supports `adapter.normalizeInput`
- supports `adapter.collect`
- returns `integration_not_connected` fallback when no adapter exists

Frontend projection:
- settings/source subpage should expose connection status
- parent screen should show only concise readiness

Archetype subpage:
- Configuration Archetype subpage: `Review Integration`

UI implication:
- avoid showing adapter technical states on the parent screen

#### Capability RA-15: Full Module Flow Output
Source:
- `runReviewAnalysis`

What it does:
- runs intake
- runs analysis
- generates insights
- prioritizes actions
- persists run
- returns complete flow:
  - input
  - analysis
  - insight
  - priority
  - action
- returns module stage statuses
- returns integration status

Frontend projection:
- parent screen uses the final flow to show top issue and top action
- subpages use flow parts for detail

Archetype subpage:
- Parent: Analysis Feed Archetype
- Subpages:
  - Complaint Clusters
  - Feature Requests
  - Review Action Queue
  - Review Source Setup

UI implication:
- flow is backend structure, not user copy

### Review Analysis Parent Screen Recommendation
The parent Review Analysis screen should be simple:
- feature card: `Review issues that can hurt trust`
- top issue: highest-severity complaint cluster
- top action: highest-priority review action
- one compact secondary signal: feature-request count or review count
- links to subpages

### Review Analysis Archetype Subpages
- `Complaint Clusters`
- `Complaint Cluster Detail`
- `Feature Requests`
- `Review Action Queue`
- `Review Source Setup`

### Review Analysis UI Guardrails
- no backend action type names in visible UI
- no raw severity scores on parent screen
- no full process flow on parent screen
- no more than one primary action on parent screen
- samples belong in detail subpages
- feature requests should be framed as roadmap demand, not generic feedback

## Pending Modules — Phase 1 (original 8)
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking
- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer

## Pending Modules — Phase 2 expansion (10 new backend modules)
These modules are fully implemented in the backend (`backend_active`). Capability audit must be completed before any Phase 2 frontend screens are built.

- Technical SEO Audit (`technical_seo_audit`) — crawl health, CWV scoring, robots/sitemap, structured data
- On-Page SEO Scorer (`on_page_seo_scorer`) — per-page on-page signal scoring, title/meta/heading/keyword analysis
- Backlink Intelligence (`backlink_intelligence`) — authority scoring, toxicity risk, anchor distribution, link acquisition
- E-E-A-T Signals (`eeat_signals`) — author/expertise signals, trust markers, site-level authority
- Search Intent Classifier (`search_intent_classifier`) — 4-intent taxonomy, content-format alignment recommendations
- SERP Feature Analyzer (`serp_feature_analyzer`) — feature presence, ownership gaps, schema/content recommendations
- Topical Authority (`topical_authority`) — topic cluster coverage, gap detection, content plan prioritization
- Site Architecture (`site_architecture`) — crawl depth, internal link gaps, URL structure, orphaned pages
- Analytics Integration (`analytics_integration`) — GSC + GA4 ingestion, cross-signal correlation, CTR/traffic actions
- Local SEO (`local_seo`) — NAP consistency, GMB completeness, geo-rank factors (opt-in only)
