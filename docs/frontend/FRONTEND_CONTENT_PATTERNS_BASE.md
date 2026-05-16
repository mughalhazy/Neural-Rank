# Frontend Content Patterns Base

## Purpose
This document defines the base frontend content patterns before any reverse engineering or external inspiration is applied.

These patterns are system-native only. They come from:
- `docs/frontend/FRONTEND_CONTENT_SYSTEM.md`
- `docs/frontend/FRONTEND_INSIGHT_STRUCTURE.md`
- `docs/frontend/FRONTEND_MICROCOPY_RULES.md`

## Core Rule
No external influence is allowed in this document.

This base layer must define the product's native content logic first:
- signal becomes insight
- insight explains meaning
- priority orders attention
- action drives execution

External examples, competitor UX, marketplace references, or inspiration screenshots may be reviewed later, but they must not override this base system.

## Shared Content Flow
Every content pattern must support:

`statement -> reason -> action`

and:

`INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`

Every pattern must help the user answer:
- what is happening
- why it matters
- what to do next

## Pattern 1: Insight Pattern

### Pattern Name
Decision Insight

### Purpose
Convert backend analysis into a clear user-facing decision.

The insight pattern explains the meaning of a signal and prepares the user for priority and action.

### Structure Template
```text
Title:
<Specific statement of what is happening>

Explanation:
<Why it matters or what decision it creates>

Evidence:
<2-4 supporting signals>

Impact:
<Priority level or urgency>

Action:
<Concrete next step>

Optional next step:
<Drilldown, compare, refresh, add to workflow, or inspect>
```

### Required Fields
- title
- explanation
- evidence
- impact
- action

### Optional Fields
- next step
- source
- freshness
- confidence
- estimated effort
- module label

### Usage Rules
- Use for interpreted findings across all modules.
- Title must say what is happening.
- Explanation must say why it matters.
- Evidence must support the claim.
- Impact must rank importance.
- Action must be concrete and executable.
- Do not use this pattern for raw metrics, passive status, or decorative summaries.

### Native Example
```text
Title:
Sync complaints are recurring

Explanation:
The theme is narrow and recent enough to justify a focused trust repair.

Evidence:
29% mention sync
14-day recurrence
Recent review window

Impact:
Urgent

Action:
Repair sync messaging in release notes and onboarding.

Optional next step:
Inspect sync cluster
```

## Pattern 2: Explanation Pattern

### Pattern Name
Reasoned Explanation

### Purpose
Explain why a signal matters without becoming verbose.

The explanation pattern connects a detected condition to user impact, workflow impact, trust impact, ranking impact, or conversion impact.

### Structure Template
```text
Because <cause or condition>, <impact or consequence>.
```

Alternative:

```text
<Signal meaning>. <Decision implication>.
```

### Required Fields
- cause or condition
- consequence or decision implication

### Optional Fields
- confidence cue
- timeframe
- affected module
- affected surface

### Usage Rules
- Use inside insight cards, alerts, action queue items, and detail drilldowns.
- Keep to one sentence when possible.
- Use two short sentences only when the action is complex.
- Do not repeat the title.
- Do not explain obvious data.
- Do not use generic importance language.

### Native Examples
Good:
```text
The listing opening misses study intent, so visibility gains are less likely to convert.
```

Good:
```text
The complaint theme is narrow and recurring. This makes it a high-leverage trust repair.
```

Bad:
```text
This is important and may affect performance.
```

Bad:
```text
The keyword data shows keyword data that should be optimized.
```

## Pattern 3: Action Pattern

### Pattern Name
Executable Action

### Purpose
Turn an insight into a clear next step.

The action pattern must tell the user exactly what to do and preserve the reasoning behind the task.

### Structure Template
```text
<Verb> <object> <context>.
```

Expanded action queue form:

```text
Action title:
<Verb + object + context>

Reason:
<Why this action exists>

Effort or urgency:
<Time, priority, or urgency label>
```

### Required Fields
- verb
- object
- context

### Optional Fields
- effort
- owner
- urgency
- next step
- supporting evidence

### Usage Rules
- Use direct verbs.
- Name the exact target of the action.
- Include context that links back to the insight.
- Avoid weak verbs such as improve, optimize, enhance, explore, or leverage.
- Do not create an action unless the reason is clear.
- Do not create multiple competing primary actions for one insight.

### Preferred Verbs
- rewrite
- repair
- inspect
- compare
- refresh
- connect
- defend
- reorder
- update
- prioritize

### Native Examples
Good:
```text
Rewrite the first 180 characters around exam-prep intent.
```

Good:
```text
Repair sync messaging in release notes and onboarding.
```

Good:
```text
Refresh the keyword source before reviewing movement.
```

Bad:
```text
Optimize content.
```

Bad:
```text
Take action.
```

## Pattern 4: Priority Pattern

### Pattern Name
Decision Priority

### Purpose
Rank insight importance so users know what deserves attention first.

The priority pattern prevents the UI from becoming a flat list of equal-weight findings.

### Structure Template
```text
Priority label:
<Urgency or importance>

Priority reason:
<Why this item outranks others>

Action order:
<Queue position or visual emphasis>
```

Compact form:

```text
<Priority label> because <priority reason>.
```

### Required Fields
- priority label
- reason for priority

### Optional Fields
- urgency
- confidence
- estimated effort
- risk level
- opportunity level
- queue position

### Allowed Priority Labels
- critical
- urgent
- high impact
- action-ready
- defend
- expand
- monitor
- low
- gated

### Usage Rules
- Use priority on every insight.
- Use `critical` or `urgent` only for immediate risk or high-leverage work.
- Use `high impact` when the item can materially affect ranking, trust, conversion, or workflow progress.
- Use `defend` when the current position is strong but vulnerable.
- Use `expand` when the opportunity is validated enough to grow.
- Use `monitor` when awareness is needed but immediate action is not.
- Use `gated` only for inactive module surfaces.
- Do not use vague priority labels such as good, bad, important, or needs work.

### Native Examples
Good:
```text
High impact because the highest-volume study terms are under-matched.
```

Good:
```text
Urgent because the complaint cluster is recent, recurring, and trust-related.
```

Good:
```text
Defend because the keyword is already near top position and can be protected with matching copy.
```

Bad:
```text
Important.
```

Bad:
```text
Needs work.
```

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

## System-Native Constraints

### No External Influence Yet
This base document must not include:
- competitor copy formats
- marketplace screenshot patterns
- SaaS marketing patterns
- external UX writing formulas
- borrowed naming systems

### No Generic Content
Every pattern must stay tied to the product behaviour flow.

### No Passive Content
Patterns must drive decisions, not merely describe state.

### No Data Dumps
Evidence must be selected, compressed, and interpreted.

### No Action Without Reason
Actions must be justified by the explanation or evidence.

## Base Pattern Review Checklist
Before a content pattern is accepted, verify:
- it supports `INPUT -> ANALYSIS -> INSIGHT -> PRIORITY -> ACTION`
- it follows `statement -> reason -> action`
- it has clear required fields
- it has clear optional fields
- it avoids vague wording
- it avoids data dumps
- it leads to action
- it does not rely on external influence

## Completion Criteria
This base content pattern layer is complete when:
- insight pattern is defined
- explanation pattern is defined
- action pattern is defined
- priority pattern is defined
- each pattern has name, purpose, structure template, and usage rules
- no external reverse-engineered content influence has been introduced
