# Frontend Screen Archetypes

Anchors:

- `MASTER_PRODUCT_BUILD_SPEC.md` interpreted from [MASTER BUILD SPEC.md](</D:/Neural Rank/MASTER BUILD SPEC.md>)
- [MASTER_BEHAVIOUR_DOC.md](</D:/Neural Rank/MASTER_BEHAVIOUR_DOC.md>)
- [MARKET_RESEARCH_PLAYSTORE.md](</D:/Neural Rank/MARKET_RESEARCH_PLAYSTORE.md>)
- [BACKEND_MODULE_BOUNDARIES.md](</D:/Neural Rank/docs/backend/BACKEND_MODULE_BOUNDARIES.md>)
- `backend` code under `D:\Neural Rank\backend\src`

This document defines the reusable structural and behavioural screen archetypes for the full product. Archetypes are not screens. They are reusable templates that multiple modules can compose.

## System Validation

- all product modules are covered
- each archetype maps to real user behaviour, not visual style only
- the set is minimal and non-overlapping
- each archetype supports `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- no archetype is module-specific

Covered modules:

- Dashboard / summary entry
- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking
- Competitor Analysis
- Optimization Layer
- Creative / Messaging Layer
- Unified Workflow Layer
- Settings / configuration surfaces

## Dashboard Archetype

**Purpose**

Give the user a high-level operating view of current state, the most important issue, and the next best action.

**Primary Behaviour**

Scan overall status, understand where attention is needed, and enter the right module or workflow.

**Supported Flow**

- `INPUT`: aggregated outputs from active modules
- `ANALYSIS`: cross-module synthesis and state rollup
- `INSIGHT`: what is changing or blocked
- `PRIORITY`: what matters first
- `ACTION`: where to go next

**Typical Sections**

- summary header
- top priority block
- module status summary
- ordered action list
- recent change or alert strip

**Content Responsibilities**

- top insight
- concise explanation
- priority framing
- direct next actions
- lightweight evidence only where needed

**Backend Dependency**

- orchestration outputs
- module status metadata
- prioritized actions
- workflow summaries

**Module Coverage**

- dashboard / home
- unified workflow layer
- executive summary surfaces

**Interaction Patterns**

- open module
- open task
- dismiss or snooze low-priority items
- change scope

**Anti-patterns**

- dense dashboard grids
- raw metrics without meaning
- equal visual weight for all modules
- charts that do not change a decision

## Analysis Workspace Archetype

**Purpose**

Help the user explore a set of entities, sort and filter them, and decide which items deserve action.

**Primary Behaviour**

Scan many rows or entities, change the scope, compare movement, and select candidates for deeper inspection.

**Supported Flow**

- `INPUT`: entity lists, tracked items, filters, target scope
- `ANALYSIS`: ranking, clustering, sorting, segmentation
- `INSIGHT`: which items stand out
- `PRIORITY`: which items should be worked first
- `ACTION`: drill into detail or send item to execution

**Typical Sections**

- workspace header
- filter/scope controls
- summary strip
- ranked entity list or grid
- compact trend context
- action rail or selected-state footer

**Content Responsibilities**

- entity labels
- interpreted movement or opportunity
- short explanation
- visible priority indicator
- clear path to drilldown or action

**Backend Dependency**

- keyword suggestions
- ranking rows
- movement deltas
- competitor target sets
- prioritized entity outputs

**Module Coverage**

- keyword analysis
- rank tracking
- competitor analysis

**Interaction Patterns**

- filter
- sort
- segment
- select
- bulk act
- drilldown

**Anti-patterns**

- spreadsheet dump
- trend charts without action relevance
- hidden priority
- rows that require drilldown before conveying meaning

## Insight Feed Archetype

**Purpose**

Present interpreted findings as a readable issue-led feed that explains what is happening, why it matters, and what to do.

**Primary Behaviour**

Read findings in order, understand evidence and impact, and choose which issue to address.

**Supported Flow**

- `INPUT`: analyzed findings and grouped evidence
- `ANALYSIS`: issue grouping and interpretation
- `INSIGHT`: statement of what is happening
- `PRIORITY`: impact and urgency
- `ACTION`: next step for each issue

**Typical Sections**

- module header
- hero issue or strongest finding
- stacked insight cards
- evidence summaries
- action prompts

**Content Responsibilities**

- insights
- explanations
- evidence
- priority labels
- action prompts

**Backend Dependency**

- insight generation outputs
- grouped evidence
- complaint clusters
- content/listing findings
- creative/messaging critiques
- prioritized actions

**Module Coverage**

- review analysis
- content / listing insights
- creative / messaging layer

**Interaction Patterns**

- expand evidence
- save item
- drilldown
- send to optimization
- mark reviewed

**Anti-patterns**

- passive feed of observations
- evidence without meaning
- action without explanation
- infinite narrative with no prioritization

## Detail Drilldown Archetype

**Purpose**

Let the user inspect one issue, one entity, or one recommendation deeply enough to make a confident decision.

**Primary Behaviour**

Read the full context of a selected item and decide what to do with it.

**Supported Flow**

- `INPUT`: selected item
- `ANALYSIS`: focused interpretation around that item
- `INSIGHT`: exact issue or opportunity
- `PRIORITY`: specific impact for this item
- `ACTION`: direct action for this item

**Typical Sections**

- item header
- impact summary
- evidence block
- explanation block
- action block
- related items

**Content Responsibilities**

- precise title
- why it matters
- direct evidence
- impact statement
- single-item action

**Backend Dependency**

- selected entity payload
- supporting evidence
- impact scoring
- action recommendations

**Module Coverage**

- review analysis
- content / listing insights
- keyword analysis
- rank tracking
- competitor analysis
- optimization layer
- creative / messaging layer

**Interaction Patterns**

- expand context
- switch item
- confirm action
- return to parent list

**Anti-patterns**

- opening without context from parent screen
- mixing many unrelated items
- repeating parent list content without deeper value

## Comparison Archetype

**Purpose**

Show relative position between two or more targets so the user can decide where they are behind, ahead, or exposed.

**Primary Behaviour**

Compare side by side, find the material difference, and decide the response.

**Supported Flow**

- `INPUT`: target set and comparison dimensions
- `ANALYSIS`: relative scoring and gap detection
- `INSIGHT`: where the difference is meaningful
- `PRIORITY`: which gap matters first
- `ACTION`: what response to take

**Typical Sections**

- comparison header
- target switcher
- side-by-side blocks
- gap summary
- response action panel

**Content Responsibilities**

- comparative statements
- explanation of the gap
- supporting evidence
- importance of the gap
- recommended response

**Backend Dependency**

- competitor targets
- comparative ranking or content signals
- trust and messaging gap outputs
- prioritized competitor actions

**Module Coverage**

- competitor analysis
- selective use in content/listing or creative reviews when side-by-side comparison is needed

**Interaction Patterns**

- compare
- switch baseline
- filter dimensions
- drilldown into a gap
- convert a gap into a task

**Anti-patterns**

- comparing too many targets at once
- raw scoreboards without interpretation
- forcing comparison into modules where isolated analysis is sufficient

## Optimization Workspace Archetype

**Purpose**

Turn chosen insights into execution-ready work, not just recommendations.

**Primary Behaviour**

Review proposed fixes, order them, and move forward with edits or task execution.

**Supported Flow**

- `INPUT`: selected insights, upstream findings, constraints
- `ANALYSIS`: translation into execution guidance
- `INSIGHT`: what should be changed
- `PRIORITY`: what to fix first
- `ACTION`: perform or queue the change

**Typical Sections**

- execution header
- ordered fix list
- action grouping
- effort/impact cues
- completion or queue controls

**Content Responsibilities**

- actionable fix statements
- reason for each fix
- impact level
- related evidence
- execution-ready next steps

**Backend Dependency**

- optimization guidance outputs
- prioritized actions from source modules
- grouped execution recommendations
- workflow sequencing outputs

**Module Coverage**

- optimization layer
- unified workflow layer
- downstream execution surfaces attached to review, content, keyword, or creative modules

**Interaction Patterns**

- prioritize
- reorder
- queue
- complete
- hand off

**Anti-patterns**

- suggestion lists with no order
- detached recommendations with no source reasoning
- mixing setup concerns into execution work

## Alert / Notification Archetype

**Purpose**

Interrupt the user only when a change, failure, or urgent signal requires attention.

**Primary Behaviour**

Notice an important change quickly and jump into the correct next surface.

**Supported Flow**

- `INPUT`: state change, threshold breach, stale data, urgent movement
- `ANALYSIS`: event relevance and severity
- `INSIGHT`: what changed
- `PRIORITY`: why it needs attention now
- `ACTION`: where to go or what to do

**Typical Sections**

- alert title
- short explanation
- impact or severity cue
- direct action button
- optional dismiss state

**Content Responsibilities**

- alert statement
- reason it matters
- severity
- minimal supporting evidence
- next action

**Backend Dependency**

- freshness checks
- ranking movement thresholds
- trust-risk events
- orchestration alerts
- integration status changes

**Module Coverage**

- dashboard
- rank tracking
- review analysis
- unified workflow layer
- settings / configuration

**Interaction Patterns**

- open target screen
- dismiss
- snooze
- resolve

**Anti-patterns**

- noisy notification centers
- low-signal alerts
- alerts that duplicate normal insight feed content
- alerts with no action path

## Settings / Configuration Archetype

**Purpose**

Manage setup, source readiness, target definitions, and workspace-level controls.

**Primary Behaviour**

Connect, configure, validate, and maintain the system safely.

**Supported Flow**

- `INPUT`: user setup values and integration states
- `ANALYSIS`: validation and readiness checks
- `INSIGHT`: what is configured or broken
- `PRIORITY`: what blocks trustworthy output
- `ACTION`: connect, fix, or update

**Typical Sections**

- setup header
- source connection blocks
- target configuration
- readiness status
- preferences and visibility controls

**Content Responsibilities**

- configuration status
- trust/readiness explanation
- blocking issues
- setup actions

**Backend Dependency**

- activation state
- module catalog
- integration status
- workspace target metadata
- freshness/confidence checks

**Module Coverage**

- settings
- onboarding setup
- data-source management
- module activation visibility

**Interaction Patterns**

- connect
- disconnect
- validate
- edit
- save

**Anti-patterns**

- setup screens that behave like analytics pages
- unclear data-readiness state
- hidden blocking issues
- too many technical controls exposed by default

## Validation Summary

- `Review Analysis`: Insight Feed, Detail Drilldown, Alert / Notification
- `Content / Listing Insights`: Insight Feed, Detail Drilldown, Optimization Workspace
- `Keyword Analysis`: Analysis Workspace, Detail Drilldown, Optimization Workspace
- `Rank Tracking`: Analysis Workspace, Detail Drilldown, Alert / Notification
- `Competitor Analysis`: Comparison, Analysis Workspace, Detail Drilldown
- `Optimization Layer`: Optimization Workspace, Detail Drilldown
- `Creative / Messaging Layer`: Insight Feed, Detail Drilldown, Optimization Workspace
- `Unified Workflow Layer`: Dashboard, Optimization Workspace, Alert / Notification
- `Settings / Configuration`: Settings / Configuration, Alert / Notification

No additional archetype is required at this stage. The set is complete enough to cover MVP-active and built-but-inactive modules without creating one-off module templates.
