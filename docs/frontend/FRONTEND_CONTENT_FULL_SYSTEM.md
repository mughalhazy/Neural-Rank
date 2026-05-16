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
Requested anchors:
- `MASTER_PRODUCT_BUILD_SPEC.md`
- `MASTER_BEHAVIOUR_DOC.md`
- `docs/frontend/FRONTEND_CONTENT_SYSTEM.md`
- `docs/frontend/FRONTEND_INSIGHT_STRUCTURE.md`
- `docs/frontend/FRONTEND_BACKEND_CONTENT_MAPPING.md`
- `docs/frontend/FRONTEND_MICROCOPY_RULES.md`
- `docs/frontend/FRONTEND_SCREEN_ARCHETYPES.md`
- `docs/frontend/FRONTEND_PATTERN_LIBRARY.md`

Available anchor fallbacks in the current repo:
- `MASTER BUILD SPEC.md` is used as the product spec fallback for `MASTER_PRODUCT_BUILD_SPEC.md`
- `PHASE_01_ARCHETYPES_AND_MAPPING.md` is used as the archetype fallback for `FRONTEND_SCREEN_ARCHETYPES.md`
- `PHASE_06_PATTERN_LIBRARY.md` is used as the pattern fallback for `FRONTEND_PATTERN_LIBRARY.md`

Backend-content mapping anchor:
- `docs/frontend/FRONTEND_BACKEND_CONTENT_MAPPING.md` now defines how backend outputs become frontend content layers.

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

## Completion Criteria
The full frontend content system is applied when:
- all eight modules follow `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- every screen has defined content blocks
- every content block includes insight, explanation, evidence, impact, and action
- raw data surfaces are converted into interpreted decision surfaces
- the content remains system-native with no reverse engineering or external influence
- UI structure remains unchanged while content structure becomes enforceable
