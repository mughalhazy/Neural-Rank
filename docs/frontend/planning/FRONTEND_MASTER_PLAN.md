# Frontend Master Plan

## Goal
Build a Flutter-first UI system for Neural Rank that follows `SYSTEMATIC_UI_ARCHITECTURE.md`, honors `MASTER_BUILD_SPEC.md`, and `MARKET_RESEARCH_PLAYSTORE.md`, and uses the backend module boundaries as the product surface contract.

## Product Surface
- Active MVP modules:
  - Review Analysis
  - Content / Listing Insights
  - Keyword Analysis
  - Rank Tracking
- Built but gated modules (Phase 1 expansion, backend_active):
  - Competitor Analysis
  - Optimization Layer
  - Creative / Messaging Layer
  - Unified Workflow Layer
- Backend-ready, frontend Phase 2 (backend_active, no frontend screens yet):
  - Technical SEO Audit
  - On-Page SEO Scorer
  - Backlink Intelligence
  - E-E-A-T Signals
  - Search Intent Classifier
  - SERP Feature Analyzer
  - Topical Authority
  - Site Architecture
  - Analytics Integration
- Backend-ready, opt-in only (frontend Phase 2, requires explicit activation):
  - Local SEO

## Frontend Principles
- Build by system layer, not polished screen first.
- Preserve a single design system for Android now and web later.
- Keep UI logic, state shape, and module gating explicit.
- Represent all modules in architecture now, expose only MVP-active modules by default.
- Turn every major data view into `insight -> priority -> action`, never raw data only.

## Phase Sequence
1. Archetypes and module mapping
2. Behaviour and market overlay
3. Market overlay
4. Inspiration pattern extraction
5. Pattern extraction checklist
6. Pattern library
7. Design language
8. Design system
9. SVG icon layer
10. Component system
11. Archetype assembly
12. Iteration passes
13. Implementation sequence and validation gates

## Phase Anchor Index
- See `docs/frontend/planning/FRONTEND_PHASE_INDEX.md`

## Initial Deliverables
- `ui/` Flutter UI prototype (design archetype layer)
- Phase docs in `docs/frontend/`
- Design tokens and app theme
- Reusable primitives and pattern widgets
- MVP screens:
  - dashboard
  - keyword
  - rank
  - content
  - review
  - settings
- Gated placeholders for full-suite modules

## Design Direction
- Premium minimal mobile product
- Light-first, calm, and feature-led
- Parent module pages should stay simple
- Capability depth should move into archetype subpages
- SVG component icons should be used subtly to improve scanning
- Avoid dense dashboard composition on parent pages

## Dependency Policy
- Default to Flutter SDK packages only
- Add third-party packages only if the UI system materially requires them
- No speculative state-management, charting, SVG, or animation packages unless Flutter core is insufficient

## Current Closure State
- Current UI baseline is defined in `CURRENT_UI_BASELINE.md`.
- Parent pages are simplified commercial module overviews.
- Design language and design system have been overhauled to match premium-minimal inspiration direction.
- Next planned layer: capability-driven archetype subpages.
