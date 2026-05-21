# Frontend Module Feature Mapping

## Anchors
- `ops/MASTER_BUILD_SPEC.md`
- `ops/MARKET_RESEARCH_PLAYSTORE.md`
- `docs/backend/reference/BACKEND_MASTER_SPEC.md`
- `docs/backend/reference/BACKEND_MODULE_BOUNDARIES.md`
- `docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md`
- `docs/frontend/reference/FRONTEND_BACKEND_CONTENT_MAPPING.md`

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

---

## Phase 2 Expansion Modules — Frontend Phase 2

The following 10 modules are fully implemented in the backend (`backend_active`) as of 2026-05-15. They have no frontend screens yet. Each entry below defines the intended feature surface for when Phase 2 frontend work begins. All 10 follow the same gated-module rule: show feature-value previews with commercial intent, not empty scaffolds.

---

## Module 9: Technical SEO Audit

### Backend Capability
- Core Web Vitals scoring (LCP, CLS, INP)
- crawl health analysis (broken URLs, status codes)
- robots.txt and sitemap configuration auditing
- structured data / schema validation

### Backend Action Types
- `fix_crawl_issue`
- `improve_core_web_vitals`
- `fix_robots_sitemap`
- `add_schema_markup`

### Commercial Job
Surface the technical issues that are actively blocking crawl coverage and ranking performance — before any content or keyword work begins.

### Frontend Feature Surfaces
- Technical Health Score Board
- Core Web Vitals Risk Map
- Crawl Issue Priority Queue
- Robots / Sitemap Status Panel

### Required Screen Blocks
- CWV pass/fail summary (LCP/CLS/INP)
- top crawl issue with affected URL count
- sitemap/robots status
- highest-priority technical remediation action

### Commercial Value
The user can identify which technical issue is suppressing rankings and what to fix first — without needing to interpret raw audit data.

### Demo Data Requirement
Use CWV scores, crawl error count, broken URL samples, robots disallow paths, schema warnings, and top priority action.

---

## Module 10: On-Page SEO Scorer

### Backend Capability
- per-page on-page signal scoring
- title tag and meta description analysis
- heading hierarchy evaluation
- keyword density and coverage scoring

### Backend Action Types
- `fix_missing_title`
- `fix_duplicate_meta`
- `fix_thin_content`
- `add_keyword_coverage`

### Commercial Job
Score individual pages so the user knows exactly which page needs fixing and why — without reading every page manually.

### Frontend Feature Surfaces
- Page Score Leaderboard
- Meta Tag Audit Board
- Thin Content Detector
- On-Page Fix Queue

### Required Screen Blocks
- lowest-scoring page with primary issue
- missing keyword count
- meta description status
- highest-priority on-page fix action

### Commercial Value
The user can rank pages by SEO health and act on the weakest ones first rather than treating all pages equally.

### Demo Data Requirement
Use pages, score, missing title/meta flags, heading issues, keyword count per page, and priority fix action.

---

## Module 11: Backlink Intelligence

### Backend Capability
- domain authority and link quality scoring
- toxic / unnatural link risk detection
- anchor text distribution analysis
- link acquisition opportunity identification

### Backend Action Types
- `acquire_link_target`
- `disavow_toxic_link`
- `diversify_anchor_text`

### Commercial Job
Show the state of the link profile and what one link action to take first — not a raw data dump of every backlink.

### Frontend Feature Surfaces
- Link Profile Health Board
- Toxic Link Risk Detector
- Anchor Distribution Map
- Link Acquisition Opportunity Queue

### Required Screen Blocks
- authority score summary
- toxic link count and risk level
- anchor diversity signal
- top link acquisition target with rationale

### Commercial Value
The user can decide whether their link profile is helping or hurting rankings and act on the most impactful link opportunity.

### Demo Data Requirement
Use DA score, referring domain count, toxic link count, anchor type distribution, top acquisition target domain, and priority action.

---

## Module 12: E-E-A-T Signals

### Backend Capability
- author and expertise signal evaluation
- trust marker assessment (About, Contact, credentials)
- site-level authority scoring
- editorial citation gap detection

### Backend Action Types
- `add_author_bio`
- `improve_about_contact`
- `acquire_editorial_citation`
- `add_trust_schema`

### Commercial Job
Show which trust and authority signals are weakest and which fix will have the most immediate impact on organic visibility.

### Frontend Feature Surfaces
- Trust Signal Board
- Author Authority Map
- E-E-A-T Gap Detector
- Trust Improvement Queue

### Required Screen Blocks
- E-E-A-T score summary
- biggest single trust gap
- sample missing signal
- primary trust-building action

### Commercial Value
The user understands exactly which E-E-A-T dimension is underweight and what specific content or structural change addresses it.

### Demo Data Requirement
Use signal categories (experience, expertise, authority, trust), per-category scores, missing signal examples, and top trust action.

---

## Module 13: Search Intent Classifier

### Backend Capability
- 4-intent keyword classification (informational, navigational, transactional, commercial)
- content-format alignment recommendations per intent

### Backend Action Types
- `align_content_format_to_intent`
- `create_intent_aligned_content`

### Commercial Job
Match keyword targeting to what searchers actually want — expose where the current content format mismatches the dominant intent.

### Frontend Feature Surfaces
- Intent Distribution Map
- Misaligned Keyword Detector
- Content Format Recommendation Board
- Intent-Aligned Action Queue

### Required Screen Blocks
- intent distribution across tracked keywords
- highest-volume misaligned keyword
- recommended content format
- content alignment action

### Commercial Value
The user can stop targeting keywords with the wrong content format and see exactly what format change each keyword set needs.

### Demo Data Requirement
Use keywords, intent category, confidence, current page format, recommended format, and priority alignment action.

---

## Module 14: SERP Feature Analyzer

### Backend Capability
- SERP feature presence detection across target keywords
- feature ownership gap identification
- structured data and content opportunity mapping

### Backend Action Types
- `implement_schema_type`
- `restructure_for_featured_snippet`
- `build_local_signals`

### Commercial Job
Show which SERP real estate the target does not own and what it takes to win it — featured snippets, knowledge panels, PAA boxes, and more.

### Frontend Feature Surfaces
- SERP Ownership Map
- Feature Capture Priority Board
- Schema Gap Detector
- Structured Data Action Queue

### Required Screen Blocks
- features triggered for target keywords
- features not owned by target URL
- highest-value unowned feature
- capture action with schema or content recommendation

### Commercial Value
The user can prioritize structured data and content work that will win visible SERP space rather than improving invisible ranking positions.

### Demo Data Requirement
Use feature type, keyword trigger count, ownership status (owned/unowned), schema recommendation, and priority capture action.

---

## Module 15: Topical Authority

### Backend Capability
- topic cluster coverage depth and breadth analysis
- topical gap detection against target topics
- thin topical coverage identification

### Backend Action Types
- `create_gap_fill_content`
- `consolidate_thin_coverage`
- `build_internal_cluster_links`

### Commercial Job
Show which topics the site covers shallowly or not at all — and what content to create first to build authority in each cluster.

### Frontend Feature Surfaces
- Topical Coverage Map
- Gap Priority Board
- Cluster Depth Analyzer
- Content Plan Queue

### Required Screen Blocks
- topic coverage score
- biggest gap cluster with missing subtopics
- content creation priority
- internal linking opportunity

### Commercial Value
The user can see which topic areas need deeper coverage to compete on authority — and get a prioritized content plan, not a generic gap list.

### Demo Data Requirement
Use topics, coverage %, gap count, uncovered subtopics, cluster depth score, and top content creation action.

---

## Module 16: Site Architecture

### Backend Capability
- crawl depth and hierarchy analysis
- internal link gap and orphaned page detection
- URL structure evaluation

### Backend Action Types
- `flatten_crawl_hierarchy`
- `link_orphaned_page`
- `improve_url_structure`
- `create_hub_page`

### Commercial Job
Fix the structural problems that prevent crawlers and users from reaching all content — not visible in rankings but directly responsible for missed organic coverage.

### Frontend Feature Surfaces
- Architecture Health Board
- Deep Page Risk Map
- Orphaned Page Detector
- Internal Link Fix Queue

### Required Screen Blocks
- average crawl depth
- orphaned page count
- deepest problematic page
- highest-priority architecture fix

### Commercial Value
The user can identify which structural issues are hiding content from search engines and act on the fix that will unlock the most crawl coverage.

### Demo Data Requirement
Use crawl depth distribution, orphaned page samples, link gap count, URL structure issues, and top fix action.

---

## Module 17: Analytics Integration

### Backend Capability
- Google Search Console search analytics ingestion
- GA4 page metrics ingestion
- cross-signal performance correlation (impressions, clicks, CTR, position, sessions)

### Backend Action Types
- `recover_traffic_decline`
- `improve_low_ctr_query`
- `fix_page_performance_gap`

### Commercial Job
Turn raw analytics data into decisions — show what traffic signal needs acting on, not just what the chart looks like.

### Frontend Feature Surfaces
- Traffic Health Board
- CTR Opportunity Map
- Performance Correlation View
- Analytics Action Queue

### Required Screen Blocks
- top organic session trend (up/down)
- highest-impression / lowest-CTR query
- performance gap with recommended fix
- traffic recovery or CTR improvement action

### Commercial Value
The user can act on analytics signals rather than just observe them — each data point maps to a specific SEO action.

### Demo Data Requirement
Use top queries, impressions, clicks, CTR, position, trend direction, correlated SEO signal, and recommended action.

---

## Module 18: Local SEO (opt-in)

**Note:** This module is opt-in only (`defaultActive: false`). It must be explicitly activated via `activationOverrides: { local_seo: true }` with `options: { allowInactiveActivation: true }`. The frontend should gate this module behind an explicit activation flow, not show it as standard.

### Backend Capability
- NAP (Name / Address / Phone) citation consistency analysis
- Google Business Profile completeness scoring
- geo-specific rank factor evaluation

### Backend Action Types
- `fix_nap_inconsistency`
- `optimize_gmb_profile`
- `implement_local_schema`
- `build_local_links`

### Commercial Job
For businesses with physical locations or service areas — show exactly what local signals are limiting local search visibility and what to fix first.

### Frontend Feature Surfaces
- Local Citation Health Board
- GMB Completeness Scorer
- Local Rank Signal Map
- Local Fix Queue

### Required Screen Blocks
- NAP consistency score across citation sources
- GMB completeness percentage
- top local signal gap
- highest-priority local fix action

### Commercial Value
The user can stop losing local search visibility to competitors who have cleaner citations and more complete GMB profiles.

### Demo Data Requirement
Use citation sources, consistency score, GMB completeness %, geo-rank signal samples, and top local action.

---

## Acceptance Checklist
- Each module has a named commercial feature surface.
- Each module maps backend action types to frontend actions.
- Each module shows what user decision is being supported.
- Each module shows why the feature matters commercially.
- MVP modules do not look like generic dashboards.
- Gated modules do not look like empty placeholders.
- Unified workflow shows one prioritized action path across modules.
- Phase 2 expansion modules have defined feature surfaces ready for implementation.
