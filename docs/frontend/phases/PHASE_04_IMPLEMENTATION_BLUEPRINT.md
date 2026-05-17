# Phase 4: Implementation Blueprint

## Objective
Translate the frozen UI system into a lean Flutter project structure.

## Folder Plan
- `frontend/lib/app`
- `frontend/lib/core`
- `frontend/lib/features`
- `frontend/lib/shared`
- `frontend/lib/demo_data`

## Flutter Architecture
- `app`: app shell, routes, navigation, app theme
- `core`: design tokens, constants, module gating, app models
- `shared`: reusable widgets, painters, icons, cards, chips, layout scaffolds
- `features/dashboard`
- `features/keywords`
- `features/rank_tracking`
- `features/content_insights`
- `features/review_analysis`
- `features/settings`
- `features/gated_modules`

## Current Alignment Status
- `core` now owns:
  - module constants
  - module registry / activation metadata
  - theme tokens
  - shared UI models
- `features/gated_modules` now exists as an index boundary for:
  - competitor analysis
  - optimization layer
  - creative / messaging layer
  - unified workflow layer
- explicit feature folders now exist for all required product-module surfaces, even when gated
- active screens assemble from shared icons, primitives, pattern blocks, and flow blocks instead of ad hoc screen-only composition

## Lean Implementation Rules
- Use Flutter Material 3 foundation
- Use local demo data to express the UI system first
- Avoid extra package installs unless Flutter core fails a concrete need
- Prefer custom painters and built-in widgets over dependency-heavy chart/icon packages

## MVP Build Order
1. App shell and navigation
2. Design tokens and theme extensions
3. Shared scaffolds and core cards
4. Priority hero, metric rail, action queue, trend table, insight cluster
5. MVP screens
6. Gated module previews
7. Loading, empty, and error states

## Validation Targets
- `flutter analyze`
- `flutter test` for basic widget smoke coverage
- Android emulator launch

## Done Criteria
- All required MVP surfaces render
- Full-suite modules are visibly gated, not missing
- UI system is reusable and aligned to roadmap phases
- actual folder structure matches the blueprint closely enough that activation no longer requires architectural invention
