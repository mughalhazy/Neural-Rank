# Frontend Backend Content Mapping

## Purpose
This document defines how backend outputs become frontend content.

The backend exists to support an operational SEO/ASO system. It must not stop at raw data delivery. The frontend must not display backend output as raw data. Together, backend and frontend must produce user decisions.

Backend output must be mapped into:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

Frontend content must present:
- what is happening
- why it matters
- what supports it
- how important it is
- what to do next

## Source Anchors
- `docs/backend/reference/BACKEND_MASTER_SPEC.md`
- `MASTER_BUILD_SPEC.md`
- `docs/frontend/planning/FRONTEND_CONTENT_FULL_SYSTEM.md`
- `docs/frontend/reference/FRONTEND_MICROCOPY_RULES.md`

## Mapping Rule
Every backend module output must be translated into four frontend content layers:

- signal: backend data or detected condition
- insight: meaning of the signal
- priority: importance, urgency, risk, or opportunity
- action: concrete next step

If any layer is missing, the frontend must not pretend the output is complete. It must either:
- derive the missing layer from available backend context,
- show an incomplete-state treatment,
- or wait until the backend provides enough context.

## Backend-To-Frontend Field Contract

### Backend Input
Backend input is the source material or user target.

Frontend representation:
- source label
- target label
- freshness cue
- confidence cue when available

Examples:
- app URL
- website URL
- keywords
- reviews
- competitor URLs/apps
- listing metadata

### Backend Analysis
Backend analysis is processed intelligence.

Frontend representation:
- interpreted summary
- cluster label
- movement explanation
- gap explanation
- comparison summary

Examples:
- review cluster
- keyword opportunity group
- ranking movement analysis
- content gap analysis
- competitor pressure analysis

### Backend Signal
Backend signal is the supporting data.

Frontend representation:
- evidence chip
- metric with meaning
- trend row with interpretation
- chart annotation
- review sample summary

Examples:
- `+11 average movement`
- `29% mention sync`
- `Rank #9`
- `Vol 11k`
- `Fresh sync 14m ago`

### Backend Priority
Backend priority is the importance of the output.

Frontend representation:
- impact label
- urgency badge
- queue order
- highlighted priority
- risk or opportunity label

Allowed frontend labels:
- critical
- urgent
- high impact
- action-ready
- defend
- expand
- monitor
- gated

### Backend Recommendation
Backend recommendation is the action path.

Frontend representation:
- action queue item
- CTA
- drilldown action
- workflow task
- configuration action

Action format:

`Verb + object + context`

Examples:
- "Rewrite opening around exam-prep intent."
- "Repair sync messaging in release notes."
- "Refresh keyword source before reviewing movement."

## Module Mapping

### Review Analysis
Backend outputs:
- review clusters
- sentiment direction
- recurring complaint themes
- feature request themes
- representative review snippets
- source freshness
- confidence

Frontend mapping:
- signal: mention count, recurrence, rating/sentiment, review examples
- insight: what complaint or request theme is recurring
- explanation: why the theme affects trust, conversion, retention, or product follow-up
- priority: urgent, high impact, monitor
- action: repair messaging, inspect cluster, create product-fix task, write response guidance

Required frontend content block:
- review intake
- review cluster evidence
- review action queue

Forbidden:
- raw review list without cluster meaning
- sentiment score without cause
- action item without complaint explanation

### Content / Listing Insights
Backend outputs:
- listing metadata analysis
- title/description/screenshot coverage gaps
- relevance gaps
- message clarity issues
- rewrite recommendations

Frontend mapping:
- signal: affected content surface, query cluster, rank/volume context, coverage gap
- insight: what message or relevance gap exists
- explanation: why it affects conversion, ranking, or trust
- priority: high impact, action-ready, monitor
- action: rewrite, reorder, update, compare, create rewrite task

Required frontend content block:
- listing context
- priority evidence
- content action queue

Forbidden:
- content score without rewrite implication
- copy issue without action
- generic "optimize content" instruction

### Keyword Analysis
Backend outputs:
- keyword opportunities
- keyword volume
- current position
- keyword movement
- intent grouping
- keyword difficulty or fit

Frontend mapping:
- signal: keyword, rank, volume, movement, cluster
- insight: what opportunity, decline, or defense condition exists
- explanation: why the keyword matters for targeting or content work
- priority: defend, expand, urgent, monitor
- action: defend cluster, expand coverage, inspect decline, route to content rewrite

Required frontend content block:
- signal intake
- opportunity evidence
- keyword action queue

Forbidden:
- keyword table without action flags
- rank/volume dump without interpretation
- keyword suggestion without target context

### Rank Tracking
Backend outputs:
- tracked keyword movement
- rank history
- top-3 coverage
- decay groups
- unranked opportunities
- sweep freshness

Frontend mapping:
- signal: rank movement, trend direction, cohort, sweep time
- insight: what ranking pattern matters
- explanation: why movement changes defense, recovery, or expansion decisions
- priority: urgent, defend, expand, monitor
- action: inspect decays, protect gains, recover movement, expand coverage

Required frontend content block:
- tracking context
- rank evidence
- rank response action

Forbidden:
- chart without movement explanation
- rank table without priority
- sweep freshness without trust implication

### Competitor Analysis
Backend outputs:
- competitor visibility comparison
- share-of-voice
- messaging comparison
- review trust comparison
- competitor gap or advantage

Frontend mapping:
- signal: competitor name, visibility delta, messaging gap, trust gap
- insight: where competitor pressure or weakness exists
- explanation: why the gap creates a response decision
- priority: high impact, exploit, defend, monitor
- action: compare message, rewrite screenshot promise, exploit weakness, defend visibility

Required frontend content block:
- competitor pressure evidence
- competitor comparison
- response action

Forbidden:
- competitor list without strategic implication
- share-of-voice without response
- comparison without action

### Optimization Layer
Backend outputs:
- accepted insights
- prioritized tasks
- execution dependencies
- opportunity/risk scoring
- recommended execution sequence

Frontend mapping:
- signal: source insight, dependency, opportunity, risk
- insight: what optimization task should be executed first
- explanation: why the task outranks other possible work
- priority: high impact, action-ready, blocked, monitor
- action: execute task, resolve dependency, inspect source insight, add to workflow

Required frontend content block:
- execution structure
- optimization flow
- optimization action

Forbidden:
- generic improvement checklist
- task without source insight
- execution item without priority reason

### Creative / Messaging Layer
Backend outputs:
- screenshot text analysis
- caption analysis
- message clarity analysis
- competitor message comparison
- creative recommendations

Frontend mapping:
- signal: affected creative surface, weak phrase, competitor contrast, user-intent mismatch
- insight: what message surface weakens conversion or trust
- explanation: why the first-impression message matters
- priority: high impact, action-ready, monitor
- action: rewrite headline, clarify promise, compare competitor, create creative test

Required frontend content block:
- creative decision structure
- creative flow
- creative action

Forbidden:
- creative critique without rewrite target
- message score without explanation
- competitor copy comparison without response

### Unified Workflow Layer
Backend outputs:
- cross-module top insights
- prioritized actions
- dependencies
- module status
- workflow queue state

Frontend mapping:
- signal: source module, evidence summary, dependency, queue status
- insight: what cross-module work should happen first
- explanation: why this order avoids duplicate or conflicting work
- priority: critical, urgent, high impact, action-ready, blocked, monitor
- action: execute, inspect, assign, sequence, resolve dependency

Required frontend content block:
- resolution structure
- cross-module action queue
- workflow next action

Forbidden:
- module list without unified priority
- workflow task without source reasoning
- action queue without dependency context

## Shared Mapping Requirements

### Metrics
Backend metric must become:
- metric value
- meaning
- impact or trust cue
- action path when relevant

### Tables
Backend table row must become:
- row label
- signal value
- interpretation flag
- impact
- action implication

### Charts
Backend chart must become:
- chart title
- interpreted trend
- affected cohort
- action implication

### Alerts
Backend alert must become:
- trigger
- reason it matters
- impact
- action

### Actions
Backend recommendation must become:
- verb
- object
- context
- reason
- optional effort or next step

## Missing Data Handling

If backend output lacks evidence:
- show insight as incomplete
- ask for source refresh or more data
- do not display unsupported claims

If backend output lacks priority:
- derive priority from urgency, confidence, risk, opportunity, or workflow dependency
- if priority cannot be derived, mark as monitor

If backend output lacks action:
- do not call it an insight
- present it as signal/status only
- or generate a configuration/investigation action

If backend output lacks confidence/freshness:
- avoid strong action language
- show monitor or refresh-source treatment

## Content Adapter Checklist
Before backend output reaches the UI, verify:
- input source is known
- analysis has been interpreted
- signal is selected and concise
- insight explains meaning
- priority is assigned
- action is executable
- microcopy follows `statement -> reason -> action`
- no raw backend payload language appears in the UI

## Completion Criteria
This mapping is complete when:
- every backend module has a frontend content mapping
- every mapping supports `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- raw backend outputs have a defined frontend content destination
- missing backend fields have fallback handling
- every frontend module can consume backend intelligence without inventing local content rules
