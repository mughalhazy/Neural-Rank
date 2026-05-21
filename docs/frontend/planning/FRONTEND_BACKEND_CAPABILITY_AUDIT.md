# Frontend Backend Capability Audit

## Purpose
This document is the deterministic source of truth for backend capability extraction before UI projection.

The frontend must not invent module capabilities. Each capability must be extracted from backend code, then projected into the existing UI framework, content system, and archetype subpages.

## Anchors
- `ops/MASTER_BUILD_SPEC.md`
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

## Module 2: Content / Listing Insights

### Backend Files Audited
- `backend/src/modules/content-listing-insights/analysis.js`
- `backend/src/modules/content-listing-insights/insights.js`
- `backend/src/modules/content-listing-insights/actions.js`
- `backend/src/modules/content-listing-insights/service.js`

### Backend Module Key
`content_listing_insights`

### Implemented Backend Capabilities

#### Capability CLI-01: Content Input Normalization
Source:
- `normalizeContentInput`
- `buildWebsiteContent`
- `buildListingContent`

What it does:
- accepts website content via `pageTitle`, `metaDescription`, `bodyText`, `headings`, or nested `content` object
- accepts listing content via `listingTitle`, `shortDescription`, `description`, or nested `listing` object
- normalizes keywords from multiple field aliases
- builds combined text string for coverage analysis

Input:
- website content fields
- listing content fields
- target keywords

Output:
- normalized content and listing objects

Frontend projection:
- parent screen should show whether content or listing is connected
- show content source status and field completeness

Archetype subpage:
- Configuration Archetype subpage: `Content Source Setup`

UI implication:
- do not expose normalization internals on parent screen

#### Capability CLI-02: Keyword Coverage Analysis
Source:
- `computeKeywordCoverage`
- `analyzeWebsiteContent`
- `analyzeListingContent`

What it does:
- computes coverage ratio of target keywords against combined content text
- identifies matched and missing keywords
- flags low coverage when ratio is below 0.5

Input:
- combined content text
- keyword list

Output:
- coverage ratio
- matched keywords
- missing keywords

Frontend projection:
- parent screen should show coverage signal as gap or pass
- subpage should show specific missing keywords

Archetype subpage:
- Analysis Feed Archetype subpage: `Keyword Coverage Gaps`

UI implication:
- use plain language: `missing from your listing copy`, not `coverageRatio: 0.3`

#### Capability CLI-03: Website Content Quality Analysis
Source:
- `analyzeWebsiteContent`

What it does:
- detects missing title, summary, or body blocks
- checks body length threshold of 120 characters
- measures readability tier via average sentence length
- detects E-E-A-T experience markers and citation markers
- detects structured content patterns (lists, tables, headings)
- counts word count

Observations produced:
- missing title block
- missing summary block
- missing body block
- weak keyword coverage
- body too thin

Frontend projection:
- parent screen shows one primary quality finding
- detail subpage shows all observations

Archetype subpage:
- Detail Drilldown Archetype subpage: `Website Content Quality`

UI implication:
- quality findings should be framed as rewrite targets, not structural reports

#### Capability CLI-04: App Listing Quality Analysis
Source:
- `analyzeListingContent`

What it does:
- detects missing title, short description, or long description
- checks description length threshold of 120 characters
- computes listing keyword coverage
- measures readability tier
- detects structured content in description

Frontend projection:
- parent screen should surface top listing quality gap
- subpage should show all listing observations

Archetype subpage:
- Detail Drilldown Archetype subpage: `Listing Quality Detail`

UI implication:
- frame findings as copy issues, not technical validation failures

#### Capability CLI-05: E-E-A-T Content Signal Detection
Source:
- `EEAT_EXPERIENCE_MARKERS`
- `EEAT_CITATION_MARKERS`
- `analyzeWebsiteContent`
- `createEeatContentInsight`

Markers detected:
- experience: `i found`, `in my experience`, `i tested`, `we tested`, `our team`, etc.
- citations: `according to`, `study shows`, `research shows`, `source:`, etc.

What it does:
- counts first-hand experience markers in body text
- counts citation markers in body text
- flags absence of both as weak E-E-A-T signal

Frontend projection:
- subpage should surface E-E-A-T gap as content improvement opportunity
- parent can show this when content is otherwise structurally complete

Archetype subpage:
- Analysis Feed Archetype subpage: `E-E-A-T Content Signals`

UI implication:
- use `Add author experience and source references` not `eeAtSignals: 0`

#### Capability CLI-06: Competitor Content Depth Comparison
Source:
- `analyzeCompetitorDepth`
- `createCompetitorDepthInsight`

What it does:
- accepts competitor word counts as array
- computes average competitor word count
- compares target word count against average
- flags content as below average with word gap

Input:
- target word count
- competitor word counts

Output:
- average competitor word count
- gap in words
- below-average flag

Frontend projection:
- parent screen can show depth gap as a single competitive signal
- subpage should show gap value and competitor benchmark

Archetype subpage:
- Detail Drilldown Archetype subpage: `Content Depth Comparison`

UI implication:
- show `Your content is 420 words shorter than competitors`, not raw gap number

#### Capability CLI-07: Content Listing Insights Generation
Source:
- `generateContentListingInsights`
- `createGapInsight`
- `createSummaryInsight`
- `createEeatContentInsight`
- `createCompetitorDepthInsight`

What it does:
- generates website content gap insight
- generates app listing gap insight
- generates E-E-A-T signal insight when signals are absent
- generates competitor depth insight when below average
- generates summary insight combining all observation counts

Frontend projection:
- parent screen uses highest-severity insight as primary finding
- subpages handle detail per insight type

Archetype subpage:
- Analysis Feed Archetype

UI implication:
- insights should convert to plain-language copy issues

#### Capability CLI-08: Content Listing Action Prioritization
Source:
- `prioritizeContentListingActions`
- `createActionFromInsight`

Action types:
- `add_eeat_content_signals`
- `expand_content_to_competitor_depth`
- `improve_listing_quality`
- `improve_content_quality`
- `content_listing_follow_up`

What it does:
- converts each insight into a specific action
- prioritizes by evidence count and severity score
- high priority threshold is combined score 4+
- sorts actions by priority then title

Frontend projection:
- parent screen shows top content action
- subpage shows full ordered action queue

Archetype subpages:
- Analysis Feed Archetype subpage: `Content Action Queue`

UI implication:
- action copy should be concrete rewrites, not backend type names

#### Capability CLI-09: Integration Intake Resolution
Source:
- `resolveIntegrationInput`
- `runContentListingInsights`

What it does:
- uses direct content input when combined text is present
- otherwise resolves registered module adapter
- returns `integration_not_connected` when no adapter found
- returns complete flow: input, analysis, insight, priority, action

Frontend projection:
- parent screen shows source status
- configuration subpage handles adapter setup

Archetype subpage:
- Configuration Archetype subpage: `Content Source Setup`

UI implication:
- do not expose adapter status codes on parent screen

### Content Listing Insights Parent Screen Recommendation
The parent screen should show:
- feature card: `Content and listing gaps that affect ranking and conversion`
- top finding: highest-severity content or listing gap
- top action: highest-priority content action
- one compact signal: keyword coverage status or competitor depth gap
- links to subpages

### Content Listing Insights Archetype Subpages
- `Keyword Coverage Gaps`
- `Website Content Quality`
- `Listing Quality Detail`
- `E-E-A-T Content Signals`
- `Content Depth Comparison`
- `Content Action Queue`
- `Content Source Setup`

### Content Listing Insights UI Guardrails
- no raw coverage ratios on parent screen
- no field-level observations on parent screen
- no backend action type names in visible UI
- keyword gaps should be framed as rewrite targets
- E-E-A-T findings should be framed as content improvement opportunities

---

## Module 3: Keyword Analysis

### Backend Files Audited
- `backend/src/modules/keyword-analysis/analysis.js`
- `backend/src/modules/keyword-analysis/insights.js`
- `backend/src/modules/keyword-analysis/actions.js`
- `backend/src/modules/keyword-analysis/service.js`

### Backend Module Key
`keyword_analysis`

### Implemented Backend Capabilities

#### Capability KA-01: Keyword Input Normalization
Source:
- `normalizeKeywordInput`
- `normalizeKeywordEntry`

What it does:
- accepts keyword strings or objects
- resolves keyword text from `keyword`, `term`, or `query`
- resolves position from `position` or `rank`
- resolves volume from `volume` field
- resolves `volumePrevious` for trend computation
- resolves `serpFeaturePresent` from features array or boolean

Output:
- normalized keyword list with position, difficulty, volume, volumePrevious, serpFeaturePresent

Frontend projection:
- parent screen shows connected keyword count
- configuration subpage handles source setup

Archetype subpage:
- Configuration Archetype subpage: `Keyword Source Setup`

UI implication:
- show `47 keywords tracked` not raw normalization fields

#### Capability KA-02: Seed Expansion
Source:
- `buildSeedExpansions`
- `buildKeywordSuggestions`

What it does:
- takes top 3 high-volume keywords as seeds
- extracts tokens longer than 3 characters
- generates expansion candidates with suffixes: guide, tips, tool, software, platform, strategy, best practices
- generates long-tail variants with `strategy` suffix for multi-token keywords

Frontend projection:
- subpage should show expansion candidates as opportunity set
- parent does not need to show raw expansions

Archetype subpage:
- Analysis Feed Archetype subpage: `Keyword Expansion Set`

UI implication:
- expansions should be shown as `Keywords to consider` not raw seed logic

#### Capability KA-03: Opportunity Scoring
Source:
- `buildKeywordSuggestions`
- `classifyOpportunities`

What it does:
- computes opportunity score from rank factor, difficulty factor, volume factor, and trend bonus
- classifies quick win when position is 11-20
- classifies opportunity band as high (>=8), medium (>=5), or low
- classifies intent signal using `classifyIntent`

Output:
- opportunity score
- opportunity band
- opportunity tier (quick_win or null)
- trend direction
- intent signal

Frontend projection:
- parent screen shows top high-opportunity keyword
- subpage shows opportunity band groupings

Archetype subpage:
- Analysis Feed Archetype subpage: `Keyword Opportunity Bands`

UI implication:
- show `High opportunity: 12 keywords` not raw score values

#### Capability KA-04: Trend Direction Classification
Source:
- `computeTrendDirection`

What it does:
- computes delta between current and previous volume
- classifies as `rising` when delta exceeds 10% of previous
- classifies as `declining` when drop exceeds 10% of previous
- classifies as `stable` otherwise

Frontend projection:
- parent screen can show trend direction for top keyword
- subpage shows trend direction per keyword

Archetype subpage:
- Analysis Feed Archetype subpage: `Keyword Trends`

UI implication:
- show `rising demand` not `trendDirection: rising`

#### Capability KA-05: Quick Win Detection
Source:
- `createQuickWinInsight`
- `buildKeywordSuggestions`

What it does:
- identifies keywords at positions 11-20 as quick win candidates
- generates insight when quick wins exist
- severity is high
- stores keyword list up to 5

Frontend projection:
- parent screen should highlight quick win cluster if present
- subpage shows full list with action guidance

Archetype subpage:
- Detail Drilldown Archetype subpage: `Quick Win Keywords`

UI implication:
- frame as `Closest to page 1`, not `opportunityTier: quick_win`

#### Capability KA-06: Rising Keyword Insight
Source:
- `createRisingKeywordInsight`

What it does:
- filters direct-input keywords with rising trend direction
- generates insight when rising keywords exist
- severity is medium

Frontend projection:
- subpage shows rising keyword list with early action recommendation

Archetype subpage:
- Analysis Feed Archetype subpage: `Rising Keywords`

UI implication:
- frame as `Capture now before competition intensifies`

#### Capability KA-07: High Opportunity Insight
Source:
- `createHighOpportunityInsight`

What it does:
- filters keywords with high opportunity band
- severity is high when any high-opportunity keywords exist
- stores up to 5 keyword examples

Frontend projection:
- parent screen shows high-opportunity keyword count
- subpage shows full high-opportunity list

Archetype subpage:
- Analysis Feed Archetype subpage: `High Opportunity Keywords`

UI implication:
- show as `Keywords with the most room to grow`

#### Capability KA-08: Keyword Action Prioritization
Source:
- `prioritizeKeywordActions`
- `createActionFromInsight`

Action types:
- `prioritize_high_opportunity_keywords`
- `push_page2_keywords`
- `target_rising_keywords`
- `keyword_analysis_follow_up`
- `review_keyword_expansion_set`

What it does:
- high threshold at combined score 10+
- medium threshold at score 4+
- sorts by priority then title

Frontend projection:
- parent screen shows top keyword action
- subpage shows full action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Keyword Action Queue`

UI implication:
- action copy should be targeting or content decisions, not backend type names

### Keyword Analysis Parent Screen Recommendation
- feature card: `Keyword opportunities and risks`
- top finding: highest-opportunity or quick-win keyword cluster
- top action: push page 2 to page 1 or target rising keywords
- secondary signal: keyword count or opportunity band summary
- links to subpages

### Keyword Analysis Archetype Subpages
- `Keyword Opportunity Bands`
- `Quick Win Keywords`
- `Rising Keywords`
- `Keyword Expansion Set`
- `Keyword Action Queue`
- `Keyword Source Setup`

---

## Module 4: Rank Tracking

### Backend Files Audited
- `backend/src/modules/rank-tracking/analysis.js`
- `backend/src/modules/rank-tracking/insights.js`
- `backend/src/modules/rank-tracking/actions.js`
- `backend/src/modules/rank-tracking/service.js`

### Backend Module Key
`rank_tracking`

### Implemented Backend Capabilities

#### Capability RT-01: Rank Entry Normalization
Source:
- `normalizeRankInput`
- `normalizeRankEntry`

What it does:
- accepts rank entries via `rankEntries` or `ranks`
- resolves keyword from `keyword`, `term`, or `query`
- resolves current position from `currentPosition`, `currentRank`, or `position`
- resolves previous position from `previousPosition` or `previousRank`
- resolves clicks, impressions, ctr, and rankingUrl

Output:
- normalized rank entry list

Frontend projection:
- parent shows tracked keyword count
- configuration subpage handles data source

Archetype subpage:
- Configuration Archetype subpage: `Rank Data Source`

UI implication:
- show `52 keywords tracked` not field aliases

#### Capability RT-02: Movement Classification
Source:
- `classifyMovement`

What it does:
- classifies as `improved` when delta is positive
- classifies as `declined` when delta is negative
- classifies as `unchanged` when no change
- classifies as `new_tracking` when no previous position

Output:
- movementType
- delta

Frontend projection:
- parent screen shows movement direction for top keyword
- subpage shows movement type per keyword

Archetype subpage:
- Analysis Feed Archetype subpage: `Rank Movement`

UI implication:
- show movement direction with plain language: `Improving`, `Declining`, `Stable`, `New`

#### Capability RT-03: CTR Efficiency Scoring
Source:
- `expectedCtrByPosition`
- `ctrEfficiencyScore`
- `analyzeRankInput`

What it does:
- computes expected CTR based on rank position
- computes efficiency as actual-to-expected CTR ratio
- flags underperforming when efficiency is below 0.7
- identifies CTR underperformers list

Frontend projection:
- subpage should show CTR underperformers as title/meta rewrite targets
- parent can surface underperformer count

Archetype subpage:
- Detail Drilldown Archetype subpage: `CTR Underperformers`

UI implication:
- frame as `Ranking well but getting fewer clicks than expected`

#### Capability RT-04: Quick Win Position Detection
Source:
- `analyzeRankInput`
- `createQuickWinInsight`

What it does:
- identifies positions 11-20 as quick wins
- severity is high
- stores keyword list

Frontend projection:
- parent screen should show quick win count if present
- subpage shows quick win keywords with push action

Archetype subpage:
- Detail Drilldown Archetype subpage: `Page 2 Keywords`

UI implication:
- frame as `One push away from page 1`

#### Capability RT-05: Featured Snippet Detection
Source:
- `createPositionZeroInsight`

What it does:
- identifies position 0 entries as featured snippets
- severity is low
- stores keyword list

Frontend projection:
- subpage shows featured snippet keywords with protection action

Archetype subpage:
- Detail Drilldown Archetype subpage: `Featured Snippet Positions`

UI implication:
- frame as `Positions worth protecting`

#### Capability RT-06: Rank Decline Insight
Source:
- `createDeclineInsight`

What it does:
- identifies keyword with highest absolute decline
- severity is high when delta is >= 10 positions
- includes declined count as evidence

Frontend projection:
- parent screen shows top decline as urgent action trigger
- subpage shows full decline detail

Archetype subpage:
- Detail Drilldown Archetype subpage: `Rank Decline Detail`

UI implication:
- frame as `This keyword is losing ground` with position context

#### Capability RT-07: Rank Action Prioritization
Source:
- `prioritizeRankActions`
- `createActionFromInsight`

Action types:
- `investigate_rank_decline`
- `reinforce_rank_improvement`
- `push_page2_rankings`
- `optimise_titles_for_ctr`
- `protect_featured_snippets`
- `review_rank_tracking_summary`

Frontend projection:
- parent shows top rank action
- subpage shows full rank action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Rank Action Queue`

UI implication:
- action copy should be concrete recovery or protection decisions

### Rank Tracking Parent Screen Recommendation
- feature card: `Rank movement that needs a response`
- top finding: top decline or top quick win cluster
- top action: investigate decline or push page 2 keywords
- secondary signal: improved count or CTR underperformer count
- links to subpages

### Rank Tracking Archetype Subpages
- `Rank Movement`
- `Page 2 Keywords`
- `CTR Underperformers`
- `Featured Snippet Positions`
- `Rank Action Queue`
- `Rank Data Source`

---

## Module 5: Competitor Analysis

### Backend Files Audited
- `backend/src/modules/competitor-analysis/analysis.js`
- `backend/src/modules/competitor-analysis/insights.js`
- `backend/src/modules/competitor-analysis/actions.js`

### Backend Module Key
`competitor_analysis`

### Implemented Backend Capabilities

#### Capability CA-01: Competitor Input Normalization
Source:
- `normalizeCompetitor`
- `normalizeInput`

What it does:
- accepts competitor objects via `competitors` array
- resolves competitor reference from `competitorRef`, `name`, `domain`, or `appId`
- normalizes keyword, content, rank visibility, review signal, and domain authority scores
- resolves topic count, SERP overlap, and content velocity fields

Output:
- normalized competitor list with comparison scores

Frontend projection:
- parent screen names the active competitor set
- configuration subpage handles competitor entry

Archetype subpage:
- Configuration Archetype subpage: `Competitor Setup`

UI implication:
- show competitor name, not internal `competitorRef` field

#### Capability CA-02: Multi-Dimensional Gap Identification
Source:
- `identifyGaps`

Dimensions:
- keyword coverage gap
- content coverage gap
- rank visibility gap
- review signal gap
- domain authority gap
- topical coverage gap

What it does:
- computes gap score per dimension for each competitor
- computes total pressure score
- identifies strongest gap dimension
- classifies as pressured when pressure score is positive

Frontend projection:
- parent screen shows top competitor and their strongest gap dimension
- subpage shows all dimensions with gap values

Archetype subpage:
- Analysis Feed Archetype subpage: `Competitor Pressure Detail`

UI implication:
- show `Competitor is winning on keyword coverage` not `strongestGapDimension: keyword_coverage`

#### Capability CA-03: Domain Authority Gap Analysis
Source:
- `authorityGapSeverity`
- `identifyGaps`
- `buildDaGapInsight`

What it does:
- computes DA gap between target and competitor
- classifies DA severity via `authorityGapSeverity` (critical, significant, moderate)
- generates insight when DA gap exceeds 15 points

Frontend projection:
- subpage should show DA gap as an authority building recommendation

Archetype subpage:
- Detail Drilldown Archetype subpage: `Authority Gap`

UI implication:
- frame as `Their domain has more ranking authority than yours`

#### Capability CA-04: Topical Coverage Gap Analysis
Source:
- `identifyGaps`
- `buildTopicalGapInsight`

What it does:
- computes topical coverage gap when both target and competitor have topic counts
- generates insight when competitor covers 10+ more topics

Frontend projection:
- subpage shows topical gap as content expansion target

Archetype subpage:
- Analysis Feed Archetype subpage: `Topical Gap`

UI implication:
- frame as `They cover more subjects than you do`

#### Capability CA-05: Competitor Pressure Insights
Source:
- `generateCompetitorInsights`
- `buildPressureInsight`
- `buildCoverageInsight`

What it does:
- generates pressure insight for top two pressured competitors
- generates DA gap insight for high-gap competitor
- generates topical gap insight for high-topic-gap competitor
- generates coverage summary showing pressured competitor count

Frontend projection:
- parent screen uses top pressure insight
- subpage shows all competitor insights

Archetype subpage:
- Analysis Feed Archetype subpage: `Competitor Pressure`

UI implication:
- insights should name the competitor and the gap type in plain language

#### Capability CA-06: Competitor Gap Actions
Source:
- `generateCompetitorActions`
- `buildGapAction`

Action types:
- `competitive_gap_action` — per dimension action
- `close_domain_authority_gap`
- `close_topical_coverage_gap`
- `competitor_monitoring_action`

Dimension action mapping:
- keyword_coverage: close keyword gaps
- content_coverage: improve listing/content coverage
- rank_visibility: address ranking weakness
- review_signal: address review-driven pressure
- domain_authority: build high-DA backlinks
- topical_coverage: create content on competitor topics

Frontend projection:
- parent shows top gap action
- subpage shows full competitive action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Competitor Action Queue`

UI implication:
- actions should be concrete gap-closing tasks, not backend dimension names

### Competitor Analysis Parent Screen Recommendation
- feature card: `Competitor advantages that need a response`
- top finding: top pressure competitor and strongest gap dimension
- top action: highest-priority gap action
- secondary signal: number of pressured competitors
- links to subpages

### Competitor Analysis Archetype Subpages
- `Competitor Pressure Detail`
- `Authority Gap`
- `Topical Gap`
- `Competitor Action Queue`
- `Competitor Setup`

---

## Module 6: Optimization Layer

### Backend Files Audited
- `backend/src/modules/optimization-layer/analysis.js`
- `backend/src/modules/optimization-layer/insights.js`
- `backend/src/modules/optimization-layer/actions.js`

### Backend Module Key
`optimization_layer`

### Implemented Backend Capabilities

#### Capability OL-01: Section Input Normalization
Source:
- `normalizeInput`
- `normalizeSections`

What it does:
- accepts `sections` array with `sectionRef`, `title`, `content`, `keywords`, `metadata`, `relatedTerms`, `lastModified`
- filters empty sections
- normalizes all string fields and arrays

Output:
- normalized section list with all optimization fields

Frontend projection:
- parent shows section count and sections-needing-optimization count

Archetype subpage:
- Configuration Archetype subpage: `Section Setup`

UI implication:
- show `8 content sections tracked` not raw normalization fields

#### Capability OL-02: Per-Section Optimization Scoring
Source:
- `scoreSection`

Issue types detected:
- `keyword_coverage_missing` — no target keywords matched
- `metadata_incomplete` — missing title or description metadata
- `content_thin` — content under 80 characters
- `readability_complex` — average sentence length indicates complex prose
- `keyword_overstuffed` — density above 3%
- `keyword_density_too_low` — density is zero with sufficient content
- `low_semantic_richness` — fewer than 30% of related terms matched
- `content_stale` — last modified over 12 months ago

What it does:
- scores each section on keyword match, metadata coverage, content length
- computes optimization score as a composite value
- identifies all issue types per section

Frontend projection:
- subpage shows section-by-section issue list
- parent shows highest-gap section

Archetype subpage:
- Detail Drilldown Archetype subpage: `Section Optimization Detail`

UI implication:
- show `This section is missing target keywords` not issue type codes

#### Capability OL-03: Stale Content Detection
Source:
- `buildStaleContentInsight`

What it does:
- identifies sections where last modified date exceeds 12 months
- generates medium-severity insight when stale sections exist

Frontend projection:
- subpage surfaces stale sections as refresh targets

Archetype subpage:
- Analysis Feed Archetype subpage: `Stale Content`

UI implication:
- frame as `This content may be out of date`

#### Capability OL-04: Readability Analysis
Source:
- `buildReadabilityInsight`
- `readabilityTier`
- `estimateAvgSentenceLength`

What it does:
- identifies sections with complex readability tier
- generates medium-severity insight when complex sections exist

Frontend projection:
- subpage shows readability issues as simplification targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Readability Issues`

UI implication:
- frame as `This content is hard to read — simplify sentence structure`

#### Capability OL-05: Optimization Action Generation
Source:
- `generateOptimizationActions`
- `buildImprovementAction`

Action types:
- `fix_keyword_overstuffing`
- `improve_semantic_richness`
- `refresh_stale_content`
- `simplify_complex_readability`
- `expand_keyword_coverage`
- `complete_section_metadata`
- `expand_thin_content`
- `optimization_monitoring_action`

What it does:
- top 3 worst sections by issue count get actions
- each action type maps to a specific remediation
- baseline monitoring action always appended

Frontend projection:
- parent shows top section action
- subpage shows ordered action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Optimization Action Queue`

UI implication:
- action copy should be specific fix instructions, not backend action type names

### Optimization Layer Parent Screen Recommendation
- feature card: `Content sections with optimization gaps`
- top finding: highest-gap section and primary issue
- top action: top section improvement action
- secondary signal: sections-needing-optimization count
- links to subpages

### Optimization Layer Archetype Subpages
- `Section Optimization Detail`
- `Stale Content`
- `Readability Issues`
- `Optimization Action Queue`
- `Section Setup`

---

## Module 7: Creative / Messaging Layer

### Backend Files Audited
- `backend/src/modules/creative-messaging-layer/analysis.js`
- `backend/src/modules/creative-messaging-layer/insights.js`
- `backend/src/modules/creative-messaging-layer/actions.js`

### Backend Module Key
`creative_messaging_layer`

### Implemented Backend Capabilities

#### Capability CML-01: Creative Asset Normalization
Source:
- `normalizeInput`
- `normalizeAssets`

What it does:
- accepts `assets` array with `assetRef`, `headline`, `body`, `callToAction`, `audienceSignals`
- filters empty assets
- normalizes all string and array fields

Output:
- normalized asset list

Frontend projection:
- parent shows asset count and assets-needing-work count

Archetype subpage:
- Configuration Archetype subpage: `Asset Setup`

UI implication:
- show `5 creative assets tracked` not raw normalization

#### Capability CML-02: Per-Asset Messaging Analysis
Source:
- `analyzeAsset`

Issue types detected:
- `theme_alignment_missing` — no target themes matched in copy
- `cta_missing` — call to action is empty
- `message_depth_thin` — body under 60 characters
- `headline_missing` — headline is empty

What it does:
- matches asset copy against target themes
- counts audience signals
- computes message strength score from theme matches, CTA presence, headline presence, body length

Frontend projection:
- subpage shows per-asset issue list
- parent shows primary gap asset

Archetype subpage:
- Detail Drilldown Archetype subpage: `Asset Messaging Detail`

UI implication:
- show `This creative is missing a clear call to action` not issue type codes

#### Capability CML-03: Messaging Gap Insights
Source:
- `generateCreativeMessagingInsights`
- `buildAssetInsight`
- `buildCoverageInsight`

What it does:
- generates messaging gap insight for top 3 worst assets by issue count
- generates coverage summary insight showing assets-needing-work count

Frontend projection:
- parent uses top messaging gap insight
- subpage shows all asset insights

Archetype subpage:
- Analysis Feed Archetype subpage: `Messaging Gaps`

UI implication:
- insights should name the asset and the gap in plain language

#### Capability CML-04: Messaging Action Generation
Source:
- `generateCreativeMessagingActions`
- `buildSuggestionAction`

Action types:
- `messaging_suggestion_action` — per-asset action based on issue type
- `messaging_monitoring_action`

Issue-to-action mapping:
- theme_alignment_missing: rewrite to reflect target themes explicitly
- cta_missing: add a clear call to action
- message_depth_thin: expand the asset body
- headline_missing: add a clearer headline

What it does:
- top 3 worst assets get actions
- monitoring action always appended

Frontend projection:
- parent shows top messaging action
- subpage shows full messaging action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Messaging Action Queue`

UI implication:
- action copy should be creative rewrite guidance, not issue type codes

### Creative / Messaging Layer Parent Screen Recommendation
- feature card: `Creative and messaging gaps that weaken conversion`
- top finding: primary gap asset and main issue
- top action: top messaging improvement action
- secondary signal: assets-needing-work count
- links to subpages

### Creative / Messaging Layer Archetype Subpages
- `Asset Messaging Detail`
- `Messaging Gaps`
- `Messaging Action Queue`
- `Asset Setup`

---

## Module 8: Unified Workflow Layer

### Backend Files Audited
- `backend/src/modules/unified-workflow-layer/analysis.js`
- `backend/src/modules/unified-workflow-layer/insights.js`
- `backend/src/modules/unified-workflow-layer/actions.js`

### Backend Module Key
`unified_workflow_layer`

### Implemented Backend Capabilities

#### Capability UWL-01: Module Result Normalization
Source:
- `normalizeModuleResult`
- `normalizeInput`

What it does:
- accepts `moduleResults` or `orchestrationResults` array
- resolves insights, priorities, and actions from each module flow
- normalizes module key and status fields

Output:
- normalized module results ready for cross-module analysis

Frontend projection:
- parent shows module count and modules with active actions

Archetype subpage:
- Dashboard Archetype subpage: `Module Status`

UI implication:
- show `7 modules analyzed` not raw normalization structure

#### Capability UWL-02: Module Weight System
Source:
- `MODULE_WEIGHTS`
- `applyModuleWeight`

Module weights:
- technical_seo_audit: 1.5
- backlink_intelligence: 1.4
- analytics_integration: 1.3
- search_intent_classifier: 1.2
- eeat_signals: 1.1
- on_page_seo_scorer: 1.1
- all others: 1.0

What it does:
- applies a multiplier to priority scores based on module strategic importance
- higher-weighted modules surface their actions preferentially

Frontend projection:
- unified action queue implicitly reflects this weighting
- user does not need to see weights

UI implication:
- do not expose module weights in UI

#### Capability UWL-03: Priority Consolidation
Source:
- `consolidatePriorities`
- `summarizeModule`

What it does:
- flattens priorities from all modules into a single ordered list
- applies module weight to business value
- preserves source module reference for each priority

Frontend projection:
- unified action queue on parent screen uses consolidated priorities
- each action item should show source module

Archetype subpage:
- Analysis Feed Archetype subpage: `Unified Action Queue`

UI implication:
- show source module label with each action item

#### Capability UWL-04: Foundation Issue Detection
Source:
- `detectFoundationIssue`

What it does:
- reads technical SEO audit health score from consolidated module results
- flags foundation issue when health score is below 50
- generates high-priority action to fix technical foundation first

Frontend projection:
- parent screen should surface foundation issue as a blocking alert when present

Archetype subpage:
- Analysis Feed Archetype subpage: `Foundation Issue Alert`

UI implication:
- frame as `Fix these technical issues before other work will have full impact`

#### Capability UWL-05: Quick Win Cluster Detection
Source:
- `buildQuickWinCluster`
- `QUICK_WIN_ACTION_TYPES`

Quick win action types detected:
- `push_page2_keywords`
- `push_page2_rankings`
- `push_page2_to_page1`

What it does:
- collects all page-2 keyword push actions from all modules
- deduplicates keyword list
- generates high-priority action with combined keyword count

Frontend projection:
- parent screen shows quick win cluster when present as highest-ROI opportunity

Archetype subpage:
- Detail Drilldown Archetype subpage: `Quick Win Cluster`

UI implication:
- frame as `Fastest ranking wins available right now`

#### Capability UWL-06: Cross-Module Insights
Source:
- `generateUnifiedWorkflowInsights`
- `buildCrossModuleInsight`
- `buildWorkflowInsight`
- `buildFoundationInsight`
- `buildQuickWinInsight`

What it does:
- generates foundation blocking insight when health score is critical
- generates quick win cluster insight when page-2 keywords exist
- generates cross-module summary insight for top 3 modules by priority
- generates workflow consolidation summary insight

Frontend projection:
- parent shows foundation and quick win insights as primary signals
- subpage shows all cross-module insights

Archetype subpage:
- Analysis Feed Archetype subpage: `Cross-Module Insights`

UI implication:
- module-level insights should show source module in plain language

#### Capability UWL-07: Unified Workflow Actions
Source:
- `generateUnifiedWorkflowActions`
- `buildConsolidatedAction`
- `buildCoordinationAction`
- `buildFoundationAction`
- `buildQuickWinAction`

What it does:
- foundation and quick win actions appear first
- top 5 consolidated priority actions follow
- coordination action appended at the end
- all actions ordered by priority

Frontend projection:
- parent shows top workflow action
- subpage shows full unified action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Unified Action Queue`

UI implication:
- each action should show source module and concrete instruction

### Unified Workflow Layer Parent Screen Recommendation
- feature card: `Your complete optimization queue across all modules`
- foundation alert: shown when technical health score is below 50
- quick win highlight: shown when page-2 keywords exist across modules
- top action: highest-weighted consolidated action
- secondary signal: total actions available across modules
- links to subpages

### Unified Workflow Layer Archetype Subpages
- `Unified Action Queue`
- `Foundation Issue Alert`
- `Quick Win Cluster`
- `Cross-Module Insights`
- `Module Status`

---

## Module 9: Technical SEO Audit

### Backend Files Audited
- `backend/src/modules/technical-seo-audit/analysis.js`
- `backend/src/modules/technical-seo-audit/insights.js`
- `backend/src/modules/technical-seo-audit/actions.js`

### Backend Module Key
`technical_seo_audit`

### Implemented Backend Capabilities

#### Capability TSA-01: Audit Input Normalization
Source:
- `normalizeAuditInput`

What it does:
- accepts `url`, `crawlData`, `pageSpeedData`, `robotsData`, `sitemapData`, `schemaData`
- normalizes arrays and objects for each dimension

Frontend projection:
- configuration subpage shows connected data sources

Archetype subpage:
- Configuration Archetype subpage: `Audit Data Sources`

UI implication:
- show data source connection status, not raw field names

#### Capability TSA-02: Core Web Vitals Scoring
Source:
- `analyzeCoreWebVitals`
- `scoreVital`
- `VITAL_THRESHOLDS`

Vitals scored:
- LCP: good <= 2500ms, needs improvement <= 4000ms, poor above
- CLS: good <= 0.1, needs improvement <= 0.25, poor above
- INP: good <= 200ms, needs improvement <= 500ms, poor above

What it does:
- scores each vital as good (100), needs improvement (60), poor (0), or unknown (50)
- computes composite vital score
- flags hasAnyPoor when any vital is poor

Frontend projection:
- parent shows overall vital score and worst vital
- subpage shows individual vital scores with improvement guidance

Archetype subpage:
- Detail Drilldown Archetype subpage: `Core Web Vitals`

UI implication:
- show `LCP is failing` not `vitalScore: 0`

#### Capability TSA-03: Crawlability Analysis
Source:
- `analyzeCrawlability`

What it does:
- counts robots.txt blocked pages
- counts noindex and nofollow pages
- computes crawlability score (starts at 100, subtracts for blocks)
- checks robots.txt presence

Frontend projection:
- parent shows crawlability score and biggest block issue
- subpage shows full crawl block detail

Archetype subpage:
- Detail Drilldown Archetype subpage: `Crawl Health`

UI implication:
- frame as `Search engines cannot access these pages`

#### Capability TSA-04: Indexation Analysis
Source:
- `analyzeIndexation`

What it does:
- identifies canonical tag issues and missing canonicals
- identifies duplicate URLs
- computes indexation score

Frontend projection:
- subpage shows canonical issues as specific fix targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Indexation Issues`

UI implication:
- frame as `These pages may compete with themselves in search`

#### Capability TSA-05: Redirect Analysis
Source:
- `analyzeRedirects`

What it does:
- identifies redirect chains at depth 2 or more
- identifies redirects pointing to 404 targets
- computes redirect score

Frontend projection:
- subpage shows redirect chains as equity-loss fix targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Redirect Issues`

UI implication:
- frame as `These redirects waste link authority`

#### Capability TSA-06: Schema Markup Analysis
Source:
- `analyzeSchema`

What it does:
- extracts schema types present
- counts schema errors and invalid schema items
- classifies coverage as `present` or `missing`

Frontend projection:
- subpage shows schema status and missing type recommendations

Archetype subpage:
- Detail Drilldown Archetype subpage: `Schema Markup`

UI implication:
- frame as `Rich results are not available without schema markup`

#### Capability TSA-07: Security and Mobile Analysis
Source:
- `analyzeSecurity`

What it does:
- classifies HTTPS status as `secure`, `mixed`, or `insecure`
- checks mobile-friendliness across crawl data
- detects sitemap presence
- computes security score (HTTPS: 50, mobile: 50)

Frontend projection:
- subpage shows HTTPS and mobile status as trust and ranking signals

Archetype subpage:
- Detail Drilldown Archetype subpage: `Security and Mobile`

UI implication:
- frame as `HTTPS and mobile readiness affect trust and rankings`

#### Capability TSA-08: Overall Health Score and Issue Classification
Source:
- `computeOverallHealthScore`
- `classifyIssues`
- `analyzeTechnicalSeo`

What it does:
- weights CWV (25%), crawlability (20%), indexation (20%), redirects (15%), security (20%)
- classifies issues into critical, warning, info buckets
- assigns health band: healthy (80+), needs_work (50-79), critical (below 50)

Frontend projection:
- parent shows health score and health band as primary signal
- critical issue count shown as urgency signal

Archetype subpage:
- Dashboard Archetype subpage: `Technical Health Score`

UI implication:
- show `Technical health: 62/100 — needs work` not raw score alone

#### Capability TSA-09: Technical SEO Actions
Source:
- `prioritizeTechnicalSeoActions`
- `createActionFromInsight`

Action types:
- `fix_core_web_vitals`
- `resolve_crawl_blocks`
- `fix_canonical_issues`
- `fix_broken_internal_links`
- `collapse_redirect_chains`
- `implement_schema_markup`
- `fix_https_security`
- `schedule_technical_reaudit`

Frontend projection:
- parent shows top critical action
- subpage shows full ordered technical action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Technical Action Queue`

UI implication:
- each action should name the affected technical issue in plain language

### Technical SEO Audit Parent Screen Recommendation
- feature card: `Technical issues that block ranking and indexation`
- top finding: health score and health band
- top action: highest-priority technical fix
- secondary signal: critical issue count
- links to subpages

### Technical SEO Audit Archetype Subpages
- `Technical Health Score`
- `Core Web Vitals`
- `Crawl Health`
- `Indexation Issues`
- `Redirect Issues`
- `Schema Markup`
- `Security and Mobile`
- `Technical Action Queue`
- `Audit Data Sources`

---

## Module 10: On-Page SEO Scorer

### Backend Files Audited
- `backend/src/modules/on-page-seo-scorer/analysis.js`
- `backend/src/modules/on-page-seo-scorer/insights.js`
- `backend/src/modules/on-page-seo-scorer/actions.js`

### Backend Module Key
`on_page_seo_scorer`

### Implemented Backend Capabilities

#### Capability OPS-01: Page Input Normalization
Source:
- `normalizeOnPageInput`
- `normalizePage`

What it does:
- accepts `pages` array or single `page` object
- normalizes title, metaDescription, h1, h2s, h3s, bodyContent, internalLinks, imageAlts, wordCount
- resolves `targetKeywords` from array or single `targetKeyword`
- computes URL slug from url field

Output:
- normalized page list

Frontend projection:
- parent shows page count and pages-needing-work count

Archetype subpage:
- Configuration Archetype subpage: `Page Source Setup`

UI implication:
- show `12 pages scored` not raw field names

#### Capability OPS-02: Title Tag Scoring
Source:
- `scoreTitleTag`

What it does:
- scores presence (+10), optimal length 50-60 chars (+8) or acceptable 40-70 (+5)
- scores primary keyword presence (+7)
- issues: `title_missing`, `title_too_short`, `title_too_long`, `title_missing_primary_keyword`

Frontend projection:
- subpage shows title tag issues as rewrite targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Title Tag Issues`

UI implication:
- frame as `Title tag is too short and missing the target keyword`

#### Capability OPS-03: Meta Description Scoring
Source:
- `scoreMetaDescription`

What it does:
- scores presence (+5), optimal length 150-160 (+5) or acceptable 100-180 (+3)
- scores primary keyword presence (+5)
- issues: `meta_description_missing`, `meta_too_short`, `meta_too_long`, `meta_missing_primary_keyword`

Frontend projection:
- subpage shows meta description issues as CTR fix targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Meta Description Issues`

UI implication:
- frame as `Missing meta descriptions reduce search click rates`

#### Capability OPS-04: Heading Hierarchy Scoring
Source:
- `scoreHeadingHierarchy`

What it does:
- scores H1 presence (+8) and keyword in H1 (+7)
- scores H2 count: 2+ gets +5, 1 gets +2
- issues: `h1_missing`, `h1_missing_primary_keyword`, `insufficient_h2s`, `no_h2s`

Frontend projection:
- subpage shows heading issues as structure fix targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Heading Structure`

UI implication:
- frame as `Pages need an H1 with the target keyword`

#### Capability OPS-05: Content Depth Scoring
Source:
- `scoreContentDepth`

What it does:
- scores by word count: 1500+ (10), 800+ (7), 400+ (4)
- scores keyword in opening 100 words (+5)
- scores keyword density 0.5-2% (+5)
- issues: `content_too_thin`, `keyword_not_in_opening`, `keyword_density_too_high`, `keyword_density_too_low`

Frontend projection:
- subpage shows content depth issues as expansion targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Content Depth`

UI implication:
- frame as `Content is too thin to rank competitively`

#### Capability OPS-06: Internal Links Scoring
Source:
- `scoreInternalLinks`

What it does:
- scores by link count: 3+ (5), 1-2 (3)
- scores keyword anchor text presence (+5)
- issues: `few_internal_links`, `no_internal_links`, `no_keyword_anchor_text`

Frontend projection:
- subpage shows internal link issues as link-building targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Internal Link Gaps`

UI implication:
- frame as `This page needs more internal links pointing to it`

#### Capability OPS-07: Image Optimization Scoring
Source:
- `scoreImageOptimization`

What it does:
- computes alt text coverage ratio
- scores 80%+ coverage (+5), 50%+ coverage (+3)
- issues: `incomplete_image_alt_text`, `poor_image_alt_text_coverage`

Frontend projection:
- subpage shows image alt text issues as accessibility and SEO fix targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Image Optimization`

UI implication:
- frame as `Images are missing descriptive alt text`

#### Capability OPS-08: URL Structure Scoring
Source:
- `scoreUrlStructure`

What it does:
- scores URL slug length <= 60 (+2)
- scores keyword in slug (+2)
- scores no query params (+1)
- issues: `url_slug_too_long`, `url_missing_keyword`, `url_has_query_params`

Frontend projection:
- subpage shows URL issues as structural fix targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `URL Structure`

UI implication:
- frame as `URL slug does not include the target keyword`

#### Capability OPS-09: Site-Wide Score Aggregation
Source:
- `analyzeOnPage`
- `scorePageOnPage`

What it does:
- scores each page from 0-100 across all dimensions
- classifies score band as good (80+), needs_work (60+), poor (below 60)
- computes site average score
- identifies critical pages below 40
- extracts top 5 most common issues across all pages
- identifies highest-gap page

Frontend projection:
- parent shows site average score and score band
- subpage shows per-page scores

Archetype subpage:
- Dashboard Archetype subpage: `On-Page Score Summary`

UI implication:
- show `Site on-page average: 58/100` with score band label

#### Capability OPS-10: On-Page Actions
Source:
- `prioritizeOnPageActions`
- `createActionFromInsight`

Action types:
- `fix_critical_pages`
- `rewrite_title_tags`
- `add_meta_descriptions`
- `fix_heading_hierarchy`
- `expand_thin_content`
- `resolve_widespread_issue`
- `schedule_on_page_reaudit`

Frontend projection:
- parent shows top on-page action
- subpage shows full action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `On-Page Action Queue`

UI implication:
- action copy should name the specific page issue and fix instruction

### On-Page SEO Scorer Parent Screen Recommendation
- feature card: `Page-level SEO gaps limiting your rankings`
- top finding: site average score and health band
- top action: top on-page fix
- secondary signal: critical page count or most common issue
- links to subpages

### On-Page SEO Scorer Archetype Subpages
- `On-Page Score Summary`
- `Title Tag Issues`
- `Meta Description Issues`
- `Heading Structure`
- `Content Depth`
- `Internal Link Gaps`
- `Image Optimization`
- `URL Structure`
- `On-Page Action Queue`
- `Page Source Setup`

---

## Module 11: Backlink Intelligence

### Backend Files Audited
- `backend/src/modules/backlink-intelligence/analysis.js`
- `backend/src/modules/backlink-intelligence/insights.js`
- `backend/src/modules/backlink-intelligence/actions.js`

### Backend Module Key
`backlink_intelligence`

### Implemented Backend Capabilities

#### Capability BI-01: Backlink Input Normalization
Source:
- `normalizeBacklinkInput`
- `normalizeBacklink`
- `normalizeReferringDomain`

What it does:
- accepts `backlinks`, `referringDomains`, and `competitorBacklinks` arrays
- normalizes source URL, domain, domain authority, anchor text, spam score, link type, firstSeen

Output:
- normalized backlink list
- normalized referring domain list
- normalized competitor backlink list for gap analysis

Frontend projection:
- parent shows total backlinks and unique referring domains

Archetype subpage:
- Configuration Archetype subpage: `Backlink Data Source`

UI implication:
- show `1,240 backlinks from 87 domains` not raw fields

#### Capability BI-02: Authority Distribution Analysis
Source:
- `analyzeAuthorityDistribution`
- `computeAuthorityScore`
- `authorityTier`

What it does:
- classifies each backlink as high, medium, or low authority tier
- computes authority score as weighted composite
- classifies overall authority tier

Frontend projection:
- parent shows authority tier and high-DA link count
- subpage shows distribution chart and low-authority breakdown

Archetype subpage:
- Detail Drilldown Archetype subpage: `Authority Distribution`

UI implication:
- show `Authority profile: Low — only 3 high-authority links` not raw scores

#### Capability BI-03: Toxicity Risk Analysis
Source:
- `computeToxicityRisk`

What it does:
- identifies backlinks with spam score above 40 as toxic
- computes toxic ratio
- classifies risk level: high, medium, or low

Frontend projection:
- parent shows risk level as a trust signal
- subpage shows toxic link list with disavow guidance

Archetype subpage:
- Detail Drilldown Archetype subpage: `Toxic Links`

UI implication:
- frame as `Risky links that could trigger a Google penalty`

#### Capability BI-04: Anchor Text Distribution
Source:
- `computeAnchorDistribution`
- `anchorDiversityScore`

What it does:
- classifies anchors as exact match, branded, partial match, generic, or naked URL
- computes diversity score
- flags over-optimization when exact match exceeds 30%

Frontend projection:
- subpage shows anchor distribution and over-optimization risk

Archetype subpage:
- Detail Drilldown Archetype subpage: `Anchor Text Distribution`

UI implication:
- frame as `Too many exact-match anchors looks manipulative to Google`

#### Capability BI-05: Link Velocity Analysis
Source:
- `analyzeLinkVelocity`

What it does:
- counts recent links acquired in the last 30 days
- classifies velocity as growing, stable, or declining
- growing when recent links are 20%+ of total
- declining when recent links are below 5% and profile has 10+ links

Frontend projection:
- parent can show velocity trend as a momentum signal
- subpage shows velocity context

Archetype subpage:
- Analysis Feed Archetype subpage: `Link Velocity`

UI implication:
- frame as `Link acquisition has stalled` or `Growing link profile`

#### Capability BI-06: Competitor Link Gap Analysis
Source:
- `analyzeCompetitorLinkGap`

What it does:
- identifies domains that link to competitors but not to the target
- sorts opportunity domains by authority
- exposes up to 10 top opportunities

Frontend projection:
- subpage shows competitor link gap as outreach target list

Archetype subpage:
- Detail Drilldown Archetype subpage: `Link Gap Opportunities`

UI implication:
- frame as `These sites link to your competitors but not to you`

#### Capability BI-07: Backlink Actions
Source:
- `prioritizeBacklinkActions`
- `createActionFromInsight`

Action types:
- `disavow_toxic_links`
- `review_suspicious_links`
- `build_high_da_links`
- `diversify_anchor_text`
- `outreach_competitor_gap_domains`
- `reactivate_link_building`
- `monitor_link_velocity`

Frontend projection:
- parent shows top backlink action
- subpage shows full action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Backlink Action Queue`

UI implication:
- action copy should be concrete link building or disavow instructions

### Backlink Intelligence Parent Screen Recommendation
- feature card: `Authority signals and link risks that affect your ranking power`
- top finding: authority tier and risk level
- top action: build high-DA links or disavow toxic links
- secondary signal: competitor link gap count
- links to subpages

### Backlink Intelligence Archetype Subpages
- `Authority Distribution`
- `Toxic Links`
- `Anchor Text Distribution`
- `Link Velocity`
- `Link Gap Opportunities`
- `Backlink Action Queue`
- `Backlink Data Source`

---

## Module 12: E-E-A-T Signals

### Backend Files Audited
- `backend/src/modules/eeat-signals/analysis.js`
- `backend/src/modules/eeat-signals/insights.js`
- `backend/src/modules/eeat-signals/actions.js`

### Backend Module Key
`eeat_signals`

### Implemented Backend Capabilities

#### Capability ES-01: E-E-A-T Input Normalization
Source:
- `normalizeEeatInput`

What it does:
- accepts `pages` with hasAuthorBio, authorCredentials, hasByline, bodyContent
- accepts `aboutPage` object with wordCount, hasTeamSection, hasCompanyHistory
- accepts `contactPage` object with hasAddress, hasPhone, hasEmail
- accepts `trustSignals` array with type and value
- accepts `externalCitations` array with sourceUrl, sourceDomain, domainAuthority
- accepts `niche` for YMYL classification

Frontend projection:
- configuration subpage shows what data is connected

Archetype subpage:
- Configuration Archetype subpage: `E-E-A-T Data Setup`

UI implication:
- show which signal categories are populated, not raw field names

#### Capability ES-02: Experience Scoring
Source:
- `scoreExperience`
- `FIRST_HAND_MARKERS`

What it does:
- computes byline ratio and author bio ratio across pages
- counts first-hand experience markers per page body
- experience score weighted: bylines 40%, author bios 40%, first-hand signals 20%

Frontend projection:
- subpage shows experience score with byline and bio coverage

Archetype subpage:
- Detail Drilldown Archetype subpage: `Author Experience Signals`

UI implication:
- frame as `Most pages lack author bylines and bios`

#### Capability ES-03: Expertise Scoring
Source:
- `scoreExpertise`
- `CITATION_MARKERS`

What it does:
- counts author credentials across all pages
- counts pages with citation markers in body content
- computes average word count for content depth score
- scores expertise from credentials, depth, and citations

Frontend projection:
- subpage shows expertise score with credentials gap

Archetype subpage:
- Detail Drilldown Archetype subpage: `Author Expertise Signals`

UI implication:
- frame as `No author credentials documented across content`

#### Capability ES-04: Authoritativeness Scoring
Source:
- `scoreAuthoritativeness`

What it does:
- counts external citations and high-DA citations (DA 60+)
- counts media mentions and awards from trust signals
- scores authoritativeness from citation count, high-DA coverage, mentions, and awards

Frontend projection:
- subpage shows authority score and external citation count

Archetype subpage:
- Detail Drilldown Archetype subpage: `External Authority Signals`

UI implication:
- frame as `Being cited by credible external sources is a core authority signal`

#### Capability ES-05: Trustworthiness Scoring
Source:
- `scoreTrustworthiness`

What it does:
- scores about page presence and quality (word count, team section, company history)
- scores contact page presence with address, phone, email
- scores trust signal types: privacy policy, terms, SSL, review ratings, certifications

Frontend projection:
- parent shows trust score and most critical missing element
- subpage shows all trust signal gaps

Archetype subpage:
- Detail Drilldown Archetype subpage: `Trust Signals`

UI implication:
- frame missing elements as `Essential trust pages are missing`

#### Capability ES-06: YMYL Risk Classification
Source:
- `YMYL_CATEGORIES`
- `analyzeEeat`

YMYL categories:
- health, finance, financial, legal, law, medical, news, safety, government, investment, insurance, pharmacy

What it does:
- classifies site as high_scrutiny or standard based on niche
- raises urgency for YMYL sites with low E-E-A-T score

Frontend projection:
- parent shows YMYL risk status when applicable as a priority signal

Archetype subpage:
- Dashboard Archetype subpage: `E-E-A-T Risk Status`

UI implication:
- frame as `Google applies higher scrutiny to sites in this niche`

#### Capability ES-07: E-E-A-T Actions
Source:
- `prioritizeEeatActions`
- `createActionFromInsight`

Action types:
- `build_trust_foundation`
- `add_author_bios_and_credentials`
- `prioritise_eeat_for_ymyl`
- `pursue_external_citations`
- `document_author_expertise`
- `monitor_eeat_quarterly`

Frontend projection:
- parent shows top E-E-A-T action
- subpage shows full action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `E-E-A-T Action Queue`

UI implication:
- action copy should be concrete credibility-building tasks

### E-E-A-T Signals Parent Screen Recommendation
- feature card: `Credibility signals that affect how Google evaluates your content`
- top finding: overall E-E-A-T score and tier
- top action: build trust foundation or add author credentials
- secondary signal: YMYL risk level when applicable
- links to subpages

### E-E-A-T Signals Archetype Subpages
- `E-E-A-T Risk Status`
- `Author Experience Signals`
- `Author Expertise Signals`
- `External Authority Signals`
- `Trust Signals`
- `E-E-A-T Action Queue`
- `E-E-A-T Data Setup`

---

## Module 13: Search Intent Classifier

### Backend Files Audited
- `backend/src/modules/search-intent-classifier/analysis.js`
- `backend/src/modules/search-intent-classifier/insights.js`
- `backend/src/modules/search-intent-classifier/actions.js`

### Backend Module Key
`search_intent_classifier`

### Implemented Backend Capabilities

#### Capability SIC-01: Keyword Intent Input Normalization
Source:
- `normalizeSearchIntentInput`
- `normalizeKeywordEntry`

What it does:
- accepts keyword strings or objects with `keyword`, `existingContentType`, and `url`
- normalizes keyword text to lowercase

Output:
- normalized keyword list with existing content type and URL fields

Frontend projection:
- parent shows keyword count and alignment score

Archetype subpage:
- Configuration Archetype subpage: `Keyword Intent Source`

UI implication:
- show `38 keywords classified` not raw normalization fields

#### Capability SIC-02: Intent Classification
Source:
- `batchClassifyIntents`
- `analyzeSearchIntent`

Intent types:
- informational
- navigational
- transactional
- commercial

What it does:
- classifies each keyword using core `intentClassifier`
- assigns primary intent and confidence
- assigns recommended content formats per intent

Frontend projection:
- parent shows dominant intent type across keyword set
- subpage shows per-keyword intent distribution

Archetype subpage:
- Analysis Feed Archetype subpage: `Intent Distribution`

UI implication:
- show `Most keywords have commercial intent` not raw intent counts

#### Capability SIC-03: Content Alignment Check
Source:
- `checkAlignment`
- `analyzeSearchIntent`

What it does:
- checks whether existing content type matches any recommended format for the intent
- classifies alignment as `aligned`, `misaligned`, or `unknown` (no content)
- computes alignment score as percentage of keywords with known alignment that are aligned

Frontend projection:
- parent shows alignment score as a content strategy health signal
- subpage shows per-keyword alignment status

Archetype subpage:
- Analysis Feed Archetype subpage: `Intent Alignment`

UI implication:
- frame `67% of keywords are served by the right content format`

#### Capability SIC-04: High-Value Misalignment Detection
Source:
- `analyzeSearchIntent`
- `generateSearchIntentInsights`

What it does:
- identifies misaligned keywords with commercial or transactional intent
- these are the highest-revenue-impact mismatches
- severity is high

Frontend projection:
- parent shows high-value misalignment count as priority signal

Archetype subpage:
- Detail Drilldown Archetype subpage: `High-Value Intent Mismatches`

UI implication:
- frame as `These commercial keywords are served by the wrong content — costing conversions`

#### Capability SIC-05: Keywords Without Content Detection
Source:
- `generateSearchIntentInsights`

What it does:
- identifies keywords with no existing content mapped (alignment is unknown)
- these are content creation opportunities
- severity is medium

Frontend projection:
- subpage surfaces unmapped keywords as intent-matched content opportunities

Archetype subpage:
- Analysis Feed Archetype subpage: `Content Creation Opportunities`

UI implication:
- frame as `Keywords with no page yet — create them matched to intent from the start`

#### Capability SIC-06: Search Intent Actions
Source:
- `prioritizeSearchIntentActions`
- `createActionFromInsight`

Action types:
- `reformat_high_value_misaligned_content`
- `conduct_intent_audit`
- `reformat_misaligned_content`
- `create_intent_matched_content`
- `audit_content_format_quarterly`

Frontend projection:
- parent shows top intent action
- subpage shows full intent action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Intent Action Queue`

UI implication:
- action copy should name the misaligned keyword or content format

### Search Intent Classifier Parent Screen Recommendation
- feature card: `Content-intent mismatches that limit conversion and ranking`
- top finding: alignment score and high-value mismatch count
- top action: reformat high-value misaligned content
- secondary signal: dominant intent type
- links to subpages

### Search Intent Classifier Archetype Subpages
- `Intent Distribution`
- `Intent Alignment`
- `High-Value Intent Mismatches`
- `Content Creation Opportunities`
- `Intent Action Queue`
- `Keyword Intent Source`

---

## Module 14: SERP Feature Analyzer

### Backend Files Audited
- `backend/src/modules/serp-feature-analyzer/analysis.js`
- `backend/src/modules/serp-feature-analyzer/insights.js`
- `backend/src/modules/serp-feature-analyzer/actions.js`

### Backend Module Key
`serp_feature_analyzer`

### Implemented Backend Capabilities

#### Capability SFA-01: SERP Entry Normalization
Source:
- `normalizeFeatureInput`
- `normalizeKeywordSerpEntry`

What it does:
- accepts `serpEntries` or `keywords` array
- resolves keyword, URL, current position, featuresPresent, featuresOwned
- filters to known feature keys only

Feature keys tracked:
- featured_snippet, knowledge_panel, local_pack, image_carousel, video_carousel, people_also_ask, sitelinks

Output:
- normalized SERP entry list

Frontend projection:
- parent shows tracked keyword count and feature gap count

Archetype subpage:
- Configuration Archetype subpage: `SERP Data Source`

UI implication:
- show `24 keywords analyzed for SERP features` not raw fields

#### Capability SFA-02: CTR Impact Scoring
Source:
- `FEATURE_CTR_IMPACT`
- `analyzeKeywordFeatures`

CTR boost values:
- featured_snippet: +8%
- knowledge_panel: +5%
- local_pack: +15%
- image_carousel: +3%
- video_carousel: +4%
- people_also_ask: +2%
- sitelinks: +10%

What it does:
- computes estimated CTR lift from capturing each feature gap
- computes total estimated CTR lift per keyword
- identifies high-value gaps (featured_snippet, local_pack, sitelinks)

Frontend projection:
- parent shows total estimated CTR lift as opportunity signal
- subpage shows per-feature CTR impact

Archetype subpage:
- Detail Drilldown Archetype subpage: `SERP Feature Impact`

UI implication:
- show `Capturing these features could lift CTR by +24%` not raw ctrBoost values

#### Capability SFA-03: Feature Gap Analysis
Source:
- `analyzeKeywordFeatures`
- `analyzeFeatureOpportunities`

What it does:
- identifies features present in SERP but not owned by target
- computes feature ownership ratio per keyword
- identifies eligibility requirements for each gap feature
- sorts all gaps by CTR boost value

Frontend projection:
- parent shows top feature gap as primary opportunity
- subpage shows full gap list with eligibility requirements

Archetype subpage:
- Analysis Feed Archetype subpage: `Feature Gap List`

UI implication:
- show `Featured snippet available but not captured` not `featureGap: featured_snippet`

#### Capability SFA-04: Eligibility Requirements
Source:
- `ELIGIBILITY_REQUIREMENTS`
- `scoreEligibility`

Requirements per feature:
- featured_snippet: structured Q&A, definitions, steps, comparison tables
- local_pack: GBP, local NAP, local keyword targeting
- people_also_ask: FAQ schema, question headings, concise answers
- image_carousel: optimised images, image schema, alt text
- video_carousel: YouTube video, VideoObject schema
- sitelinks: brand recognition, clear structure, high brand search volume
- knowledge_panel: Wikipedia/Wikidata, consistent brand mentions

Frontend projection:
- subpage shows requirements as implementation checklist per feature

Archetype subpage:
- Detail Drilldown Archetype subpage: `Feature Eligibility Checklist`

UI implication:
- frame requirements as `What you need to capture this feature`

#### Capability SFA-05: SERP Feature Actions
Source:
- `prioritizeSerpFeatureActions`
- `createActionFromInsight`

Action types:
- `optimize_for_featured_snippet`
- `optimise_for_local_pack`
- `add_faq_schema_for_paa`
- `prioritise_serp_feature_capture`
- `monitor_serp_feature_ownership`

Frontend projection:
- parent shows top SERP feature action
- subpage shows full action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `SERP Feature Action Queue`

UI implication:
- action copy should name the specific feature and its content or schema requirement

### SERP Feature Analyzer Parent Screen Recommendation
- feature card: `SERP features you are not capturing that lift click rates`
- top finding: total estimated CTR lift and top feature gap
- top action: optimize for featured snippet or local pack
- secondary signal: feature ownership ratio
- links to subpages

### SERP Feature Analyzer Archetype Subpages
- `SERP Feature Impact`
- `Feature Gap List`
- `Feature Eligibility Checklist`
- `SERP Feature Action Queue`
- `SERP Data Source`

---

## Module 15: Topical Authority

### Backend Files Audited
- `backend/src/modules/topical-authority/analysis.js`
- `backend/src/modules/topical-authority/insights.js`
- `backend/src/modules/topical-authority/actions.js`

### Backend Module Key
`topical_authority`

### Implemented Backend Capabilities

#### Capability TA-01: Topical Input Normalization
Source:
- `normalizeTopicalInput`
- `normalizeTopic`
- `normalizeContent`
- `normalizeCompetitorTopic`

What it does:
- accepts `targetTopics` with topicKey and subtopics array
- accepts `existingContent` with url, topicKey, subtopicKey, wordCount, hasSchema
- accepts `competitorTopics` with competitorRef and topics array

Output:
- normalized topic, content, and competitor topic lists

Frontend projection:
- parent shows topic count and coverage ratio

Archetype subpage:
- Configuration Archetype subpage: `Topic Setup`

UI implication:
- show `12 core topics tracked, 67% covered` not raw field names

#### Capability TA-02: Topic Coverage Mapping
Source:
- `buildCoverageMap`

What it does:
- maps existing content to target topics by topicKey
- classifies topics as covered or uncovered
- computes coverage ratio

Frontend projection:
- parent shows coverage ratio as primary authority signal
- subpage shows uncovered topic list

Archetype subpage:
- Analysis Feed Archetype subpage: `Topic Coverage Map`

UI implication:
- frame as `5 core topics have no content yet`

#### Capability TA-03: Cluster Completeness Scoring
Source:
- `scoreCluster`
- `analyzeClusterCompleteness`

What it does:
- identifies pillar page existence (wordCount 2000+)
- counts supporting pieces below 2000 words
- computes subtopic coverage ratio
- scores cluster: pillar (50) + supporting pieces up to 5 x 10
- flags thin clusters (has pillar but fewer than 3 supporting pieces)
- identifies missing pillars (covered topics without a pillar page)

Frontend projection:
- subpage shows cluster scores and thin cluster list

Archetype subpage:
- Detail Drilldown Archetype subpage: `Cluster Completeness`

UI implication:
- frame as `This topic has a pillar page but needs more supporting articles`

#### Capability TA-04: Competitor Topic Gap Analysis
Source:
- `analyzeCompetitorTopicGaps`

What it does:
- identifies topics covered by competitors but not by the target
- counts how many competitors cover each gap topic
- sorts gap topics by coverage frequency

Frontend projection:
- subpage shows competitor topic gaps as content priority list

Archetype subpage:
- Analysis Feed Archetype subpage: `Competitor Topic Gaps`

UI implication:
- frame as `Competitors are covering topics you haven't written about`

#### Capability TA-05: Semantic Depth Analysis
Source:
- `analyzeSemanticDepth`

What it does:
- computes average word count across existing content
- computes schema adoption ratio
- computes depth score from word count and schema adoption

Frontend projection:
- subpage shows semantic depth score and schema adoption rate

Archetype subpage:
- Detail Drilldown Archetype subpage: `Semantic Depth`

UI implication:
- frame as `Content depth and schema adoption affect topical authority signals`

#### Capability TA-06: Topical Authority Actions
Source:
- `prioritizeTopicalAuthorityActions`
- `createActionFromInsight`

Action types:
- `create_content_for_uncovered_topics`
- `create_missing_pillar_pages`
- `fill_competitor_topic_gaps`
- `expand_thin_topic_clusters`
- `add_schema_to_existing_content`
- `schedule_topical_gap_review`

Frontend projection:
- parent shows top topical action
- subpage shows full action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Topical Authority Action Queue`

UI implication:
- action copy should name the specific topic and what type of content is needed

### Topical Authority Parent Screen Recommendation
- feature card: `Topic coverage gaps that limit your domain-wide ranking signal`
- top finding: authority tier and coverage ratio
- top action: create content for uncovered topics or create missing pillar pages
- secondary signal: competitor topic gap count
- links to subpages

### Topical Authority Archetype Subpages
- `Topic Coverage Map`
- `Cluster Completeness`
- `Competitor Topic Gaps`
- `Semantic Depth`
- `Topical Authority Action Queue`
- `Topic Setup`

---

## Module 16: Site Architecture

### Backend Files Audited
- `backend/src/modules/site-architecture/analysis.js`
- `backend/src/modules/site-architecture/insights.js`
- `backend/src/modules/site-architecture/actions.js`

### Backend Module Key
`site_architecture`

### Implemented Backend Capabilities

#### Capability SAR-01: Architecture Input Normalization
Source:
- `normalizeArchitectureInput`
- `normalizePage`
- `normalizeLinkEdge`

What it does:
- accepts `pages` with url, depth, inboundInternalLinks, outboundInternalLinks, wordCount, lastModified, isRedirect, redirectDepth
- accepts `internalLinkGraph` with sourceUrl, targetUrl, anchorText

Output:
- normalized page list and link edge list

Frontend projection:
- parent shows page count and architecture score

Archetype subpage:
- Configuration Archetype subpage: `Architecture Data Source`

UI implication:
- show `340 pages analyzed` not raw field names

#### Capability SAR-02: Crawl Depth Analysis
Source:
- `analyzeCrawlDepth`

What it does:
- buckets pages into depth 1, 2, 3, and 4+ categories
- computes deep page ratio (pages at depth 4+)
- computes depth score starting at 100 minus deep page ratio
- flags when deep page ratio exceeds 15%

Frontend projection:
- parent shows crawl depth signal and deep page count

Archetype subpage:
- Detail Drilldown Archetype subpage: `Crawl Depth`

UI implication:
- frame as `Too many pages are buried too deep for Googlebot to find`

#### Capability SAR-03: Orphan Page Detection
Source:
- `analyzeOrphanPages`

What it does:
- identifies pages with zero inbound internal links
- computes orphan ratio
- classifies orphan severity: high (>10%), medium (>5%), low

Frontend projection:
- parent shows orphan count as a crawl equity issue
- subpage shows orphan URL list

Archetype subpage:
- Detail Drilldown Archetype subpage: `Orphan Pages`

UI implication:
- frame as `These pages are not linked from anywhere and may not be crawled`

#### Capability SAR-04: Link Equity Distribution
Source:
- `analyzeLinkEquity`
- `computeGiniCoefficient`

What it does:
- sorts pages by inbound internal link count
- extracts top 10 most-linked and bottom-linked pages
- computes Gini coefficient of link count distribution
- flags concentration when Gini exceeds 0.7

Frontend projection:
- subpage shows link equity distribution with top and bottom linked pages

Archetype subpage:
- Detail Drilldown Archetype subpage: `Link Equity Distribution`

UI implication:
- frame as `Internal links are concentrated on a few pages while most get none`

#### Capability SAR-05: Topic Silo Analysis
Source:
- `analyzeTopicSilos`

What it does:
- groups pages by first URL path segment
- identifies clusters with cross-links in the internal link graph
- computes silo score as percentage of cross-linked clusters
- flags when silo score is below 60 with multiple clusters

Frontend projection:
- subpage shows silo cluster structure and cross-link gaps

Archetype subpage:
- Analysis Feed Archetype subpage: `Topic Silo Structure`

UI implication:
- frame as `Topic clusters are not internally linked — authority signals are fragmented`

#### Capability SAR-06: Redirect Chain Analysis
Source:
- `analyzeRedirectChains`

What it does:
- identifies pages with isRedirect and redirectDepth 2 or higher
- counts chains and finds maximum chain depth

Frontend projection:
- subpage shows redirect chain URLs as link equity fix targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `Redirect Chains`

UI implication:
- frame as `Each redirect hop wastes link authority`

#### Capability SAR-07: Overall Architecture Score
Source:
- `analyzeSiteArchitecture`
- `computeOverallHealthScore`

What it does:
- weights crawl depth score (35%), orphan-free ratio (30%), silo score (35%)
- classifies architecture band: healthy (75+), needs_work (50-74), poor (below 50)

Frontend projection:
- parent shows architecture score and band
- critical issues surface as top action triggers

Archetype subpage:
- Dashboard Archetype subpage: `Architecture Health Score`

UI implication:
- show `Architecture: 58/100 — needs work` with clear band label

#### Capability SAR-08: Site Architecture Actions
Source:
- `prioritizeSiteArchitectureActions`
- `createActionFromInsight`

Action types:
- `link_orphan_pages`
- `flatten_deep_pages`
- `redistribute_internal_link_equity`
- `strengthen_topic_silos`
- `eliminate_redirect_chains`
- `schedule_architecture_reaudit`

Frontend projection:
- parent shows top architecture action
- subpage shows full action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Architecture Action Queue`

UI implication:
- action copy should name the structural issue and the fix instruction

### Site Architecture Parent Screen Recommendation
- feature card: `Site structure issues that waste crawl budget and link authority`
- top finding: architecture score and worst dimension
- top action: link orphan pages or flatten deep pages
- secondary signal: orphan count or deep page count
- links to subpages

### Site Architecture Archetype Subpages
- `Architecture Health Score`
- `Crawl Depth`
- `Orphan Pages`
- `Link Equity Distribution`
- `Topic Silo Structure`
- `Redirect Chains`
- `Architecture Action Queue`
- `Architecture Data Source`

---

## Module 17: Analytics Integration

### Backend Files Audited
- `backend/src/modules/analytics-integration/analysis.js`
- `backend/src/modules/analytics-integration/insights.js`
- `backend/src/modules/analytics-integration/actions.js`

### Backend Module Key
`analytics_integration`

### Implemented Backend Capabilities

#### Capability AI-01: Analytics Input Normalization
Source:
- `normalizeAnalyticsInput`
- `normalizeSearchEntry`
- `normalizePageMetric`
- `normalizeCrawlError`

What it does:
- accepts `gscData` with searchAnalytics, indexCoverage, crawlErrors, coreWebVitals
- accepts `ga4Data` with pageMetrics and totalOrganicSessions
- normalizes query, clicks, impressions, CTR, position per GSC entry
- normalizes URL, organicSessions, conversions, bounceRate per GA4 page metric

Output:
- normalized GSC and GA4 data structures

Frontend projection:
- configuration subpage shows GSC and GA4 connection status

Archetype subpage:
- Configuration Archetype subpage: `Analytics Connection`

UI implication:
- show `GSC connected — 156 queries, GA4 connected — 44 pages` not raw fields

#### Capability AI-02: CTR Efficiency Analysis
Source:
- `analyzeCtrEfficiency`
- `ctrEfficiencyScore`
- `ctrOpportunityLift`

What it does:
- filters entries with 100+ impressions and known position
- computes CTR efficiency as ratio of actual to expected CTR by position
- flags underperformers when efficiency is below 0.7 with 500+ impressions
- computes estimated click lift per keyword
- sorts by estimated click lift

Frontend projection:
- parent shows total estimated click lift and underperformer count
- subpage shows underperformer list with rewrite targets

Archetype subpage:
- Detail Drilldown Archetype subpage: `CTR Underperformers`

UI implication:
- frame as `These keywords rank well but get fewer clicks than expected`

#### Capability AI-03: Page 2 Quick Win Detection
Source:
- `analyzeTrafficOpportunities`

What it does:
- identifies GSC entries at position 11-20 with 50+ impressions
- identifies high-click page 2 entries as momentum proxies
- sorts by impression count

Frontend projection:
- parent shows page 2 quick win count as high-ROI opportunity signal

Archetype subpage:
- Detail Drilldown Archetype subpage: `Page 2 Quick Wins`

UI implication:
- frame as `Keywords one push away from page 1 with real search volume`

#### Capability AI-04: Index Health Analysis
Source:
- `analyzeIndexHealth`

What it does:
- computes index health score from GSC coverage errors, warnings, and crawl errors
- classifies error types from crawl error objects
- flags when total issues are present

Frontend projection:
- subpage shows index coverage errors with type breakdown

Archetype subpage:
- Detail Drilldown Archetype subpage: `Index Coverage`

UI implication:
- frame as `Pages with errors cannot rank regardless of content quality`

#### Capability AI-05: Landing Page Performance Analysis
Source:
- `analyzeLandingPagePerformance`

What it does:
- ranks pages by organic session count
- identifies declining pages with more than 20% organic session drop
- identifies high-traffic pages with zero conversions

Frontend projection:
- parent shows declining page count as an urgent recovery signal
- subpage shows declining page list and zero-conversion pages

Archetype subpage:
- Analysis Feed Archetype subpage: `Landing Page Performance`

UI implication:
- frame as `These pages are losing organic traffic and need investigation`

#### Capability AI-06: Overall Analytics Health Score
Source:
- `computeOverallHealthScore`
- `analyzeAnalyticsData`

What it does:
- weights CTR score (35%), index health score (35%), traffic stability score (30%)
- classifies health band: healthy (75+), needs_work (50-74), critical (below 50)

Frontend projection:
- parent shows analytics health score as overall signal quality indicator

Archetype subpage:
- Dashboard Archetype subpage: `Analytics Health Score`

UI implication:
- show `Analytics health: 71/100 — needs work` with band label

#### Capability AI-07: Analytics Actions
Source:
- `prioritizeAnalyticsActions`
- `createActionFromInsight`

Action types:
- `optimise_titles_meta_for_ctr`
- `push_page2_to_page1`
- `investigate_declining_pages`
- `fix_index_coverage_errors`
- `add_cta_to_zero_conversion_pages`
- `refresh_analytics_review_monthly`

Frontend projection:
- parent shows top analytics action
- subpage shows full analytics action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Analytics Action Queue`

UI implication:
- action copy should tie directly to the specific query or page identified

### Analytics Integration Parent Screen Recommendation
- feature card: `GSC and GA4 signals turned into ranking and traffic decisions`
- top finding: analytics health score and most urgent signal
- top action: optimise CTR or investigate declining pages
- secondary signal: page 2 quick win count or index error count
- links to subpages

### Analytics Integration Archetype Subpages
- `Analytics Health Score`
- `CTR Underperformers`
- `Page 2 Quick Wins`
- `Index Coverage`
- `Landing Page Performance`
- `Analytics Action Queue`
- `Analytics Connection`

---

## Module 18: Local SEO

### Backend Files Audited
- `backend/src/modules/local-seo/analysis.js`
- `backend/src/modules/local-seo/insights.js`
- `backend/src/modules/local-seo/actions.js`

### Backend Module Key
`local_seo`

### Implemented Backend Capabilities

#### Capability LS-01: Local SEO Input Normalization
Source:
- `normalizeLocalSeoInput`
- `normalizeCitation`
- `normalizeLocalKeyword`

What it does:
- accepts `businessName`, `address`, `phone`, `website`
- accepts `googleBusinessProfile` (or `gbp`) with category, hours, photos, posts, QA, description, attributes, products
- accepts `citations` array with source, name, address, phone
- accepts `localKeywords` with keyword, localPackPosition, organicPosition
- accepts `reviewSignals` with totalReviews, averageRating, monthlyVelocity, responseRate

Output:
- normalized local SEO data structure

Frontend projection:
- configuration subpage shows GBP connection and citation count

Archetype subpage:
- Configuration Archetype subpage: `Local SEO Setup`

UI implication:
- show `GBP connected — 23 citations tracked` not raw field names

#### Capability LS-02: Google Business Profile Scoring
Source:
- `scoreGbp`

Score contributors:
- category set: +10
- hours complete: +8
- 10+ photos: +7, 3+ photos: +4
- description present: +5
- posts active: +5
- products complete: +5

Issue types:
- `gbp_missing_category`
- `gbp_hours_incomplete`
- `gbp_insufficient_photos`
- `gbp_missing_description`
- `gbp_no_recent_posts`

Frontend projection:
- parent shows GBP score and top missing element
- subpage shows full GBP checklist

Archetype subpage:
- Detail Drilldown Archetype subpage: `Google Business Profile`

UI implication:
- frame as `Your GBP is incomplete and reduces local pack eligibility`

#### Capability LS-03: NAP Consistency Analysis
Source:
- `scoreNapConsistency`

What it does:
- compares business name, address, and phone across all citations
- counts consistent citations
- generates NAP issues list for inconsistent citations
- computes NAP consistency ratio and score

Frontend projection:
- parent shows NAP consistency ratio as a trust signal
- subpage shows specific inconsistencies per citation source

Archetype subpage:
- Detail Drilldown Archetype subpage: `NAP Consistency`

UI implication:
- frame as `Inconsistent business info confuses Google and reduces local authority`

#### Capability LS-04: Local Pack Visibility Scoring
Source:
- `scoreLocalVisibility`

What it does:
- counts keywords where local pack position is 1-3
- computes local pack ratio
- computes average pack position
- scores visibility from pack ratio

Frontend projection:
- parent shows local pack presence count and average position
- subpage shows per-keyword pack visibility

Archetype subpage:
- Analysis Feed Archetype subpage: `Local Pack Visibility`

UI implication:
- frame as `You appear in the local pack for 4 of 12 tracked keywords`

#### Capability LS-05: Review Signal Scoring
Source:
- `scoreReviews`

What it does:
- scores average rating: 4.5+ (8), 4.0+ (5), below 4.0 (2)
- scores monthly velocity: 5+/month (4), 2+/month (2)
- scores response rate: 80%+ (3), 50%+ (1)
- flags low rating, slow velocity, and low response rate issues

Frontend projection:
- parent shows average rating and velocity as trust signals
- subpage shows review health detail

Archetype subpage:
- Detail Drilldown Archetype subpage: `Review Health`

UI implication:
- frame as `Review velocity is too low to maintain local ranking momentum`

#### Capability LS-06: Overall Local Score and Band
Source:
- `analyzeLocalSeo`

What it does:
- sums GBP score (max 40), NAP score (max 20), visibility score (max 25), review score (max 15)
- classifies band: strong (70+), moderate (40+), weak (below 40)

Frontend projection:
- parent shows overall local score and band as primary local signal

Archetype subpage:
- Dashboard Archetype subpage: `Local SEO Score`

UI implication:
- show `Local SEO: 54/100 — moderate` with band label

#### Capability LS-07: Local SEO Actions
Source:
- `prioritizeLocalSeoActions`
- `createActionFromInsight`

Action types:
- `complete_gbp_profile`
- `fix_nap_citations`
- `build_local_pack_presence`
- `expand_local_pack_coverage`
- `build_review_velocity`
- `monitor_local_seo_monthly`

Frontend projection:
- parent shows top local action
- subpage shows full local action queue

Archetype subpage:
- Analysis Feed Archetype subpage: `Local SEO Action Queue`

UI implication:
- action copy should name the specific GBP field, citation source, or review strategy

### Local SEO Parent Screen Recommendation
- feature card: `Local signals that control your visibility in Google Maps and local search`
- top finding: overall local score and biggest gap (GBP, NAP, or local pack)
- top action: complete GBP or fix NAP inconsistencies
- secondary signal: local pack presence count
- links to subpages

### Local SEO Archetype Subpages
- `Local SEO Score`
- `Google Business Profile`
- `NAP Consistency`
- `Local Pack Visibility`
- `Review Health`
- `Local SEO Action Queue`
- `Local SEO Setup`
