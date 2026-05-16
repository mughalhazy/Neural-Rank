# Frontend Content System

## Purpose
The frontend content system defines how backend intelligence is translated into user-facing decisions.

The content system must:
- translate backend outputs into insight
- guide user decisions
- drive action
- prevent raw data from appearing without interpretation
- keep every screen operational, not passive

This document sits between backend intelligence and frontend UI patterns. The backend may produce signals, scores, clusters, rankings, summaries, or recommendations; the frontend must convert those outputs into clear meaning, priority, and action.

## Source Anchors
- `MASTER_PRODUCT_BUILD_SPEC.md`
- `MASTER_BEHAVIOUR_DOC.md`
- `docs/frontend/FRONTEND_SCREEN_ARCHETYPES.md`
- `docs/frontend/FRONTEND_PATTERN_LIBRARY.md`
- `docs/backend/BACKEND_MASTER_SPEC.md`

If an anchor file is renamed in the repo, use the corresponding phase document that owns the same layer:
- archetypes: `PHASE_01_ARCHETYPES_AND_MAPPING.md`
- pattern library: `PHASE_06_PATTERN_LIBRARY.md`

## Core Rule
Every screen must answer:
- what is happening
- why it matters
- what to do next

If a screen cannot answer all three, the content is incomplete.

## Behaviour Alignment
All frontend content must align to the product behaviour flow:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

This means:
- input is the raw source or user-provided target
- analysis is the backend interpretation of the input
- insight is the human-readable meaning of the analysis
- priority is the importance or urgency of the insight
- action is the next operational step the user should take

No module is exempt from this flow.

## Content Layers

### 1. Signal
Signal is the data or backend output.

Examples:
- keyword position changed
- review cluster increased
- ranking visibility dropped
- content coverage is weak
- competitor messaging is stronger
- source freshness changed

Frontend rule:
- Signal must be visible only when it supports meaning.
- Signal must not be shown as isolated raw data.
- Signal should be attached to source, freshness, and confidence when relevant.

Content form:
- metric
- row
- badge
- delta
- status
- chart point
- cluster count
- source cue

### 2. Insight
Insight is the meaning of the signal.

Examples:
- "Exam-prep keywords are losing momentum because the listing opening does not match search intent."
- "Sync complaints are concentrated enough to justify a focused trust-repair action."
- "Competitor advantage is coming from clearer screenshot messaging, not ranking volume alone."

Frontend rule:
- Insight must explain what the signal means.
- Insight must be specific to the module and user context.
- Insight must not be generic, vague, or decorative.

Content form:
- insight card title
- interpreted summary
- evidence-backed explanation
- review cluster explanation
- content issue explanation
- competitor pressure explanation

### 3. Priority
Priority is the importance of the insight.

Examples:
- high impact
- urgent
- defend
- expand
- monitor
- gated
- action-ready

Frontend rule:
- Every insight must have a priority treatment.
- Priority must explain why one item matters more than another.
- Priority must prevent the UI from becoming a flat list of observations.

Content form:
- priority label
- action queue order
- urgency badge
- risk marker
- highlighted flow stage
- top-priority panel

### 4. Action
Action is what the user should do next.

Examples:
- rewrite the listing opening around exam-prep intent
- repair sync messaging in release notes and onboarding
- defend a rising keyword cluster
- update screenshot headline
- inspect competitor messaging gap
- connect or refresh a data source

Frontend rule:
- Every insight must lead to an action.
- Actions must be concrete enough to execute.
- Actions must include enough reasoning to avoid blind task lists.

Content form:
- action queue item
- primary CTA
- secondary action
- drilldown action
- workflow queue item
- configuration action

## System Rules

### No Raw Data Without Interpretation
Raw metrics, rows, charts, clusters, or scores must not appear alone.

Required pairing:
- data point + meaning
- chart + explanation
- cluster + cause
- ranking + implication
- metric + next step

### No Passive Dashboards
Screens must not behave like static reporting surfaces.

Every major screen must contain:
- interpreted state
- priority surface
- action path

Dashboard content must summarize decisions, not merely summarize data.

### No Vague Insights
Insights must avoid generic wording such as:
- "Performance improved"
- "Users are unhappy"
- "Keywords need work"
- "Content can be optimized"
- "Competitors are strong"

Replace with:
- what changed
- where it changed
- why it matters
- what decision it creates

### Every Insight Must Lead To Action
An insight without an action is incomplete.

Each insight should connect to one of:
- immediate fix
- investigation
- monitoring decision
- defensive move
- expansion move
- configuration or source update

### Prioritize All Outputs
Backend output may contain many items. The frontend must reduce that into decision order.

Required priority logic:
- highest-impact item first
- urgent risks before passive context
- action-ready items before vague exploration
- confidence and freshness visible when relevant

### Avoid Overload
The content system must compress intelligence without hiding meaning.

Preferred:
- concise insight title
- short reasoning summary
- evidence chips
- clear priority label
- single next action

Avoid:
- long paragraphs
- dense data dumps
- repeated context
- multiple competing calls to action

## Screen-Level Content Contract

### Dashboard Archetype
Must answer:
- what is happening across the system
- why the top issue matters now
- what action should be worked first

Required content:
- command summary
- top priority
- cross-module evidence
- action queue
- gated module context when relevant

Forbidden:
- raw metric board without decision framing
- equal-weight modules with no priority

### Analysis Feed Archetype
Used by:
- review
- content/listing insights
- creative
- optimization

Must answer:
- what pattern was detected
- why the pattern matters
- what should be changed, inspected, or executed

Required content:
- interpreted insight cluster
- evidence
- priority marker
- action path

Forbidden:
- generic insight cards
- sentiment or score displays without cause and action

### Table + Trend Archetype
Used by:
- keyword
- rank
- competitor

Must answer:
- what row or trend changed
- why the movement matters
- what action follows

Required content:
- row label
- value or rank
- movement or trend
- action flag
- priority or status

Forbidden:
- sortable table with no interpretation
- chart without explanation

### Detail Drilldown Archetype
Must answer:
- what specific item is being inspected
- what evidence supports it
- why it was prioritized
- what action should be taken

Required content:
- selected entity
- evidence list
- interpretation
- priority reason
- action options

Forbidden:
- details that only repeat the parent screen
- long evidence with no conclusion

### Configuration Archetype
Must answer:
- what source or setting is active
- why it affects trust or workflow
- what the user should connect, update, or verify

Required content:
- source status
- freshness
- confidence or coverage
- configuration action

Forbidden:
- settings as passive toggles only
- connection state without operational impact

### Gated Expansion Archetype
Must answer:
- what module exists
- why it matters later
- what activation will unlock

Required content:
- module value preview
- locked/gated status
- future workflow role

Forbidden:
- empty placeholder screens
- vague "coming soon" messaging

## Pattern-Level Content Contract

### Insight Cards
Must contain:
- specific insight title
- meaning summary
- evidence
- priority or implied priority
- action linkage

### Action Queue
Must contain:
- ordered actions
- reason behind action
- estimated effort or urgency
- module context when needed

### Alerts / Notifications
Must contain:
- trigger
- risk or opportunity
- why it matters now
- next step

### Trend Tables
Must contain:
- item label
- movement
- interpretation flag
- action implication

### Review Clusters
Must contain:
- cluster theme
- recurrence or volume
- sentiment/trust impact
- action path

### Competitor Comparison Blocks
Must contain:
- competitor name or segment
- advantage/gap
- meaning
- response action

### Flow Cards
Must reinforce:
- input
- analysis
- insight
- priority
- action

Flow cards should not become decorative process diagrams. They must support the user decision on the screen.

## Tone Rules
The content tone must be:
- clear
- direct
- operational
- non-marketing
- non-fluffy

Use:
- short sentences
- specific nouns
- active verbs
- direct recommendations
- evidence-backed reasoning

Avoid:
- hype
- vague benefit language
- generic SaaS language
- motivational copy
- excessive explanation

## Anti-Patterns

### Generic Statements
Bad:
- "Your app can improve visibility."

Better:
- "Exam-prep terms are slipping because the listing opening does not match study intent."

### Charts Without Explanation
Bad:
- chart only

Better:
- chart + "Mid-tail query gains are strongest; convert them into top-3 coverage before expanding."

### Actions Without Reasoning
Bad:
- "Rewrite description."

Better:
- "Rewrite the first 180 characters because high-volume exam-prep terms are under-matched."

### Verbosity Without Value
Bad:
- long summaries that repeat the same point

Better:
- concise insight + evidence + action

### Equal-Weight Output Lists
Bad:
- ten insights with no order

Better:
- one top priority, supporting insights, then action queue

### Passive Status Reporting
Bad:
- "Last sync: 14 minutes ago"

Better:
- "Fresh sync 14m ago; confidence is high enough to act on the review cluster."

## Backend-To-Frontend Translation Rules

Backend output should be mapped as follows:

- raw values -> signal
- grouped findings -> insight
- score, urgency, risk, opportunity, confidence -> priority
- recommendation, fix, task, next step -> action

If the backend does not provide one of these layers, the frontend content adapter must either:
- derive it from available context, or
- show an incomplete-state treatment rather than pretending the decision is complete

## Content Quality Checklist
Before any screen is considered content-complete, verify:
- the screen states what is happening
- the screen explains why it matters
- the screen tells the user what to do next
- no raw data appears without interpretation
- every insight has an action path
- every action has reasoning
- priority is visible
- tone is direct and operational
- content is concise enough for mobile

## Completion Criteria
The frontend content system is complete when:
- every screen follows `signal -> insight -> priority -> action`
- every archetype has a content contract
- every pattern has a content contract
- backend outputs can be mapped into frontend decision layers
- no screen behaves as a passive dashboard
- content tone remains clear, direct, operational, non-marketing, and non-fluffy
