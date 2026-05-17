# Phase 5: Pattern Extraction Checklist

## Objective
Formalize each extracted pattern into a governed reusable unit before building the pattern library.

## Mandatory Fields Per Pattern
- pattern name
- purpose
- where used
- structure
- behaviour notes
- allowed variants
- anti-patterns

## Review Template

### Pattern Name
- Purpose:
- Where Used:
- Structure:
- Behaviour Notes:
- Allowed Variants:
- Anti-Patterns:

## Initial Pattern Set To Formalize
- command header
- priority hero
- metric rail
- trend table block
- insight cluster card
- action queue
- locked module preview
- chart container
- filter chip row
- alert strip
- review cluster block
- competitor comparison block

## Governance Rules
- Patterns must be usable in at least two contexts or justify their bounded ownership.
- Patterns must not encode one screen’s copy or static data assumptions.
- Variants must be defined before implementation, not discovered ad hoc during screen polishing.

## Completion Criteria
- every extracted pattern has a completed checklist entry
- anti-patterns are explicit enough to reject bad reuse
- pattern boundaries are clear enough for component implementation

## Checklist Records

### Command Header
- Purpose: establish screen context, freshness, and primary action
- Where Used: dashboard, keyword, rank, content, review, settings, gated scaffolds
- Structure: eyebrow, title, subtitle, primary action, freshness chip
- Behaviour Notes: should always precede data-heavy content
- Allowed Variants: active module, gated module, drilldown
- Anti-Patterns: decorative hero without action, oversized marketing banner

### Priority Hero
- Purpose: surface the highest-impact issue or opportunity
- Where Used: dashboard, content
- Structure: priority badge, title, summary, supporting signals
- Behaviour Notes: should remain singular and high-contrast
- Allowed Variants: opportunity hero, risk hero
- Anti-Patterns: multiple competing heroes on one screen

### Metric Rail
- Purpose: provide compact operational scan values with interpretation
- Where Used: dashboard, keywords
- Structure: grouped metric cards with value, delta, interpretation label
- Behaviour Notes: should stay secondary to the main action path
- Allowed Variants: 2-card, 3-card, 4-card
- Anti-Patterns: dense raw analytics wall

### Trend Table Block
- Purpose: pair compact movement data with action framing
- Where Used: keywords, ranks, competitor
- Structure: section heading, spark context, row set, status flag
- Behaviour Notes: should remain mobile-readable and action-aware
- Allowed Variants: keyword rows, rank rows, competitor pressure rows
- Anti-Patterns: sortable-data-table desktop clone

### Insight Cluster Card
- Purpose: group one interpreted finding and its evidence
- Where Used: dashboard, content, review
- Structure: title, summary, evidence chips, tone
- Behaviour Notes: each card should represent one coherent signal
- Allowed Variants: risk insight, opportunity insight, trust insight
- Anti-Patterns: mixed unrelated findings in one card

### Action Queue
- Purpose: convert insights into visible next steps
- Where Used: dashboard, keywords, content, review, workflow
- Structure: action list with priority, summary, time estimate
- Behaviour Notes: should appear after interpretation, not before it
- Allowed Variants: module queue, workflow queue
- Anti-Patterns: generic task list detached from insights

### Locked Module Preview
- Purpose: show future product surface without exposing it as active MVP functionality
- Where Used: dashboard
- Structure: module title, summary, lock framing, preview metrics
- Behaviour Notes: must communicate existence without deception
- Allowed Variants: dashboard preview, later dedicated gated screen
- Anti-Patterns: fake active module card

### Chart Container
- Purpose: wrap chart content with explanatory framing
- Where Used: rank screen
- Structure: title, subtitle, chart body
- Behaviour Notes: chart must always carry interpretation context
- Allowed Variants: trend bars, sparkline region
- Anti-Patterns: naked chart dropped into the UI

### Filter Chip Row
- Purpose: support quick segmentation without desktop-style heavy filtering chrome
- Where Used: dashboard, keywords
- Structure: horizontal chip group with selected state
- Behaviour Notes: filters should remain quick-scan, not form-heavy
- Allowed Variants: module filter, state filter, segment filter
- Anti-Patterns: bulky modal-style filtering for simple screen segmentation

### Alert Strip
- Purpose: elevate one trust, risk, or operational notice
- Where Used: dashboard, review, gated screens
- Structure: icon, title, short message
- Behaviour Notes: use sparingly and only for actionable or trust-critical context
- Allowed Variants: trust alert, risk alert, gated notice
- Anti-Patterns: stacking multiple alerts until the screen becomes warning-heavy

### Review Cluster Block
- Purpose: present one recurring review cluster with evidence and sentiment context
- Where Used: review screen
- Structure: cluster title, mention count, sentiment label, summary, evidence chips
- Behaviour Notes: cluster should connect clearly to possible product or messaging action
- Allowed Variants: complaint cluster, request cluster
- Anti-Patterns: dumping raw review excerpts without clustering

### Competitor Comparison Block
- Purpose: compare visibility, trust, and messaging pressure in one governed block
- Where Used: competitor analysis scaffold
- Structure: competitor rows with visibility, review trust, messaging, advantage
- Behaviour Notes: comparison should expose actionable difference, not trivia
- Allowed Variants: rival comparison, share-of-voice pressure block
- Anti-Patterns: generic side-by-side card grid with no strategic framing
