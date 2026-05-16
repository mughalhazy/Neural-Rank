# Phase 1: Archetypes And Mapping

## Objective
Reduce the product into reusable screen archetypes before styling or detailed module composition.

## Backend-Derived Module Contract
- `review_analysis`
- `content_listing_insights`
- `keyword_analysis`
- `rank_tracking`
- `competitor_analysis`
- `optimization_layer`
- `creative_messaging_layer`
- `unified_workflow_layer`

## Core Archetypes

### 1. Dashboard Archetype
- Purpose: summarize system state, highest-priority work, and module health
- Inputs: cross-module insights, top actions, alerts, activation state
- Used for: home, workflow summary, executive overview

### 2. Analysis Feed Archetype
- Purpose: present interpreted findings, grouped evidence, and action paths
- Inputs: module summary, insight clusters, action queue
- Used for: review, content, creative, optimization

### 3. Table + Trend Archetype
- Purpose: combine sortable rows with compact trend context
- Inputs: keywords, ranks, deltas, statuses, action flags
- Used for: keyword, rank, competitor

### 4. Detail Drilldown Archetype
- Purpose: inspect one cluster, one keyword, one issue, or one recommendation in depth
- Inputs: selected entity, evidence, impact summary, actions
- Used for: keyword detail, review cluster detail, content issue detail

### 5. Configuration Archetype
- Purpose: manage data sources, target properties, preferences, and activation visibility
- Inputs: integration state, workspace settings, notification toggles
- Used for: settings, onboarding setup

### 6. Gated Expansion Archetype
- Purpose: show that modules exist architecturally while remaining inactive for MVP exposure
- Inputs: module metadata, value preview, locked status
- Used for: competitor, optimization, creative, workflow preview

## MVP Screen Mapping
- Dashboard -> Dashboard Archetype
- Keyword screen -> Table + Trend Archetype
- Rank screen -> Table + Trend Archetype
- Content screen -> Analysis Feed Archetype
- Review screen -> Analysis Feed Archetype
- Settings -> Configuration Archetype

## Full-Suite Mapping
- Competitor -> Table + Trend Archetype plus Gated Expansion wrapper
- Optimization -> Analysis Feed Archetype plus Gated Expansion wrapper
- Creative -> Analysis Feed Archetype plus Gated Expansion wrapper
- Workflow -> Dashboard Archetype plus Gated Expansion wrapper

## Freeze Criteria
- Every screen can be explained as an archetype composition
- Every module has an explicit activation treatment
- No one-off screen structures are introduced outside the archetype set
