# Frontend Content Full System

## Purpose
This document applies the frontend content system across the full product surface.

It defines, for every module and screen, the content blocks required to convert backend intelligence into user decisions.

Every module must follow:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

Every screen must define:
- insights
- explanations
- evidence
- impact
- actions

This is structure only. It does not redesign the UI.

## Source Anchors
## Source Anchors
- `docs/product/MASTER_BUILD_SPEC.md`
- `docs/frontend/reference/FRONTEND_BACKEND_CONTENT_MAPPING.md`
- `docs/frontend/reference/FRONTEND_MICROCOPY_RULES.md`
- `docs/frontend/planning/FRONTEND_SCREEN_ARCHETYPES.md`
- `docs/frontend/phases/PHASE_01_ARCHETYPES_AND_MAPPING.md`
- `docs/frontend/archive/PHASE_06_PATTERN_LIBRARY.md`

## Global Product Content Rule
No screen may present:
- raw tables without interpretation
- charts without explanation
- metrics without meaning
- actions without reasoning
- insights without action
- passive dashboard content

Each content block must answer:
- what is happening
- why it matters
- what to do next

## Backend-To-Frontend Content Translation
Backend outputs should be transformed as:

- raw values -> signal
- grouped findings -> insight
- score, urgency, risk, confidence, opportunity -> priority
- recommendation, task, fix, next step -> action

If the backend provides only raw data, the frontend content layer must not display it as complete intelligence. It must either:
- attach interpretation,
- show an incomplete-state treatment, or
- defer the content block until interpretation exists.

## Shared Content Block Model
Every screen content block uses this structure:

```text
Block name:
<content area name>

Input:
<source or user target>

Analysis:
<backend interpretation>

Insight:
<what is happening>

Explanation:
<why it matters>

Evidence:
<supporting signal>

Impact:
<priority level>

Action:
<what to do>

Optional next step:
<drilldown, compare, refresh, add to workflow, inspect>
```

## Module 1: Review Analysis

### Screen
Review Analysis Screen

### Screen Purpose
Convert review/customer feedback into clustered trust insights and action-ready fixes.

### Content Block: Review Intake
Input:
- app reviews
- review dates
- review ratings
- review text
- source freshness

Analysis:
- cluster complaints
- detect recurring themes
- identify trust-breaking patterns
- separate product issues from messaging issues

Insight:
- recurring review themes are exposing a narrow trust problem

Explanation:
- a narrow recurring complaint is more actionable than broad sentiment decline because it can be repaired through targeted product follow-up or messaging.

Evidence:
- complaint cluster label
- mention percentage
- recurrence window
- representative short review phrase
- source freshness
- confidence level

Impact:
- critical when trust risk is recent and recurring
- high when the theme affects conversion, retention, or rating confidence
- monitor when signal is weak or low-volume

Action:
- repair messaging around the complaint
- add issue-specific release-note copy
- inspect the review cluster
- route product-fix item into workflow

Optional next step:
- open cluster detail
- compare against previous review window
- add to workflow

### Content Block: Review Cluster Evidence
Input:
- grouped review examples
- sentiment label
- mention count

Analysis:
- determine what the cluster means and whether it is actionable.

Insight:
- a specific complaint, request, or trust issue is recurring.

Explanation:
- the cluster matters because repeated user wording points to a fixable source of trust loss.

Evidence:
- cluster title
- mention count
- recurrence period
- sentiment direction
- short examples

Impact:
- urgent for trust-breaking complaint clusters
- high impact for conversion-impacting clusters
- monitor for weak or ambiguous clusters

Action:
- inspect cluster
- write response guidance
- create product-fix task
- update onboarding or release notes

### Content Block: Review Action Queue
Input:
- prioritized review insights

Analysis:
- rank complaint clusters by recurrence, sentiment, trust risk, and fixability.

Insight:
- one review issue should be worked first.

Explanation:
- action order matters because not every review issue has the same trust impact or fix leverage.

Evidence:
- urgency label
- mention count
- recurrence
- confidence

Impact:
- urgent
- high impact
- monitor

Action:
- execute the highest-priority review repair.

## Module 2: Content / Listing Insights

### Screen
Content / Listing Insights Screen

### Screen Purpose
Turn listing/content analysis into rewrite decisions.

### Content Block: Listing Context
Input:
- app listing metadata
- title
- short description
- long description
- screenshot text
- source freshness

Analysis:
- evaluate relevance coverage
- detect message gaps
- compare query intent against listing copy
- identify conversion friction

Insight:
- a specific content surface is under-matching user intent.

Explanation:
- weak listing alignment matters because ranking gains are less useful if the first message does not convert the query intent.

Evidence:
- affected content surface
- keyword cluster
- volume or rank context
- coverage gap
- source freshness
- confidence

Impact:
- high impact when the content gap affects high-volume or high-intent terms
- medium when the issue affects supporting copy
- monitor when confidence is weak

Action:
- rewrite the affected content surface
- reorder the opening message
- update screenshot headline
- inspect rewrite targets

Optional next step:
- create rewrite task
- view content issue detail
- compare competitor message

### Content Block: Priority Evidence
Input:
- content scores
- coverage gaps
- ranking or conversion context

Analysis:
- determine which content issue should be fixed first.

Insight:
- one rewrite target has higher leverage than other copy edits.

Explanation:
- content work must be prioritized because copy changes vary in search, conversion, and trust impact.

Evidence:
- gap label
- affected query
- rank or volume signal
- confidence label

Impact:
- high impact
- action-ready
- monitor

Action:
- rewrite the highest-leverage surface first.

### Content Block: Content Action Queue
Input:
- prioritized content insights

Analysis:
- convert content issues into ordered rewrite work.

Insight:
- listing improvements should be executed in decision order.

Explanation:
- action order prevents low-value copy polishing from displacing high-impact relevance fixes.

Evidence:
- priority label
- effort estimate
- supporting signal

Impact:
- high impact
- medium
- monitor

Action:
- execute rewrite, reorder, update, or compare task.

## Module 3: Keyword Analysis

### Screen
Keyword Analysis Screen

### Screen Purpose
Convert keyword signals into opportunity, defense, and targeting decisions.

### Content Block: Signal Intake
Input:
- seed keywords
- tracked keywords
- rank positions
- volume
- movement
- keyword source freshness

Analysis:
- group keywords by intent
- detect opportunity clusters
- identify decline or defense targets
- compare movement and relevance

Insight:
- a keyword or cluster is creating a specific opportunity or risk.

Explanation:
- keyword movement matters only when it creates a targeting, content, or defense decision.

Evidence:
- keyword label
- rank
- volume
- movement
- action flag
- source confidence

Impact:
- defend for strong terms that need protection
- expand for validated opportunities
- urgent for meaningful decline
- monitor for weak or early signals

Action:
- defend cluster with matching copy
- expand coverage around validated opportunity
- inspect declining cluster
- route target into content rewrite

Optional next step:
- open keyword detail
- add term to workflow
- compare rank movement

### Content Block: Opportunity Evidence
Input:
- keyword rows
- movement deltas
- volume data

Analysis:
- interpret which rows are actionable.

Insight:
- not all keyword changes deserve action; only movement tied to intent and opportunity should be prioritized.

Explanation:
- raw rank movement is not enough; action depends on volume, intent, current position, and content fit.

Evidence:
- row label
- current rank
- movement delta
- volume
- action flag

Impact:
- high impact
- defend
- expand
- monitor

Action:
- update listing copy
- defend current position
- inspect keyword cluster
- add to rank tracking

### Content Block: Keyword Action Queue
Input:
- prioritized keyword insights

Analysis:
- rank keyword actions by opportunity, risk, and fit.

Insight:
- the next keyword move should connect to content or rank work.

Explanation:
- keyword discovery becomes useful only when it changes targeting or execution.

Evidence:
- priority
- movement
- volume
- confidence

Impact:
- high impact
- defend
- expand

Action:
- execute targeting, rewrite, or defense action.

## Module 4: Rank Tracking

### Screen
Rank Tracking Screen

### Screen Purpose
Convert rank movement into defend, recover, expand, or monitor decisions.

### Content Block: Tracking Context
Input:
- tracked keyword set
- rank history
- movement deltas
- sweep freshness

Analysis:
- detect meaningful movement
- separate noise from trend
- identify declining and improving cohorts

Insight:
- a tracked ranking pattern requires a specific response.

Explanation:
- rank movement matters when it affects coverage, risk, or expansion timing.

Evidence:
- keyword cohort
- rank movement
- sweep time
- trend direction
- confidence

Impact:
- urgent for meaningful losses
- defend for strong but vulnerable positions
- expand for validated gains
- monitor for early movement

Action:
- inspect decays
- defend winning terms
- expand mid-tail coverage
- connect rank movement to content changes

Optional next step:
- open rank detail
- add recovery task
- compare previous sweep

### Content Block: Rank Evidence
Input:
- rank table rows
- trend chart
- momentum values

Analysis:
- explain what movement pattern matters.

Insight:
- rank changes are concentrated in specific cohorts.

Explanation:
- cohort-level movement creates clearer decisions than isolated rank positions.

Evidence:
- top-3 coverage
- decaying terms
- unranked opportunities
- trend bars with explanation

Impact:
- high impact
- urgent
- defend
- expand

Action:
- recover decays
- protect top-3 gains
- expand validated opportunities

## Module 5: Competitor Analysis

### Screen
Competitor Analysis Screen

### Screen Purpose
Convert competitor pressure into strategic response decisions.

### Content Block: Competitor Pressure Evidence
Input:
- competitor app/listing
- share-of-voice or visibility signal
- review trust comparison
- messaging comparison

Analysis:
- identify where competitors are winning or exposed
- compare visibility, trust, and messaging pressure

Insight:
- a competitor advantage or weakness is creating a response opportunity.

Explanation:
- competitor pressure matters when it reveals a specific gap the product can answer.

Evidence:
- competitor name
- visibility comparison
- messaging gap
- review trust gap
- advantage label

Impact:
- high impact when competitor advantage affects high-intent surfaces
- exploit when competitor weakness creates opportunity
- monitor when parity exists

Action:
- compare competitor message
- rewrite screenshot promise
- exploit competitor review weakness
- defend against share-of-voice pressure

Optional next step:
- open rivalry map
- compare competitor detail
- add response to workflow

### Content Block: Competitor Comparison
Input:
- comparison data across competitors

Analysis:
- determine which competitor pressure is most actionable.

Insight:
- one competitor gap deserves priority response.

Explanation:
- direct comparison prevents generic competitor tracking and turns rivalry data into action.

Evidence:
- advantage label
- visibility value
- trust comparison
- messaging comparison

Impact:
- high impact
- exploit
- monitor

Action:
- execute the response tied to the highest-pressure gap.

## Module 6: Optimization Layer

### Screen
Optimization Layer Screen

### Screen Purpose
Convert prioritized insights into execution-ready optimization work.

### Content Block: Execution Structure
Input:
- accepted insights
- selected actions
- listing/content/rank/review context

Analysis:
- group work by leverage, dependency, and execution readiness

Insight:
- a specific optimization task should be executed before lower-value changes.

Explanation:
- optimization must preserve priority so execution does not become a random list of improvements.

Evidence:
- source insight
- priority label
- expected impact
- dependency or effort

Impact:
- high impact
- action-ready
- blocked
- monitor

Action:
- execute optimization task
- resolve dependency
- add to workflow
- inspect source insight

Optional next step:
- open optimization plan
- add task to workflow
- review source evidence

### Content Block: Optimization Flow
Input:
- selected cross-module signals

Analysis:
- convert selected insight into execution sequence.

Insight:
- optimization depends on carrying context from signal to action.

Explanation:
- execution work is only reliable when the reason and evidence remain attached to the task.

Evidence:
- input source
- analysis summary
- priority
- action target

Impact:
- action-ready

Action:
- prepare the execution plan.

## Module 7: Creative / Messaging Layer

### Screen
Creative / Messaging Screen

### Screen Purpose
Convert creative and messaging signals into clearer value-promise decisions.

### Content Block: Creative Decision Structure
Input:
- screenshot text
- caption
- listing promise
- competitor message
- review/message feedback

Analysis:
- evaluate message clarity
- detect conversion friction
- compare promise against user intent

Insight:
- a creative or message surface is weakening conversion or trust.

Explanation:
- creative messaging matters when the user sees the value promise before reading deeper content.

Evidence:
- affected screenshot or message
- weak phrase
- competitor contrast
- review/customer wording
- confidence

Impact:
- high impact when first-impression surfaces are affected
- action-ready when rewrite target is clear
- monitor when evidence is directional

Action:
- rewrite screenshot headline
- clarify value promise
- compare competitor message
- create creative test task

Optional next step:
- review creative critique
- open message detail
- add test to workflow

### Content Block: Creative Flow
Input:
- creative surfaces and message signals

Analysis:
- identify where narrative clarity breaks.

Insight:
- the creative promise does not match the strongest user intent.

Explanation:
- mismatch between creative promise and user intent reduces conversion even when visibility is improving.

Evidence:
- screenshot text
- intent cluster
- competitor message

Impact:
- high impact
- action-ready

Action:
- rewrite the creative message around the validated intent.

## Module 8: Unified Workflow Layer

### Screen
Unified Workflow Screen

### Screen Purpose
Coordinate cross-module work as one operating surface.

### Content Block: Resolution Structure
Input:
- top insights from all active modules
- action queue items
- module status
- gated module previews

Analysis:
- merge module outputs into one prioritized workflow
- detect dependencies
- preserve source reasoning

Insight:
- cross-module work should be executed in priority order.

Explanation:
- isolated module actions can conflict or duplicate effort; unified workflow keeps decision context attached to execution.

Evidence:
- source module
- priority
- evidence summary
- dependency
- confidence

Impact:
- critical for blocked or trust-risk work
- high impact for cross-module leverage
- monitor for low-confidence tasks

Action:
- start highest-priority workflow item
- inspect dependency
- assign or sequence task
- add module-specific action to workflow

Optional next step:
- open workflow queue
- inspect source insight
- resolve dependency

### Content Block: Cross-Module Action Queue
Input:
- prioritized actions from review, content, keyword, rank, competitor, optimization, and creative modules

Analysis:
- rank actions by impact, dependency, urgency, and confidence.

Insight:
- the product has one next best action across modules.

Explanation:
- unified action order prevents users from treating each module as a separate dashboard.

Evidence:
- source module
- action reason
- impact label
- effort estimate

Impact:
- urgent
- high impact
- action-ready
- blocked
- monitor

Action:
- execute, inspect, assign, or resolve the next workflow item.

## Cross-Module Removal Rules

### Raw Tables Without Interpretation
Remove or transform:
- table rows that only show values
- rank rows without action flags
- keyword rows without opportunity meaning
- competitor rows without response implication

Required replacement:
- row label
- signal value
- interpretation flag
- impact
- action implication

### Charts Without Explanation
Remove or transform:
- charts that show movement only
- trend visuals without conclusion
- ranking bars without decision text

Required replacement:
- chart title
- movement explanation
- affected cohort
- next action

### Metrics Without Meaning
Remove or transform:
- metric cards without context
- counts without implication
- freshness without trust meaning

Required replacement:
- metric label
- interpreted meaning
- priority or trust cue
- action path when relevant

## Required Content QA Checklist
For every module and screen, verify:
- input source is clear
- backend analysis is translated into meaning
- insight states what is happening
- explanation states why it matters
- evidence supports the insight
- impact is visible
- action is concrete
- optional next step supports the primary action
- no raw data appears alone
- no chart appears without explanation
- no metric appears without meaning
- no screen behaves as a passive dashboard

## Phase 2 Modules

### Module 9: Technical SEO Audit

#### Screen
Technical SEO Audit Screen

#### Screen Purpose
Convert technical crawl, performance, and indexation data into a prioritized fix sequence.

#### Content Block: Technical Health Overview
Block name:
Technical Health Overview

Input:
- crawl data
- page speed data (LCP, CLS, INP)
- robots.txt data
- sitemap data
- schema markup data

Analysis:
- score Core Web Vitals per vital (LCP, CLS, INP)
- analyze crawlability score from blocked and noindexed pages
- analyze indexation from canonical issues and duplicate URLs
- analyze redirects for chains and 404-target redirects
- analyze schema coverage and errors
- analyze HTTPS status and mobile-friendliness
- compute weighted overall health score

Insight:
- the site has technical issues that are directly limiting ranking eligibility

Explanation:
- technical health affects whether Google can crawl, index, and rank pages — even strong content cannot compete with poor technical foundations

Evidence:
- health score (0-100)
- health band (healthy / needs_work / critical)
- critical issue count
- warning count
- worst failing vital or dimension

Impact:
- critical when health score is below 50
- high when any Core Web Vital is poor or crawlability is blocked
- medium when warnings exist without critical issues

Action:
- fix failing Core Web Vitals
- resolve crawl blocks
- fix canonical issues
- collapse redirect chains
- implement missing schema markup

Optional next step:
- open technical action queue
- inspect individual dimension detail subpages
- schedule periodic reaudit

#### Content Block: Core Web Vitals
Block name:
Core Web Vitals

Input:
- LCP, CLS, INP values from page speed data

Analysis:
- score each vital against good/needs-improvement/poor thresholds
- compute composite vital score

Insight:
- one or more Core Web Vitals are failing and reducing ranking eligibility

Explanation:
- CWV are a confirmed Google ranking signal and directly affect page experience scoring for ranking decisions

Evidence:
- LCP rating and value
- CLS rating and value
- INP rating and value
- composite vital score

Impact:
- high when any vital is poor
- medium when any vital needs improvement
- low when all vitals are good

Action:
- prioritise image optimisation for LCP
- eliminate layout shift sources for CLS
- improve interaction responsiveness for INP

---

### Module 10: On-Page SEO Scorer

#### Screen
On-Page SEO Scorer Screen

#### Screen Purpose
Convert per-page signal scores into an ordered fix list for title tags, meta, headings, content, and links.

#### Content Block: Site-Wide On-Page Score
Block name:
Site-Wide On-Page Score

Input:
- page title, meta description, H1/H2 headings, body content, internal links, image alts, URL slug per page
- target keywords per page

Analysis:
- score each page across 7 dimensions (title, meta, headings, content depth, internal links, images, URL)
- compute site-wide average score
- identify critical pages below 40/100
- identify top 5 most common issues across all pages

Insight:
- a significant portion of pages are under-optimised and unlikely to rank competitively

Explanation:
- per-page on-page signals are the most directly controllable ranking factors and the fastest to improve without infrastructure changes

Evidence:
- site average score
- score band (good / needs_work / poor)
- critical page count
- most common issue across pages

Impact:
- high when critical pages exist or site average is poor
- medium when average is in needs_work band
- monitor when score is in good band

Action:
- fix critically under-optimised pages first
- rewrite title tags with primary keywords
- add missing meta descriptions
- add H1 to pages missing them
- expand thin content pages

Optional next step:
- open page-level score detail
- inspect most common issue across pages
- schedule periodic reaudit

#### Content Block: Most Common On-Page Issue
Block name:
Most Common On-Page Issue

Input:
- issue counts aggregated across all scored pages

Analysis:
- identify the issue type affecting the most pages

Insight:
- one systematic gap is reducing scores across the site

Explanation:
- systematic issues are more efficiently fixed with a templated approach than one-by-one

Evidence:
- issue type name
- number of affected pages

Impact:
- high impact when issue affects majority of pages
- medium when it affects a meaningful minority

Action:
- create a templated fix and apply it across all affected pages

---

### Module 11: Backlink Intelligence

#### Screen
Backlink Intelligence Screen

#### Screen Purpose
Convert authority profile, toxicity risk, and link gap data into a link acquisition and risk management plan.

#### Content Block: Authority Profile Summary
Block name:
Authority Profile Summary

Input:
- backlink list with domain authority, link type, anchor text, spam score
- referring domain list
- competitor backlink list

Analysis:
- compute authority distribution (high/medium/low DA)
- compute overall authority score
- compute toxicity risk level from spam scores
- compute anchor diversity score
- analyze link velocity trend
- identify competitor link gaps

Insight:
- the link profile has gaps in authority, toxic risk, or competitor coverage that limit ranking potential

Explanation:
- backlink authority is a core domain-level ranking signal — a weak or toxic profile limits how well any page can rank for competitive terms

Evidence:
- total backlinks and unique referring domains
- overall authority score
- authority tier
- toxic link count and risk level
- dofollow ratio

Impact:
- high when authority score is below 30 or toxicity is high
- medium when velocity is declining or competitor gap is large
- monitor when profile is stable and growing

Action:
- build high-DA backlinks
- disavow toxic links
- run outreach campaign targeting competitor gap domains
- diversify anchor text distribution

Optional next step:
- inspect toxic link list
- open link gap opportunities
- review anchor text distribution

#### Content Block: Competitor Link Gap
Block name:
Competitor Link Gap

Input:
- referring domain list
- competitor backlink domain list

Analysis:
- identify domains that link to competitors but not to the target
- sort by competitor domain authority

Insight:
- domains that already trust competitors are the most achievable link targets

Explanation:
- sites willing to link to one player in a niche are more likely to link to another — competitor link gaps are warmer outreach opportunities than cold targets

Evidence:
- gap domain count
- top opportunity domain and DA

Impact:
- high impact when gap count is large
- medium when gap is moderate

Action:
- begin targeted outreach starting with the highest-DA gap domains

---

### Module 12: E-E-A-T Signals

#### Screen
E-E-A-T Signals Screen

#### Screen Purpose
Convert author credibility, trust page completeness, and external citation signals into credibility improvement actions.

#### Content Block: E-E-A-T Score Overview
Block name:
E-E-A-T Score Overview

Input:
- pages with author bios, bylines, credentials, body content
- about page data
- contact page data
- trust signals (privacy policy, terms, SSL, certifications)
- external citations
- niche (for YMYL classification)

Analysis:
- score Experience (bylines, author bios, first-hand markers)
- score Expertise (credentials, citations, content depth)
- score Authoritativeness (external citations, media mentions, awards)
- score Trustworthiness (about, contact, privacy policy, terms)
- compute overall E-E-A-T score and tier
- classify YMYL risk level

Insight:
- the site lacks credibility signals that Google uses to evaluate content quality and ranking eligibility

Explanation:
- E-E-A-T is not a single ranking factor but a framework Google uses to evaluate content quality — weak signals suppress rankings especially in competitive or high-scrutiny niches

Evidence:
- overall E-E-A-T score
- E-E-A-T tier (strong / moderate / weak)
- YMYL risk level
- weakest dimension score

Impact:
- high when score is below 40 or site operates in a YMYL niche with weak signals
- medium when one or two dimensions score poorly
- monitor when all dimensions score adequately

Action:
- build trust foundation pages (About, Contact, Privacy Policy, Terms)
- add author bios and credentials to content pages
- pursue external citations from authoritative sources
- document author expertise across all content

Optional next step:
- open E-E-A-T action queue
- inspect individual dimension detail
- monitor quarterly

#### Content Block: Trust Foundation
Block name:
Trust Foundation

Input:
- about page existence and quality
- contact page with address, phone, email
- trust signal types (privacy policy, terms, SSL, certifications)

Analysis:
- score presence and quality of each trust element
- identify missing critical trust signals

Insight:
- essential trust pages are missing and reducing credibility scoring

Explanation:
- trust pages are the minimum baseline Google expects before granting authority in any niche — their absence is a clear negative signal

Evidence:
- missing trust page types
- trust score

Impact:
- high when about or contact pages are missing
- medium when legal pages are missing

Action:
- create each missing trust page with appropriate content depth

---

### Module 13: Search Intent Classifier

#### Screen
Search Intent Classifier Screen

#### Screen Purpose
Convert intent classification results into content format corrections and creation priorities.

#### Content Block: Intent Alignment Score
Block name:
Intent Alignment Score

Input:
- keywords with existing content type and URL
- intent classification results (informational, navigational, transactional, commercial)

Analysis:
- classify intent for each keyword
- check content format alignment per keyword
- compute alignment score across all keywords with known content
- identify high-value (commercial/transactional) misalignments

Insight:
- a portion of keywords are served by content that does not match the user's search intent

Explanation:
- Google matches results to intent — when your content format does not match what the query demands (e.g., a blog post for a transactional query), the page is deprioritised regardless of keyword presence

Evidence:
- overall alignment score (%)
- misaligned keyword count
- high-value mismatch count
- dominant intent type

Impact:
- high when high-value commercial or transactional keywords are misaligned
- medium when alignment score is below 80%
- monitor when most keywords are aligned

Action:
- reformat high-value misaligned content pages to match intent
- create new content matched to intent from the start for unmapped keywords

Optional next step:
- open intent detail per keyword
- run content format audit for misaligned pages
- schedule quarterly review

#### Content Block: Content Creation Opportunities
Block name:
Content Creation Opportunities

Input:
- keywords without existing content mapped

Analysis:
- identify keywords with no content
- use intent classification to recommend the correct format before creation

Insight:
- unmapped keywords represent content creation opportunities that can be matched to intent from the start

Explanation:
- creating content matched to intent from creation is more efficient than reformatting after the fact

Evidence:
- count of keywords without content
- recommended formats per intent type

Impact:
- medium when multiple unmapped keywords exist

Action:
- check intent classification before creating each new page
- choose the correct content format for the dominant intent

---

### Module 14: SERP Feature Analyzer

#### Screen
SERP Feature Analyzer Screen

#### Screen Purpose
Convert SERP feature gaps into CTR lift opportunities with specific content and schema requirements.

#### Content Block: SERP Feature Opportunity Overview
Block name:
SERP Feature Opportunity Overview

Input:
- keywords with features present in SERP and features owned by target
- current rank positions

Analysis:
- identify features present but not owned (gaps)
- compute estimated CTR lift per gap feature
- compute total estimated CTR lift across all gaps
- identify high-value gaps (featured snippet, local pack, sitelinks)

Insight:
- the site is missing SERP features that could increase clicks without any ranking changes

Explanation:
- SERP features like featured snippets and People Also Ask boxes add visibility above organic position 1 — capturing them is the fastest CTR improvement available

Evidence:
- total feature gap count
- total estimated CTR lift
- top gap feature type
- feature ownership ratio

Impact:
- high when featured snippet or local pack gaps exist
- medium when PAA or image carousel gaps exist
- monitor when ownership ratio is adequate

Action:
- optimise content for featured snippet capture
- add FAQ schema for People Also Ask capture
- complete GBP for local pack inclusion

Optional next step:
- inspect eligibility requirements per feature
- open SERP feature action queue
- monitor monthly for ownership changes

#### Content Block: Feature Eligibility Requirements
Block name:
Feature Eligibility Requirements

Input:
- gap feature types per keyword

Analysis:
- map each gap feature to its implementation requirements

Insight:
- each SERP feature has specific content, schema, or profile requirements that determine eligibility

Explanation:
- eligibility requirements vary by feature — understanding them turns vague gap awareness into a concrete implementation checklist

Evidence:
- gap feature name
- required content or schema type
- implementation complexity

Impact:
- high when multiple high-impact features are achievable

Action:
- implement each requirement starting with highest-CTR-boost features

---

### Module 15: Topical Authority

#### Screen
Topical Authority Screen

#### Screen Purpose
Convert topic coverage gaps, cluster completeness, and competitor gaps into a content planning priority.

#### Content Block: Topical Coverage Status
Block name:
Topical Coverage Status

Input:
- target topic list with subtopics
- existing content list with topic and subtopic mapping, word count, schema status
- competitor topic lists

Analysis:
- map content to topics to identify covered and uncovered topics
- score cluster completeness (pillar existence, supporting piece count, subtopic coverage)
- analyze competitor topic gaps
- analyze semantic depth (average word count, schema adoption)
- compute overall topical authority score

Insight:
- the site has significant topical coverage gaps that prevent Google from recognising it as an authority in its niche

Explanation:
- Google rewards topical depth — a site that comprehensively covers a subject with pillar pages and supporting content outranks sites with scattered shallow coverage

Evidence:
- topical authority score
- authority tier (established / developing / thin)
- coverage ratio
- uncovered topic count
- competitor gap count

Impact:
- high when coverage ratio is below 50% or authority tier is thin
- medium when clusters lack pillars or supporting pieces
- monitor when authority is established and coverage is strong

Action:
- create content for uncovered core topics
- create missing pillar pages for topic clusters
- fill competitor topic gaps
- expand thin clusters with supporting pieces

Optional next step:
- open topic coverage map
- inspect cluster completeness detail
- view competitor topic gap list

#### Content Block: Topic Cluster Detail
Block name:
Topic Cluster Detail

Input:
- covered topics with content pieces per topic

Analysis:
- score each cluster on pillar existence and supporting piece count
- identify thin clusters with fewer than 3 supporting pieces

Insight:
- some topic clusters have a pillar page but lack enough supporting content to signal comprehensive coverage

Explanation:
- clusters need a pillar anchor plus a network of supporting pieces — thin clusters signal incomplete coverage to Google

Evidence:
- cluster score
- pillar existence
- supporting piece count
- subtopic coverage ratio

Impact:
- medium when thin clusters exist

Action:
- create targeted supporting pieces for each thin cluster

---

### Module 16: Site Architecture

#### Screen
Site Architecture Screen

#### Screen Purpose
Convert crawl depth, orphan page, link equity, and silo data into a structural improvement plan.

#### Content Block: Architecture Health Score
Block name:
Architecture Health Score

Input:
- pages with crawl depth, inbound internal links, word count, redirect status
- internal link graph

Analysis:
- compute crawl depth distribution and deep page ratio
- detect orphan pages with zero inbound internal links
- compute link equity Gini coefficient
- analyze topic silo cross-link structure
- detect redirect chains at depth 2+
- compute weighted overall architecture score

Insight:
- the site structure has gaps that waste crawl budget and fragment link authority

Explanation:
- site architecture directly affects how efficiently Googlebot crawls the site and how link authority flows to important pages — poor architecture limits the ranking potential of all content

Evidence:
- architecture score
- architecture band (healthy / needs_work / poor)
- orphan count
- deep page count
- silo score

Impact:
- high when architecture band is poor or orphan ratio is high
- medium when crawl depth or silo structure needs work
- monitor when architecture score is healthy

Action:
- link orphan pages with contextual internal links
- flatten deep pages through navigation restructuring
- redistribute internal link equity from over-linked pages
- strengthen topic silo cross-linking

Optional next step:
- inspect orphan page list
- view link equity distribution
- check crawl depth breakdown

#### Content Block: Orphan Pages
Block name:
Orphan Pages

Input:
- pages with zero inbound internal links

Analysis:
- identify orphaned URLs
- assess severity by orphan ratio

Insight:
- pages with no internal links cannot receive crawl equity and may be invisible to search engines

Explanation:
- every page needs at least one internal link to be part of the site's crawl and authority flow

Evidence:
- orphan count
- orphan ratio

Impact:
- high when orphan ratio exceeds 10%
- medium when ratio is 5-10%

Action:
- add contextual internal links to orphaned pages from relevant content

---

### Module 17: Analytics Integration

#### Screen
Analytics Integration Screen

#### Screen Purpose
Convert GSC and GA4 signals into ranking, CTR, and traffic recovery decisions.

#### Content Block: Analytics Health Overview
Block name:
Analytics Health Overview

Input:
- GSC search analytics (queries, clicks, impressions, CTR, position)
- GSC index coverage (valid, warnings, errors, excluded)
- GSC crawl errors
- GA4 page metrics (organic sessions, conversions, bounce rate)

Analysis:
- compute CTR efficiency for high-impression queries
- identify page 2 keywords with real impression volume
- analyze index coverage health
- identify declining organic pages (20%+ session drop)
- identify high-traffic zero-conversion pages
- compute overall analytics health score

Insight:
- analytics data reveals specific ranking, CTR, and traffic issues that can be acted on immediately

Explanation:
- GSC and GA4 data provides a direct view of what is costing clicks and traffic right now — unlike technical or content signals, analytics gaps have measurable immediate recovery potential

Evidence:
- analytics health score
- health band (healthy / needs_work / critical)
- CTR underperformer count
- page 2 quick win count
- declining page count

Impact:
- critical when health band is critical or index errors are high
- high when CTR opportunities or page 2 keywords with volume exist
- medium when declining pages need investigation

Action:
- optimise title tags and meta descriptions for CTR underperformers
- push page 2 keywords to page 1
- investigate and recover declining pages
- fix indexation and crawl errors

Optional next step:
- open CTR underperformer detail
- view page 2 quick win list
- inspect declining page list

#### Content Block: CTR Opportunity
Block name:
CTR Opportunity

Input:
- GSC queries with impressions, clicks, CTR, and position

Analysis:
- compute expected CTR by position
- compute efficiency score as ratio of actual to expected
- estimate click lift from bringing each underperformer to expected CTR

Insight:
- keywords that rank well but get fewer clicks than expected are recoverable through title and meta improvements

Explanation:
- CTR improvement is the fastest way to increase organic traffic without changing rankings — the opportunity is fully within content control

Evidence:
- underperformer count
- total estimated click lift
- top underperforming query

Impact:
- high when estimated click lift is significant

Action:
- rewrite title tags and meta descriptions for underperforming queries

---

### Module 18: Local SEO

#### Screen
Local SEO Screen

#### Screen Purpose
Convert GBP completeness, NAP consistency, local pack visibility, and review signals into a local ranking improvement plan.

#### Content Block: Local SEO Score Overview
Block name:
Local SEO Score Overview

Input:
- Google Business Profile data (category, hours, photos, posts, QA, description, products)
- business NAP (name, address, phone) for consistency check against citations
- citation list with source, name, address, phone
- local keyword list with local pack and organic positions
- review signals (total reviews, average rating, monthly velocity, response rate)

Analysis:
- score GBP completeness across key fields
- check NAP consistency ratio across citations
- score local pack visibility from keyword pack positions
- score review signals from rating, velocity, and response rate
- compute overall local SEO score

Insight:
- local signals are incomplete and are limiting visibility in Google Maps and local search results

Explanation:
- local pack inclusion is driven primarily by GBP completeness, citation consistency, and review velocity — all of which are directly controllable

Evidence:
- overall local score
- score band (strong / moderate / weak)
- GBP score
- NAP consistency ratio
- local pack keyword count

Impact:
- high when local pack presence is zero or GBP score is below 15
- medium when NAP is inconsistent or review velocity is slow
- monitor when local score is strong

Action:
- complete Google Business Profile
- fix NAP inconsistencies across directory citations
- build local pack presence through GBP and citation improvements
- build a review acquisition system for consistent monthly reviews

Optional next step:
- inspect GBP completeness checklist
- view NAP inconsistency detail
- open local SEO action queue

#### Content Block: Review Signal Health
Block name:
Review Signal Health

Input:
- average rating
- monthly review velocity
- response rate

Analysis:
- score review quality from rating, velocity, and response rate
- identify slow velocity and low response rate issues

Insight:
- review quantity and recency are local ranking factors that can be improved through a consistent acquisition process

Explanation:
- Google factors review velocity and rating into local pack ranking decisions — a review acquisition system is a direct local ranking lever

Evidence:
- average rating
- monthly velocity
- response rate
- review score

Impact:
- medium when velocity is below 2 reviews per month

Action:
- implement a post-service review request via email or SMS
- respond to every review within 48 hours

---

## Completion Criteria
The full frontend content system is applied when:
- all 18 modules follow `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- every screen has defined content blocks
- every content block includes insight, explanation, evidence, impact, and action
- raw data surfaces are converted into interpreted decision surfaces
- the content remains system-native with no reverse engineering or external influence
- UI structure remains unchanged while content structure becomes enforceable

---
## Pattern Combination Rules

### Standard Insight Block
Use:
- insight pattern
- explanation pattern
- priority pattern
- action pattern

Order:
```text
Title
Explanation
Evidence
Impact
Action
Optional next step
```

### Action Queue Item
Use:
- action pattern
- explanation pattern
- priority pattern

Order:
```text
Action
Reason
Impact / effort
```

### Alert
Use:
- insight pattern
- priority pattern
- action pattern

Order:
```text
Trigger
Why it matters
Action
```

### Table Row
Use:
- signal
- explanation pattern
- priority pattern
- action pattern

Order:
```text
Label
Value / movement
Interpretation flag
Action implication
```

---
## Allowed Insight Formats

### Compact Insight
Used for:
- mobile cards
- dashboard highlights
- small supporting findings

Structure:
- title
- one-sentence explanation
- 2-3 evidence chips
- impact label
- action

### Full Insight
Used for:
- analysis feed
- review cluster
- content issue
- competitor comparison

Structure:
- title
- explanation
- evidence group
- impact
- action
- optional next step

### Row Insight
Used for:
- keyword tables
- rank tables
- competitor rows

Structure:
- row label
- signal value
- movement/trend
- interpreted flag
- impact
- action implication

### Alert Insight
Used for:
- warnings
- urgent issues
- stale data
- trust risks

Structure:
- trigger
- explanation
- impact
- action

### Action Insight
Used for:
- action queue
- workflow task
- priority hero

Structure:
- action title
- reasoning explanation
- evidence or source signal
- impact
- estimated effort or next step

---
## Module-Specific Insight Examples

### Review Analysis
Insight must include:
- cluster theme
- recurrence or volume
- trust impact
- action path

Example:
- Title: "Sync complaints are recurring in recent reviews"
- Explanation: "The issue is narrow enough to repair trust through targeted messaging and product follow-up."
- Evidence: `29% mention sync`, `14-day recurrence`
- Impact: `Urgent`
- Action: "Repair sync messaging in release notes and onboarding."

### Content / Listing Insights
Insight must include:
- content surface
- mismatch or missing coverage
- conversion or relevance impact
- rewrite action

Example:
- Title: "Description opening misses exam-prep intent"
- Explanation: "High-volume study terms are less likely to convert because the first message does not match the query promise."
- Evidence: `Vol 11k`, `Rank #9`, `copy gap`
- Impact: `High impact`
- Action: "Rewrite the first 180 characters around exam-prep outcomes."

### Keyword Analysis
Insight must include:
- keyword or cluster
- movement or opportunity
- reason it matters
- targeting action

Example:
- Title: "Offline flashcards is a defendable keyword cluster"
- Explanation: "The term is already near the top, so the next move is defense rather than expansion."
- Evidence: `Rank #2`, `Vol 7k`, `+1`
- Impact: `Defend`
- Action: "Protect the cluster with matching listing copy and screenshot language."

### Rank Tracking
Insight must include:
- tracked movement
- trend meaning
- risk or opportunity
- response action

Example:
- Title: "Top-3 coverage is expanding in mid-tail terms"
- Explanation: "The gains are strong enough to convert into durable coverage before chasing new head terms."
- Evidence: `12 top-3 keywords`, `+4`
- Impact: `Expand`
- Action: "Push winning mid-tail terms into content and metadata updates."

### Competitor Analysis
Insight must include:
- competitor gap or advantage
- source of pressure
- strategic implication
- response action

Example:
- Title: "Competitor A is winning through clearer exam-prep messaging"
- Explanation: "The advantage is messaging-led, so the response should focus on creative clarity before keyword expansion."
- Evidence: `+14 SOV`, `messaging lead`
- Impact: `High impact`
- Action: "Compare screenshot promise and rewrite the weakest headline."

### Settings / Configuration
Insight must include:
- source or setting state
- trust implication
- configuration action

Example:
- Title: "Keyword provider is still using a mock adapter"
- Explanation: "Insights should not be treated as final until the live source is connected."
- Evidence: `Mock adapter`, `workspace confidence: medium`
- Impact: `Monitor`
- Action: "Connect the live keyword provider before production decisions."
