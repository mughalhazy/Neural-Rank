# Phase 3: Patterns, Language, And System

## Objective
Freeze the reusable UI patterns, visual language, and design-system rules before screen implementation.

## Extracted Pattern Library

### Command Header
- Purpose: show target, freshness, and main CTA
- Structure: title, subtitle, data freshness chip, primary action

### Priority Hero
- Purpose: surface highest-impact issue or opportunity
- Structure: impact score, one-sentence insight, main action, supporting stat row

### Insight Cluster Card
- Purpose: present grouped findings with severity and proof
- Structure: icon, title, summary, evidence chips, suggested action

### Metric Rail
- Purpose: compact scan of critical KPIs
- Structure: 2 to 4 stat cards with delta and interpretation label

### Trend Table Block
- Purpose: pair rows with movement and action markers
- Structure: section header, filter chips, rows, inline delta, action indicator

### Action Queue
- Purpose: keep next steps visible and prioritized
- Structure: priority badge, task text, impact note, optional owner/state

### Locked Module Preview
- Purpose: represent inactive modules without exposing them as active MVP features
- Structure: value proposition, preview stats, lock badge, rollout note

## Visual Language
- Tone: operational, premium, analytical
- Density: medium-high, but with strong whitespace around major decision areas
- Hierarchy: bold headline + restrained secondary text
- Shape: rounded rectangles with deliberate but not oversized radius
- Color character: deep slate base, cool neutrals, electric cyan and mint accents, selective coral for risk
- Elevation: soft layered surfaces, low blur glow on emphasis cards
- Motion: short elevation and fade transitions, no ornamental bounce

## Design-System Rules
- 4-point spacing base
- Large cards use 24 to 28 radius, internal padding 20 to 24
- Small elements use 10 to 16 radius
- Typography hierarchy:
  - display for home hero and module totals
  - title for section anchors
  - body for explanations
  - label for filters, chips, and metadata
- Color semantics:
  - info
  - success
  - warning
  - critical
  - locked
- Interaction states:
  - default
  - pressed
  - selected
  - disabled
  - loading

## Inspiration Translation
- Use the inspiration folder’s soft gradient atmospherics as controlled accent backplates
- Use the clean finance-style card stacking for data clarity
- Avoid generic SEO SaaS monochrome dashboards; mobile surfaces should feel curated and premium
- Keep authentication/settings screens visually related to the analytical system, not a separate template style

## Freeze Criteria
- Tokens can be implemented in theme classes without ambiguity
- Patterns are reusable across at least two modules
- No visual decision remains dependent on one final screen mock
