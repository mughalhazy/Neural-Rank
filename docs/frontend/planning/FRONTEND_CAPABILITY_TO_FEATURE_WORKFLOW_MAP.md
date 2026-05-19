# Frontend Capability To Feature Workflow Map

## Purpose
This document turns audited backend capabilities into deterministic frontend features, archetype subpages, workflows, and outcomes.

It must be updated after each module capability audit and before any UI implementation for that module.

## Anchors
- `docs/frontend/planning/FRONTEND_BACKEND_CAPABILITY_AUDIT.md`
- `docs/frontend/reference/FRONTEND_MODULE_FEATURE_MAPPING.md`
- `docs/frontend/phases/PHASE_01_ARCHETYPES_AND_MAPPING.md`
- `docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md`

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

## Module 2: Content / Listing Insights

### Parent Screen
Screen:
- `Content / Listing Insights`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show the top content or listing gap and the top rewrite action

Parent surface:
- Feature: `Content and listing gaps that affect ranking and conversion`
- Top finding: highest-severity content or listing gap
- Top action: highest-priority content action
- Secondary signal: keyword coverage status or competitor depth gap

### Subpage Map

#### Subpage CLI-SP-01: Keyword Coverage Gaps
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- CLI-02 Keyword Coverage Analysis

Feature:
- `Keywords missing from your content`

User job:
- identify which target keywords are absent from listing or website copy

Workflow step:
- inspect missing keywords
- identify rewrite targets

Outcome:
- user knows which keywords to add to listing and website content

#### Subpage CLI-SP-02: Content and Listing Quality
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- CLI-03 Website Content Quality Analysis
- CLI-04 App Listing Quality Analysis

Feature:
- `Content quality observations`

User job:
- review structural and depth issues across website and listing

Workflow step:
- inspect observations
- prioritize content improvement work

Outcome:
- quality gaps become concrete rewrite or expansion targets

#### Subpage CLI-SP-03: E-E-A-T Content Signals
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- CLI-05 E-E-A-T Content Signal Detection

Feature:
- `Author experience and citation signals`

User job:
- identify where to add first-hand experience markers and source citations

Workflow step:
- review E-E-A-T signal absence
- plan author voice and citation additions

Outcome:
- content credibility improvements are added to the rewrite plan

#### Subpage CLI-SP-04: Competitor Content Depth
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- CLI-06 Competitor Content Depth Comparison

Feature:
- `Content depth versus competitors`

User job:
- understand how much content depth is needed to reach competitor parity

Workflow step:
- inspect depth gap
- decide whether to expand content length

Outcome:
- content expansion target is set based on competitor benchmark

#### Subpage CLI-SP-05: Content Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- CLI-07 Content Listing Insights Generation
- CLI-08 Content Listing Action Prioritization

Feature:
- `Content rewrite and improvement tasks`

User job:
- decide the order of content and listing improvement work

Workflow step:
- review prioritized actions
- execute highest-priority rewrite

Outcome:
- content work is sequenced by impact

### Content Listing Workflow
Workflow:
- connect content or listing source
- detect quality gaps and keyword coverage issues
- detect E-E-A-T signal absence
- compare content depth against competitors
- prioritize content actions
- execute rewrite or expansion work
- re-run after improvements

Outcome:
- user closes content gaps that were limiting conversion and ranking

---

## Module 3: Keyword Analysis

### Parent Screen
Screen:
- `Keyword Analysis`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show the top keyword opportunity and the next targeting or content action

Parent surface:
- Feature: `Keyword opportunities and risks`
- Top finding: highest-opportunity or quick-win keyword
- Top action: push page 2 keywords or target rising trend keywords
- Secondary signal: opportunity band summary or quick win count

### Subpage Map

#### Subpage KA-SP-01: Keyword Opportunity Bands
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- KA-03 Opportunity Scoring
- KA-07 High Opportunity Insight

Feature:
- `Keywords ranked by opportunity`

User job:
- identify which keywords have the most room to grow

Workflow step:
- inspect high and medium opportunity keywords
- select targeting priorities

Outcome:
- keyword targeting decisions are driven by scored opportunity bands

#### Subpage KA-SP-02: Quick Win Keywords
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- KA-05 Quick Win Detection

Feature:
- `Keywords closest to page 1`

User job:
- focus push effort on keywords at positions 11-20

Workflow step:
- inspect quick win list
- select keywords for content or link push
- execute push action

Outcome:
- high-ROI ranking improvements are prioritized over low-leverage targets

#### Subpage KA-SP-03: Rising Keywords
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- KA-04 Trend Direction Classification
- KA-06 Rising Keyword Insight

Feature:
- `Keywords with growing search demand`

User job:
- identify rising trend keywords to target before competition increases

Workflow step:
- inspect rising keywords
- create or optimize content for rising terms

Outcome:
- early positioning on rising demand before competitors respond

#### Subpage KA-SP-04: Keyword Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- KA-08 Keyword Action Prioritization

Feature:
- `Keyword targeting and content tasks`

User job:
- decide the order of keyword-driven content and targeting work

Workflow step:
- review prioritized keyword actions
- execute top action

Outcome:
- keyword intelligence becomes an ordered content and targeting plan

---

## Module 4: Rank Tracking

### Parent Screen
Screen:
- `Rank Tracking`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show top rank movement requiring a response and the next defend, recover, or expand action

Parent surface:
- Feature: `Rank movement that needs a response`
- Top finding: top decline or quick win cluster
- Top action: investigate decline or push page 2 keywords
- Secondary signal: improved count or CTR underperformer count

### Subpage Map

#### Subpage RT-SP-01: Rank Movement
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- RT-02 Movement Classification
- RT-06 Rank Decline Insight

Feature:
- `Position changes across tracked keywords`

User job:
- identify which keywords are declining or improving and require a response

Workflow step:
- inspect declined and improved keywords
- prioritize recovery or protection actions

Outcome:
- movement data drives concrete defend or recover decisions

#### Subpage RT-SP-02: Page 2 Keywords
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- RT-04 Quick Win Position Detection

Feature:
- `Keywords one push away from page 1`

User job:
- focus content and link effort on page 2 keywords with the best ROI

Workflow step:
- inspect page 2 keyword list
- execute content refresh or link push

Outcome:
- high-ROI ranking improvements are captured before slower initiatives

#### Subpage RT-SP-03: CTR Underperformers
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- RT-03 CTR Efficiency Scoring

Feature:
- `Ranking keywords with below-expected clicks`

User job:
- identify keywords where title tags and meta descriptions are reducing clicks

Workflow step:
- inspect underperformer list
- rewrite title tags and meta descriptions for affected pages

Outcome:
- organic traffic improves without any ranking change

#### Subpage RT-SP-04: Rank Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- RT-07 Rank Action Prioritization

Feature:
- `Ranked response and protection tasks`

User job:
- decide the order of rank-driven work

Workflow step:
- review prioritized rank actions
- execute top defend, recover, or expand action

Outcome:
- rank intelligence becomes a prioritized task sequence

---

## Module 5: Competitor Analysis

### Parent Screen
Screen:
- `Competitor Analysis`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show the top competitor advantage and the next gap-closing action

Parent surface:
- Feature: `Competitor advantages that need a response`
- Top finding: top pressure competitor and strongest gap dimension
- Top action: highest-priority gap action
- Secondary signal: pressured competitor count

### Subpage Map

#### Subpage CA-SP-01: Competitor Pressure Detail
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- CA-02 Multi-Dimensional Gap Identification
- CA-05 Competitor Pressure Insights

Feature:
- `Competitor gap dimensions`

User job:
- understand where each competitor is outperforming the target

Workflow step:
- inspect gap dimensions per competitor
- select the highest-impact dimension to close

Outcome:
- competitor pressure becomes a specific gap-closing strategy

#### Subpage CA-SP-02: Authority Gap
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- CA-03 Domain Authority Gap Analysis

Feature:
- `Domain authority gap versus competitors`

User job:
- understand how much authority needs to be built to close the gap

Workflow step:
- inspect DA gap and severity
- plan link acquisition strategy

Outcome:
- authority gap becomes a quantified backlink building target

#### Subpage CA-SP-03: Competitor Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- CA-06 Competitor Gap Actions

Feature:
- `Competitive response tasks`

User job:
- decide the order of competitor-driven response work

Workflow step:
- review prioritized competitor actions
- execute top gap-closing action

Outcome:
- competitor intelligence becomes an ordered competitive response plan

---

## Module 6: Optimization Layer

### Parent Screen
Screen:
- `Optimization Layer`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show the highest-gap content section and the top optimization action

Parent surface:
- Feature: `Content sections with optimization gaps`
- Top finding: highest-gap section and primary issue
- Top action: top section improvement action
- Secondary signal: sections-needing-optimization count

### Subpage Map

#### Subpage OL-SP-01: Section Optimization Detail
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- OL-02 Per-Section Optimization Scoring

Feature:
- `Per-section optimization issues`

User job:
- identify which sections have keyword, metadata, readability, or density issues

Workflow step:
- inspect section issue list
- prioritize sections for remediation

Outcome:
- section-level gaps become targeted optimization tasks

#### Subpage OL-SP-02: Stale Content
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- OL-03 Stale Content Detection

Feature:
- `Sections needing a content refresh`

User job:
- identify sections not updated in over 12 months

Workflow step:
- inspect stale section list
- schedule content refreshes

Outcome:
- freshness signals are restored through targeted content updates

#### Subpage OL-SP-03: Optimization Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- OL-05 Optimization Action Generation

Feature:
- `Optimization fix tasks`

User job:
- decide the order of content optimization work

Workflow step:
- review prioritized optimization actions
- execute top section fix

Outcome:
- content quality improves through a sequenced fix plan

---

## Module 7: Creative / Messaging Layer

### Parent Screen
Screen:
- `Creative / Messaging`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show the primary messaging gap and the top creative improvement action

Parent surface:
- Feature: `Creative and messaging gaps that weaken conversion`
- Top finding: primary gap asset and main issue
- Top action: top messaging improvement action
- Secondary signal: assets-needing-work count

### Subpage Map

#### Subpage CML-SP-01: Asset Messaging Detail
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- CML-02 Per-Asset Messaging Analysis

Feature:
- `Per-asset messaging issues`

User job:
- identify which creative assets lack theme alignment, CTAs, or sufficient copy depth

Workflow step:
- inspect asset issue list
- prioritize assets for rewrite

Outcome:
- creative gaps become concrete rewrite targets

#### Subpage CML-SP-02: Messaging Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- CML-04 Messaging Action Generation

Feature:
- `Creative improvement tasks`

User job:
- decide the order of creative and messaging work

Workflow step:
- review prioritized messaging actions
- execute top creative rewrite

Outcome:
- messaging quality improves through a sequenced action plan

---

## Module 8: Unified Workflow Layer

### Parent Screen
Screen:
- `Unified Workflow`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show the highest-priority cross-module action and coordinate execution across modules

Parent surface:
- Feature: `Your complete optimization queue across all modules`
- Foundation alert: shown when technical health score is below 50
- Quick win highlight: shown when page-2 keywords exist across modules
- Top action: highest-weighted consolidated action
- Secondary signal: total actions available across modules

### Subpage Map

#### Subpage UWL-SP-01: Unified Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- UWL-03 Priority Consolidation
- UWL-07 Unified Workflow Actions

Feature:
- `All module actions in priority order`

User job:
- execute cross-module work in the correct order without losing context

Workflow step:
- review consolidated action queue
- execute top-priority item
- mark complete and advance to next

Outcome:
- cross-module work is executed in business-value order

#### Subpage UWL-SP-02: Foundation Issue Alert
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- UWL-04 Foundation Issue Detection

Feature:
- `Technical foundation blocker`

User job:
- understand when technical issues must be resolved before other work will have full impact

Workflow step:
- inspect foundation issue detail
- route technical fix to action queue
- resolve before executing other module work

Outcome:
- users do not waste effort on content or keyword work while technical foundations are broken

#### Subpage UWL-SP-03: Quick Win Cluster
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- UWL-05 Quick Win Cluster Detection

Feature:
- `Fastest ranking wins across modules`

User job:
- identify the highest-ROI ranking opportunities available right now

Workflow step:
- inspect cross-module page-2 keyword list
- execute content or link push

Outcome:
- fastest ranking improvements are surfaced and acted on before slower initiatives

---

## Phase 2 Module Maps

## Module 9: Technical SEO Audit

### Parent Screen
Screen:
- `Technical SEO Audit`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show health score and the highest-priority technical fix

### Subpage Map

#### Subpage TSA-SP-01: Core Web Vitals
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- TSA-02 Core Web Vitals Scoring

Feature:
- `Page experience scores (LCP, CLS, INP)`

User job:
- identify which vitals are failing and plan targeted fixes

Workflow step:
- inspect vital ratings
- prioritize the worst-failing vital
- execute fix

Outcome:
- ranking eligibility improves through resolved vital failures

#### Subpage TSA-SP-02: Technical Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- TSA-09 Technical SEO Actions

Feature:
- `Technical fix tasks`

User job:
- work through technical issues in priority order

Workflow step:
- review prioritized technical actions
- execute top critical fix

Outcome:
- technical foundation is stabilized through a sequenced fix plan

---

## Module 10: On-Page SEO Scorer

### Parent Screen
Screen:
- `On-Page SEO Scorer`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show site average score and the top on-page fix

### Subpage Map

#### Subpage OPS-SP-01: Page Score Detail
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- OPS-09 Site-Wide Score Aggregation

Feature:
- `Per-page on-page scores`

User job:
- identify which pages score lowest and what their top issues are

Workflow step:
- inspect critical and needs-work pages
- prioritize the lowest-scoring pages

Outcome:
- on-page fix effort is focused on the highest-gap pages

#### Subpage OPS-SP-02: On-Page Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- OPS-10 On-Page Actions

Feature:
- `On-page fix tasks`

User job:
- work through on-page issues in priority order

Workflow step:
- review prioritized on-page actions
- execute top fix

Outcome:
- site-wide on-page score improves through a systematic fix plan

---

## Module 11: Backlink Intelligence

### Parent Screen
Screen:
- `Backlink Intelligence`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show authority tier and top link risk or opportunity

### Subpage Map

#### Subpage BI-SP-01: Toxic Links
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- BI-03 Toxicity Risk Analysis

Feature:
- `Risky backlinks that may trigger a penalty`

User job:
- identify toxic links for disavow or removal

Workflow step:
- inspect toxic link list
- prepare disavow file for worst offenders

Outcome:
- penalty risk is reduced through proactive toxic link management

#### Subpage BI-SP-02: Link Gap Opportunities
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- BI-06 Competitor Link Gap Analysis

Feature:
- `Domains that link to competitors but not to you`

User job:
- identify the highest-value outreach targets

Workflow step:
- review competitor gap domain list
- begin outreach starting with highest-DA opportunities

Outcome:
- link acquisition is targeted at the most achievable high-authority domains

#### Subpage BI-SP-03: Backlink Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- BI-07 Backlink Actions

Feature:
- `Link building and risk management tasks`

User job:
- work through link actions in priority order

Workflow step:
- review prioritized backlink actions
- execute top action

Outcome:
- authority profile improves and risk is managed through a sequenced action plan

---

## Module 12: E-E-A-T Signals

### Parent Screen
Screen:
- `E-E-A-T Signals`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show overall E-E-A-T score and the top credibility fix

### Subpage Map

#### Subpage ES-SP-01: Trust Signals
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- ES-05 Trustworthiness Scoring

Feature:
- `Core trust pages and signals`

User job:
- identify missing trust pages and signals

Workflow step:
- inspect missing trust signal types
- create missing About, Contact, Privacy Policy, and Terms pages

Outcome:
- trust foundation is established before other E-E-A-T work

#### Subpage ES-SP-02: E-E-A-T Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- ES-07 E-E-A-T Actions

Feature:
- `Credibility improvement tasks`

User job:
- work through E-E-A-T improvements in priority order

Workflow step:
- review prioritized E-E-A-T actions
- execute top credibility fix

Outcome:
- E-E-A-T score improves through a sequenced credibility building plan

---

## Module 13: Search Intent Classifier

### Parent Screen
Screen:
- `Search Intent Classifier`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show alignment score and top high-value content mismatch

### Subpage Map

#### Subpage SIC-SP-01: Intent Alignment Detail
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- SIC-02 Intent Classification
- SIC-03 Content Alignment Check
- SIC-04 High-Value Misalignment Detection

Feature:
- `Intent alignment per keyword`

User job:
- identify which keywords are served by the wrong content format

Workflow step:
- inspect misaligned keywords
- prioritize high-value (commercial/transactional) mismatches

Outcome:
- content reformatting is focused on the highest-revenue-impact mismatches

#### Subpage SIC-SP-02: Intent Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- SIC-06 Search Intent Actions

Feature:
- `Content format fix and creation tasks`

User job:
- work through intent-driven content tasks in priority order

Workflow step:
- review prioritized intent actions
- execute top reformat or content creation action

Outcome:
- content-intent alignment improves through a systematic fix plan

---

## Module 14: SERP Feature Analyzer

### Parent Screen
Screen:
- `SERP Feature Analyzer`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show total estimated CTR lift and top feature gap opportunity

### Subpage Map

#### Subpage SFA-SP-01: Feature Gap List
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- SFA-03 Feature Gap Analysis

Feature:
- `SERP features present but not owned`

User job:
- identify which features to capture and in what order by CTR impact

Workflow step:
- inspect gap list sorted by CTR boost
- select highest-impact feature to pursue

Outcome:
- feature capture efforts are prioritized by CTR lift potential

#### Subpage SFA-SP-02: SERP Feature Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- SFA-05 SERP Feature Actions

Feature:
- `Feature capture tasks`

User job:
- work through feature capture actions in priority order

Workflow step:
- review prioritized SERP feature actions
- execute top schema or content action

Outcome:
- CTR improves through systematic SERP feature capture

---

## Module 15: Topical Authority

### Parent Screen
Screen:
- `Topical Authority`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show authority tier and the top content creation or cluster action

### Subpage Map

#### Subpage TA-SP-01: Topic Coverage Map
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- TA-02 Topic Coverage Mapping
- TA-04 Competitor Topic Gap Analysis

Feature:
- `Covered and uncovered core topics`

User job:
- identify which topics need content and which competitors already cover

Workflow step:
- inspect uncovered topic list
- cross-reference with competitor gap list
- plan content creation sprint

Outcome:
- content planning is driven by topical authority gaps and competitor benchmarks

#### Subpage TA-SP-02: Cluster Completeness
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- TA-03 Cluster Completeness Scoring

Feature:
- `Topic cluster depth and pillar status`

User job:
- identify thin clusters and missing pillar pages

Workflow step:
- inspect cluster scores
- create missing pillars for highest-gap clusters
- expand thin clusters with supporting pieces

Outcome:
- topic clusters become comprehensive enough to signal authority to Google

#### Subpage TA-SP-03: Topical Authority Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- TA-06 Topical Authority Actions

Feature:
- `Content planning and creation tasks`

User job:
- work through topical authority improvements in priority order

Workflow step:
- review prioritized topical actions
- execute top content creation or cluster expansion action

Outcome:
- topical authority score improves through a sequenced content plan

---

## Module 16: Site Architecture

### Parent Screen
Screen:
- `Site Architecture`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show architecture score and the top structural fix

### Subpage Map

#### Subpage SAR-SP-01: Orphan Pages
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- SAR-03 Orphan Page Detection

Feature:
- `Pages with no internal links`

User job:
- identify and link orphaned pages to restore crawl equity

Workflow step:
- inspect orphan URL list
- add contextual internal links from relevant pages

Outcome:
- orphaned pages receive crawl equity and become part of the site's authority flow

#### Subpage SAR-SP-02: Architecture Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- SAR-08 Site Architecture Actions

Feature:
- `Structural fix tasks`

User job:
- work through architecture issues in priority order

Workflow step:
- review prioritized architecture actions
- execute top structural fix

Outcome:
- crawl efficiency and link equity distribution improve through a sequenced fix plan

---

## Module 17: Analytics Integration

### Parent Screen
Screen:
- `Analytics Integration`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show analytics health score and the top CTR or traffic action

### Subpage Map

#### Subpage AI-SP-01: CTR Underperformers
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- AI-02 CTR Efficiency Analysis

Feature:
- `Keywords ranking well but getting fewer clicks than expected`

User job:
- identify queries where title and meta rewrites will recover lost clicks

Workflow step:
- inspect underperformer list
- rewrite title tags and meta descriptions for top opportunities

Outcome:
- organic traffic increases through CTR recovery without any ranking changes

#### Subpage AI-SP-02: Analytics Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- AI-07 Analytics Actions

Feature:
- `Analytics-driven ranking and traffic tasks`

User job:
- work through analytics-derived actions in priority order

Workflow step:
- review prioritized analytics actions
- execute top action

Outcome:
- GSC and GA4 intelligence is converted into an ordered improvement plan

---

## Module 18: Local SEO

### Parent Screen
Screen:
- `Local SEO`

Archetype:
- Analysis Feed Archetype

Parent purpose:
- show local score and the top GBP or NAP fix

### Subpage Map

#### Subpage LS-SP-01: Google Business Profile
Archetype:
- Detail Drilldown Archetype

Backed by capabilities:
- LS-02 Google Business Profile Scoring

Feature:
- `GBP completeness checklist`

User job:
- identify and complete missing GBP fields

Workflow step:
- inspect GBP issue list
- complete each missing field starting with category and hours

Outcome:
- GBP completeness improves local pack eligibility

#### Subpage LS-SP-02: Local SEO Action Queue
Archetype:
- Analysis Feed Archetype

Backed by capabilities:
- LS-07 Local SEO Actions

Feature:
- `Local ranking improvement tasks`

User job:
- work through local SEO actions in priority order

Workflow step:
- review prioritized local actions
- execute top GBP, citation, or review action

Outcome:
- local visibility improves through a sequenced local ranking plan
