# Frontend Microcopy Rules

## Purpose
This document defines how all UI content is written across the frontend.

Microcopy must support the content system and insight structure by making every message:
- clear
- short
- scannable
- operational
- action-oriented

Microcopy must not sound like marketing copy. It must help the user understand what is happening, why it matters, and what to do next.

## Source Anchors
- `docs/frontend/FRONTEND_CONTENT_SYSTEM.md`
- `docs/frontend/FRONTEND_INSIGHT_STRUCTURE.md`

## Core Structure
Use this structure for all meaningful UI text:

`statement -> reason -> action`

### Statement
The statement says what is happening.

Examples:
- "Sync complaints are increasing."
- "Exam-prep terms are slipping."
- "The keyword source is stale."

### Reason
The reason says why it matters.

Examples:
- "The issue is recurring in recent reviews."
- "The listing opening does not match search intent."
- "Freshness is too low for confident action."

### Action
The action says what to do next.

Examples:
- "Repair sync messaging in release notes."
- "Rewrite the first 180 characters."
- "Refresh the source before acting."

## Required Writing Pattern
Every insight, alert, action, and empty/error state should map to:

- statement: what is happening
- reason: why it matters
- action: what to do next

Short UI elements may compress the pattern, but they must not lose meaning.

Example compressed format:
- Title: "Exam-prep terms are slipping"
- Body: "The opening copy misses study intent. Rewrite the first 180 characters."

## Length Rules

### General
- Keep text short.
- Make text scannable.
- Remove unnecessary words.
- Prefer one useful sentence over two weak sentences.
- Use evidence chips instead of long explanations when possible.

### Titles
Recommended:
- 4-9 words

Rules:
- title must say what is happening
- title must be specific
- title must not be a category label only

Bad:
- "Keyword Insight"
- "Review Update"
- "Content Opportunity"

Good:
- "Exam-prep terms are slipping"
- "Sync complaints are recurring"
- "Opening copy misses study intent"

### Body Text
Recommended:
- 1-2 short sentences
- 12-28 words when possible

Rules:
- body text must explain why the statement matters
- body text should include action when there is no separate action control
- body text must not repeat the title

Bad:
- "This keyword insight shows that your keywords may need optimization and that performance can improve if action is taken."

Good:
- "The listing opening misses study intent. Rewrite the first 180 characters around exam-prep outcomes."

### Action Labels
Recommended:
- 2-5 words

Rules:
- action labels must start with a verb
- action labels must be specific
- action labels must not use vague verbs

Bad:
- "Improve"
- "Optimize"
- "Learn more"
- "Take action"

Good:
- "Rewrite opening"
- "Inspect cluster"
- "Refresh source"
- "Compare competitor"

## Language Rules

### Use Clear Language
Use words the user can act on quickly.

Prefer:
- rewrite
- inspect
- compare
- refresh
- defend
- repair
- connect
- review
- prioritize

Avoid:
- leverage
- optimize
- enhance
- unlock
- supercharge
- maximize
- elevate

### No Fluff
Do not add excitement or decoration.

Bad:
- "Unlock powerful growth opportunities with smarter insights."

Good:
- "Keyword gains are not converting. Rewrite the listing opening."

### No Marketing Tone
The app should sound like an operating system, not a sales page.

Bad:
- "Boost your app store success with AI-powered recommendations."

Good:
- "Review complaints are recurring. Repair sync messaging before ratings drop."

### Minimal Jargon
Use product terms only when they clarify the decision.

Allowed:
- keyword
- rank
- review cluster
- listing
- confidence
- freshness
- source
- competitor

Avoid unless necessary:
- semantic coverage
- conversion pressure
- latent intent
- entity optimization
- algorithmic opportunity

If jargon is used, pair it with plain meaning.

## Action Language

Action language must be:
- direct
- specific
- non-vague
- executable

### Required Action Shape
Use:

`Verb + object + context`

Examples:
- "Rewrite opening around exam-prep intent."
- "Repair sync messaging in release notes."
- "Compare screenshot promise against Rival A."
- "Refresh keyword source before acting."

### Action Verb Rules
Use strong verbs:
- rewrite
- repair
- defend
- inspect
- compare
- refresh
- connect
- reorder
- add
- remove
- update
- prioritize

Avoid weak verbs:
- improve
- optimize
- enhance
- check
- consider
- explore
- leverage
- utilize

### Action Specificity
Actions must name the target.

Bad:
- "Fix messaging."

Good:
- "Rewrite screenshot headline around offline study."

Bad:
- "Review keywords."

Good:
- "Inspect declining exam-prep keyword cluster."

## Examples

### Generic Statement
Bad:
- "Your app performance can improve."

Good:
- "Exam-prep terms are slipping because the opening copy misses study intent."

### Fluffy Marketing Copy
Bad:
- "Unlock growth with powerful optimization insights."

Good:
- "Visibility gains are not converting. Rewrite the listing promise."

### Vague Insight
Bad:
- "Users are unhappy with the app."

Good:
- "Sync complaints are recurring in recent reviews."

### Data Dump
Bad:
- "Rank #9, Vol 11k, -2, CTR low, conversion weak."

Good:
- "Exam-prep rank dropped by 2 positions. Rewrite the opening copy before expanding new terms."

### Chart Without Explanation
Bad:
- "Momentum snapshot"

Good:
- "Mid-tail gains are strongest. Convert them into top-3 coverage before chasing new head terms."

### Action Without Reason
Bad:
- "Rewrite description."

Good:
- "Rewrite the first 180 characters because exam-prep intent is under-matched."

### Repetitive Copy
Bad:
- "Sync complaints are increasing. Sync complaints are a problem because users mention sync. You should fix sync complaints."

Good:
- "Sync complaints are recurring. Repair release-note and onboarding messaging."

### Weak CTA
Bad:
- "Learn more"

Good:
- "Inspect sync cluster"

### Passive Dashboard Copy
Bad:
- "Last sync: 14 minutes ago"

Good:
- "Fresh sync 14m ago. Confidence is high enough to act."

### Empty State
Bad:
- "No data available."

Good:
- "No keywords tracked yet. Add seed terms to build the opportunity board."

### Error State
Bad:
- "Something went wrong."

Good:
- "Rank data did not load. Refresh the source before reviewing movement."

## UI Element Rules

### Headers
Headers must:
- establish the screen job
- avoid broad product claims
- stay operational

Bad:
- "Grow smarter with Neural Rank"

Good:
- "Work the highest-leverage growth moves first"

### Section Titles
Section titles must:
- name the decision area
- avoid generic labels

Bad:
- "Insights"
- "Data"
- "Overview"

Good:
- "Command evidence"
- "Review intake"
- "Rank evidence"
- "Action queue"

### Insight Cards
Insight cards must:
- state the pattern
- explain the consequence
- expose supporting evidence
- connect to action

### Alerts
Alerts must:
- name the trigger
- state why it matters now
- tell the user what to do

### Action Queue Items
Action queue items must:
- start with a direct action
- include reason or context
- show urgency or effort when relevant

### Trust Cues
Trust cues must be short.

Good:
- "Fresh sync 14m ago"
- "High confidence"
- "Review feed connected"

Bad:
- "The data source was recently synchronized and should be considered reliable."

## Rules

### No Generic Statements
Every statement must name the specific pattern, issue, source, module, or action.

### No Filler
Remove words that do not change the user decision.

Filler examples:
- powerful
- smart
- advanced
- seamless
- robust
- comprehensive
- cutting-edge

### No Repetition
Do not repeat the same idea in title, body, and action.

Bad:
- Title: "Sync complaints are recurring"
- Body: "Sync complaints are recurring in reviews."
- Action: "Fix recurring sync complaints."

Good:
- Title: "Sync complaints are recurring"
- Body: "The theme is narrow enough for a targeted trust repair."
- Action: "Repair sync messaging."

### No Vague Actions
Actions must not rely on the user to infer what to do.

Bad:
- "Optimize listing."

Good:
- "Rewrite listing opening around exam-prep intent."

### No Unexplained Priority
If something is marked urgent or high impact, the copy must explain why.

Bad:
- "High impact: update content."

Good:
- "High impact: opening copy misses the highest-volume study intent."

## Review Checklist
Before UI copy is accepted, verify:
- it follows statement -> reason -> action
- it is short and scannable
- it avoids marketing tone
- it avoids generic statements
- it removes filler
- it avoids repetition
- the action is specific
- the reason supports the action
- no raw data appears without interpretation

## Completion Criteria
Microcopy is acceptable when:
- users can understand the decision in seconds
- every insight has action-oriented wording
- every action has a reason
- no UI text sounds like marketing filler
- no screen depends on vague copy to explain backend intelligence
