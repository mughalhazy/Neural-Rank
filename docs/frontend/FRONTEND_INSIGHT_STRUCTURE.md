# Frontend Insight Structure

## Purpose
This document standardizes how insights are written, shaped, and displayed across all frontend modules and screens.

Every insight must convert backend intelligence into a user decision. It must explain:
- what is happening
- why it matters
- what supports it
- how important it is
- what to do next

This document is anchored to:
- `MASTER_BEHAVIOUR_DOC.md`
- `docs/frontend/FRONTEND_CONTENT_SYSTEM.md`
- `docs/frontend/FRONTEND_PATTERN_LIBRARY.md`

If `FRONTEND_PATTERN_LIBRARY.md` is not present, use `PHASE_06_PATTERN_LIBRARY.md` as the active pattern-library anchor.

## Behaviour Alignment
Every insight must follow the product behaviour flow:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

Insight structure maps to that flow as:
- input: source signal or user target
- analysis: interpreted backend output
- insight title and explanation: meaning
- impact: priority
- action: what to do
- optional next step: follow-through or drilldown

## Required Insight Fields

### 1. Title
Purpose:
- state what is happening
- identify the change, risk, opportunity, or pattern

Required:
- yes

Rules:
- must be specific
- must describe the actual issue or opportunity
- must avoid generic labels

Good:
- "Exam-prep keywords are losing momentum"
- "Sync complaints are concentrated in recent reviews"
- "Competitor messaging is clearer on screenshot value"

Bad:
- "Keyword insight"
- "Performance changed"
- "Reviews need attention"
- "Competitor is strong"

### 2. Explanation
Purpose:
- explain why the insight matters
- connect the signal to business or workflow impact

Required:
- yes

Rules:
- must explain the implication
- must be short enough for mobile
- must include cause, consequence, or decision value

Good:
- "The listing opening does not match high-volume study intent, so visibility gains are less likely to convert."
- "The complaint theme is narrow and recurring, which makes it a high-leverage trust repair."

Bad:
- "This is important."
- "This may affect performance."
- "You should optimize this."

### 3. Evidence
Purpose:
- provide the supporting signal behind the insight
- keep the insight grounded in backend output

Required:
- yes

Allowed formats:
- evidence chips
- short bullet list
- metric + label
- trend row
- review example
- source/freshness/confidence cue
- compact chart annotation

Rules:
- evidence must support the title and explanation
- evidence must be concise
- evidence must not become a raw data dump

Good:
- `+11 average movement`
- `29% mention sync`
- `14-day recurrence`
- `Vol 18k`
- `Fresh sync 14m ago`

Bad:
- full unfiltered metric dumps
- long review text without summary
- tables with no interpretation

### 4. Impact
Purpose:
- express priority level
- tell the user how much attention the insight deserves

Required:
- yes

Allowed formats:
- priority label
- urgency badge
- risk level
- opportunity level
- action queue position
- highlighted priority stage
- tone color

Allowed impact levels:
- critical
- high
- medium
- low
- monitor
- gated

Recommended product labels:
- urgent
- high impact
- defend
- expand
- monitor
- action-ready
- gated

Rules:
- impact must explain relative importance
- high impact should be used only when the insight affects priority work
- monitor should be used when action is not immediate but awareness matters
- gated should be used only for inactive module surfaces

Good:
- `High impact`
- `Urgent`
- `Defend`
- `Action-ready`

Bad:
- `Important` without reason
- `Good`
- `Bad`
- `Needs work`

### 5. Action
Purpose:
- tell the user what to do
- convert the insight into workflow

Required:
- yes

Allowed formats:
- action queue item
- primary CTA
- secondary CTA
- drilldown action
- configuration action
- workflow task
- rewrite instruction
- investigation instruction

Rules:
- action must be concrete
- action must connect to the explanation
- action must be phrased as an executable next step
- action must not be generic optimization language

Good:
- "Rewrite the first 180 characters around exam-prep intent."
- "Repair sync messaging in release notes and onboarding."
- "Inspect competitor screenshot headline gap."
- "Refresh the Play Store source before acting."

Bad:
- "Improve content."
- "Optimize keywords."
- "Check reviews."
- "Analyze competitor."

### 6. Optional Next Step
Purpose:
- provide follow-through when an action needs a secondary path
- guide the user into drilldown, workflow queue, or configuration

Required:
- no

Allowed formats:
- "Open cluster"
- "View evidence"
- "Add to workflow"
- "Compare competitor"
- "Refresh source"
- "Create rewrite task"

Rules:
- optional next step must not compete with the primary action
- optional next step should be used for navigation, confirmation, or deeper evidence
- optional next step should be short

## Required vs Optional Fields

Required for every insight:
- title
- explanation
- evidence
- impact
- action

Optional:
- next step
- confidence
- freshness
- source
- estimated effort
- module label
- owner/status

Optional fields become required when they affect trust or execution.

Examples:
- source is required when backend data freshness affects confidence
- confidence is required when insight certainty is not obvious
- estimated effort is required when the item enters an action queue

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

## Impact Expression Rules

Impact must be expressed through at least one of:
- label
- position
- visual tone
- queue order
- highlighted priority stage

Impact should be determined by:
- urgency
- confidence
- business value
- visibility effect
- trust risk
- conversion risk
- user effort
- workflow dependency

Impact should not be determined by:
- raw metric size alone
- arbitrary order
- visual preference
- backend output order without interpretation

## Action Structure Rules

Every action must contain:
- verb
- object
- reason or context

Recommended form:
- `Verb + object + context`

Examples:
- "Rewrite description opening around exam-prep intent."
- "Defend rising note-taking cluster with content coverage."
- "Repair sync trust gap in release notes."
- "Compare competitor screenshot promise before rewriting creative."

Avoid:
- "Improve"
- "Optimize"
- "Fix it"
- "Look into this"
- "Take action"

## Module-Specific Insight Guidance

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

## Rules

### No Insight Without Action
Every insight must lead to a concrete action.

If no action exists, the content should be rewritten as:
- a signal
- a status
- an empty state
- a monitoring note

It should not be called an insight.

### No Action Without Explanation
Every action must explain why it exists.

An action without reasoning becomes a task list, not intelligence.

### No Vague Wording
Do not use:
- "improve performance"
- "optimize content"
- "review data"
- "users are unhappy"
- "competitor is better"
- "this is important"

Use specific nouns and verbs.

### No Data Dump
Evidence must be selected and interpreted.

Do not display:
- excessive rows
- ungrouped metrics
- long raw review text
- chart-only findings
- backend payload language

## Insight Quality Checklist
Before an insight is accepted, verify:
- title says what is happening
- explanation says why it matters
- evidence supports the claim
- impact is visible
- action is concrete
- action follows from the explanation
- optional next step does not compete with the action
- wording is clear, direct, operational, and non-fluffy
- there is no raw data dump

## Completion Criteria
The insight structure is complete when:
- all modules use the same insight fields
- every insight has title, explanation, evidence, impact, and action
- optional next steps are used only when useful
- impact is consistently expressed
- actions are concrete and reasoned
- frontend patterns can render insights without inventing local content rules
