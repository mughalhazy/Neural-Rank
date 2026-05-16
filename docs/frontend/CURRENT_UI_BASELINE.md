# Current UI Baseline

## Purpose
This document is the current source of truth for the frontend baseline.

Future sessions should assume this file overrides older visual assumptions where conflicts exist.

## Current Baseline Summary
The current UI is a premium-minimal light-first module shell.

Each module parent page currently contains:
- a distinct module header
- one-line module purpose
- a primary action button
- a commercial feature list
- unique feature icons tied to feature meaning

The current UI does **not** use parent pages for:
- backend detail
- dense evidence boards
- process flow explanation
- stacked operational sections
- raw data-heavy dashboard composition

Those belong to later archetype subpages.

## Current Visual Identity
- light-first canvas
- soft white cards
- calm spacing
- stronger typography
- restrained accent tones
- soft surface separation
- SVG component icons used subtly for scanning

## Parent Page Rules
- no generic `Features` heading
- feature name plus one-line description is sufficient
- each module page should have its own personality through:
  - header symbol
  - accent tone
  - wording
  - feature icon mix
- feature-row icons must represent the specific feature meaning, not repeat one module icon everywhere

## Current Module Baseline

### Dashboard
- page role: top-level command surface
- personality: blue strategic tone
- content: commercial growth-oriented summary features

### Review Analysis
- page role: trust and feedback surface
- personality: danger/trust tone
- content: complaints, requests, and review action features

### Content / Listing Insights
- page role: listing improvement surface
- personality: blue editorial tone
- content: rewrite and listing quality features

### Keyword Analysis
- page role: search opportunity surface
- personality: teal opportunity tone
- content: targeting and placement features

### Rank Tracking
- page role: movement and protection surface
- personality: warning/performance tone
- content: recovery, protection, and movement features

### Competitor Analysis
- page role: gap and response surface
- personality: warning rivalry tone
- content: competitor advantage and response features

### Optimization Layer
- page role: execution-ready fixes surface
- personality: blue execution tone
- content: fix-list and optimization task features

### Creative / Messaging
- page role: message and conversion surface
- personality: signal/creative tone
- content: screenshot and message improvement features

### Unified Workflow
- page role: orchestration surface
- personality: teal coordination tone
- content: queue and sequencing features

### Settings
- page role: readiness and setup surface
- personality: signal/setup tone
- content: trust, target, source, and activation features

## Current Technical Baseline
- theme direction has shifted from dark command-center to light premium-minimal
- navigation is lighter and calmer
- cards are softer and less outlined
- shared commercial feature rows now support icon-per-feature
- `CommandHeader` now supports per-screen symbol and tone
- `CommercialFeatureData` includes `iconKey`

## Current Intentional Simplicity
This baseline is intentionally simpler than the earlier UI iterations.

Reason:
- backend capabilities still need to be projected into archetype subpages
- parent pages should remain clean until subpages are introduced
- this avoids drift into noisy, over-explained screens

## Next Planned Layer
Next work should build:
- archetype subpages per module
- backend capability projection into those subpages
- feature-to-workflow mapping inside subpages

Without breaking the parent-page simplicity baseline defined here.
