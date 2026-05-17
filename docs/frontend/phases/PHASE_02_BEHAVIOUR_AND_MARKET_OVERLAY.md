# Phase 2: Behaviour And Market Overlay

## Objective
Attach user intent, state logic, and market expectations to each archetype before visual implementation.

## Global Behaviour Rules
- Convert data into insight
- Convert insight into action
- Prioritize outputs
- Avoid overload
- Highlight highest-impact item
- Support loading, success, empty, and error states consistently

## Cross-Screen Behaviour Model
- Top strip: context and target selection
- Hero section: highest-impact insight
- Insight body: grouped evidence and changes
- Action rail: prioritized next steps
- Supporting data: compact, secondary, collapsible where possible

## Archetype Behaviour Overlays

### Dashboard
- User intent: know what matters now
- Primary actions: inspect top opportunity, switch module, resume pending work
- Secondary actions: scan health, review alerts, change target
- Core states: no target, syncing, healthy, risk detected, stale data

### Table + Trend
- User intent: identify movement and opportunity fast
- Primary actions: sort, filter, inspect item, act on highest-priority row
- Secondary actions: segment by category, compare period, bookmark item
- Core states: filtered empty, trend unavailable, stale rank, mixed movement

### Analysis Feed
- User intent: understand why a problem exists and what to do next
- Primary actions: review insight cluster, accept action, dismiss low-value noise
- Secondary actions: switch severity, inspect supporting evidence
- Core states: no content, weak signal, strong signal, action ready

### Configuration
- User intent: connect sources and keep trust high
- Primary actions: set target, connect data source, manage notification and display preferences
- Secondary actions: view sync status, inspect permissions
- Core states: disconnected, partially configured, fully configured, sync failure

### Gated Expansion
- User intent: understand future value without confusion about availability
- Primary actions: learn what unlocks later
- Secondary actions: preview capability scope
- Core states: locked, preview, scheduled for rollout

## Market Overlay Decisions
- Avoid shallow mobile utility feel by showing unified cross-module flow on home
- Avoid raw metric dumps by pairing each data block with an interpretation label
- Improve trust by showing sync freshness, source, and confidence cues
- Improve actionability by pinning a recommended next step above secondary metrics
- Respect mobile expectations with fast scan surfaces, sticky filters, and clear back paths
- Position for SMB and indie users through simple language and focused action blocks instead of enterprise jargon

## Freeze Criteria
- Every active screen has one dominant action path
- Every state has a designed empty/error/loading treatment
- Every data-heavy surface has an explicit insight and action layer

## Current Frontend Closure Notes
- Reusable state model added in `frontend/lib/core/models/view_state.dart`
- Shared state host added in `frontend/lib/shared/components/pattern_blocks.dart`
- Active screens now render through consistent state-aware composition:
  - dashboard
  - keyword
  - rank
  - content
  - review
  - settings
- Loading, empty, error, and success rendering paths now exist as reusable system behavior
