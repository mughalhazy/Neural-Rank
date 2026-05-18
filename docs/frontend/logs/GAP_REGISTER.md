# Frontend Gap Register

## Purpose
Record the implementation gaps found by overlaying:
- `docs/product/SYSTEMATIC_UI_ARCHITECTURE.md`
- `docs/product/MASTER_BUILD_SPEC.md`
- `docs/product/archive/MARKET_RESEARCH_PLAYSTORE.md`
- `docs/frontend/**/*.md`

against the current frontend code in `ui/lib`.

This register is the authority for pre-polish remediation. No refinement or polish pass should proceed until the structural gaps marked `Critical` and `High` are resolved or explicitly deferred.

## Audit Scope
- Frontend docs:
  - `docs/frontend/planning/FRONTEND_MASTER_PLAN.md`
  - `docs/frontend/phases/PHASE_01_ARCHETYPES_AND_MAPPING.md`
  - `docs/frontend/phases/PHASE_02_BEHAVIOUR_AND_MARKET_OVERLAY.md`
  - `docs/frontend/phases/PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md`
  - `docs/frontend/phases/PHASE_04_IMPLEMENTATION_BLUEPRINT.md`
- Frontend code:
  - `ui/lib/app`
  - `ui/lib/core`
  - `ui/lib/shared`
  - `ui/lib/features`
  - `ui/lib/demo_data`

## Current Frontend Baseline
- Flutter scaffold exists
- MVP-active screens exist:
  - dashboard
  - keyword
  - rank
  - content
  - review
  - settings
- Reusable primitives exist:
  - shell
  - theme
  - metric cards
  - priority hero
  - insight cards
  - action queue
  - trend blocks
  - locked previews
- Validation status:
  - `dart analyze lib test` passed
  - `flutter test` passed

## Gap Register

### GAP-001
- Title: Dedicated SVG icon layer not implemented
- Severity: Critical
- Source authority:
  - `SYSTEMATIC_UI_ARCHITECTURE.md`
  - `MASTER BUILD SPEC.md`
- Requirement:
  - Build a separate component-based SVG icon layer
  - Keep iconography systematic and reusable
  - Implement icon layer before components and screens
- Current state:
  - SVG asset set exists under `ui/assets/icons`
  - Shared icon wrapper exists under `ui/lib/shared/icons`
  - Shared UI surfaces now use the icon wrapper instead of ad hoc raw icons
- Evidence:
  - `ui/lib/shared/widgets/app_shell.dart`
  - `ui/lib/shared/widgets/sections.dart`
- Risk:
  - Violates required build order
  - Weakens system consistency
  - Makes later brand-specific icon direction harder to enforce
- Required remediation:
  - Add a frontend icon system
  - Define icon primitives, sizing rules, and wrappers
  - Replace direct Material icon usage in reusable UI components
- Status: Resolved

### GAP-002
- Title: Full module surface is not present as explicit frontend feature modules
- Severity: Critical
- Source authority:
  - `MASTER BUILD SPEC.md`
  - `PHASE_01_ARCHETYPES_AND_MAPPING.md`
  - `PHASE_04_IMPLEMENTATION_BLUEPRINT.md`
- Requirement:
  - All product modules must exist in the codebase now
  - Inactive modules must be built but gated, not omitted
- Current state:
  - Explicit feature surfaces now exist for:
    - competitor analysis
    - optimization layer
    - creative / messaging layer
    - unified workflow layer
  - Gated modules are indexed under `features/gated_modules`
  - Activation metadata in `core` points to those module surfaces directly
- Evidence:
  - `ui/lib/features`
  - `ui/lib/features/gated_modules/gated_modules_index.dart`
  - `ui/lib/core/models/module_registry.dart`
- Risk:
  - Frontend architecture does not yet mirror backend module boundaries
  - Later activation would require feature creation rather than activation
- Required remediation:
  - Create explicit feature areas for all gated modules
  - Add module-level placeholder screens and composition scaffolds
- Status: Resolved

### GAP-003
- Title: Unified workflow layer is missing even as a gated preview
- Severity: High
- Source authority:
  - `MASTER BUILD SPEC.md`
  - `PHASE_01_ARCHETYPES_AND_MAPPING.md`
- Requirement:
  - Unified workflow layer must exist as a bounded module
  - It should be present but gated in MVP
- Current state:
  - Unified workflow preview data exists
  - Unified workflow feature scaffold exists in the frontend codebase
- Evidence:
  - `ui/lib/demo_data/app_demo_data.dart`
- Risk:
  - Product surface is incomplete
  - The app underrepresents the intended operating-system positioning
- Required remediation:
  - Add unified workflow preview data
  - Add a dedicated gated workflow feature screen
- Status: Resolved

### GAP-004
- Title: Explicit activation and gating model not implemented in frontend architecture
- Severity: Critical
- Source authority:
  - `MASTER BUILD SPEC.md`
  - `FRONTEND_MASTER_PLAN.md`
  - `PHASE_04_IMPLEMENTATION_BLUEPRINT.md`
- Requirement:
  - Activation boundaries must be explicit
  - UI logic, state shape, and module gating must be explicit
- Current state:
  - Explicit module registry exists in `ui/lib/core/models/module_registry.dart`
  - Active navigation is derived from module metadata
  - Gated modules are represented explicitly in the registry
- Evidence:
  - `ui/lib/app/app.dart`
  - `ui/lib/shared/widgets/app_shell.dart`
  - `ui/lib/core/models/ui_models.dart`
- Risk:
  - Gating is representational only
  - Future activation may require structural rewrite
- Required remediation:
  - Add module definitions and activation state in `core`
  - Route and navigation composition should derive from activation metadata
- Status: Resolved

### GAP-005
- Title: Archetype implementation is incomplete
- Severity: High
- Source authority:
  - `SYSTEMATIC_UI_ARCHITECTURE.md`
  - `PHASE_01_ARCHETYPES_AND_MAPPING.md`
- Requirement:
  - Archetypes should be frozen and implemented as reusable structures
  - Defined archetypes include:
    - dashboard
    - analysis feed
    - table + trend
    - detail drilldown
    - configuration
    - gated expansion
- Current state:
  - Dedicated drilldown scaffold exists
  - Gated competitor and workflow feature scaffolds exist
- Evidence:
  - `ui/lib/features`
  - `ui/lib/shared/widgets/sections.dart`
- Risk:
  - Product composition remains partial
  - Future deep-inspection flows have no scaffold
- Required remediation:
  - Add a drilldown scaffold
  - Add reusable gated-expansion screen scaffold
- Status: Resolved

### GAP-006
- Title: State system is missing loading, empty, error, and transition handling
- Severity: Critical
- Source authority:
  - `MASTER_BEHAVIOUR_DOC.md`
  - `PHASE_02_BEHAVIOUR_AND_MARKET_OVERLAY.md`
  - `PHASE_04_IMPLEMENTATION_BLUEPRINT.md`
- Requirement:
  - Support loading, success, empty, and error states consistently
  - Define state transitions per archetype
- Current state:
  - Shared state config model exists
  - Shared state host exists
  - Active screens now render through success/loading/empty/error composition paths
- Evidence:
  - `ui/lib/features/*`
  - `ui/lib/shared/widgets/sections.dart`
- Risk:
  - Behaviour doc is not implemented
  - UI is closer to a mock shell than a resilient product surface
- Required remediation:
  - Add reusable state surfaces
  - Add per-screen state composition
  - Model transitions between disconnected/loading/loaded/error states
- Status: Resolved

### GAP-007
- Title: Missing reusable pattern components required by the roadmap
- Severity: High
- Source authority:
  - `SYSTEMATIC_UI_ARCHITECTURE.md`
  - `PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md`
- Requirement:
  - Pattern library should cover:
    - keyword tables
    - ranking charts
    - review clusters
    - competitor comparison blocks
    - insight cards
    - filters
    - action panels
    - alerts / notifications
- Current state:
  - Implemented:
    - command header
    - metric rail
    - priority hero
    - insight cards
    - action queue
    - trend table
    - locked previews
    - filter pattern
    - alert pattern
    - competitor comparison block
    - review cluster block
- Evidence:
  - `ui/lib/shared/widgets/sections.dart`
- Risk:
  - Pattern library is incomplete
  - Future modules will reintroduce ad hoc UI
- Required remediation:
  - Add the missing reusable patterns before refinement
- Status: Resolved

### GAP-008
- Title: Component system is incomplete
- Severity: High
- Source authority:
  - `SYSTEMATIC_UI_ARCHITECTURE.md`
- Requirement:
  - Reusable component system should include:
    - cards
    - tables
    - filters
    - chart containers
    - insight blocks
    - alerts
    - buttons
    - inputs
    - navigation items
- Current state:
  - Cards, tables, filters, chart containers, insight blocks, alerts, buttons, inputs, and navigation items now exist across `shared/widgets` and `shared/components`
- Evidence:
  - `ui/lib/shared/widgets/sections.dart`
  - `ui/lib/shared/widgets/app_shell.dart`
- Risk:
  - Settings and future onboarding/integration flows cannot scale cleanly
  - Input-heavy surfaces will likely drift from the system
- Required remediation:
  - Add reusable input, filter, alert, and navigation-item primitives
- Status: Resolved

### GAP-009
- Title: Frontend build order diverged from the systematic architecture
- Severity: High
- Source authority:
  - `SYSTEMATIC_UI_ARCHITECTURE.md`
- Requirement:
  - Build in order:
    - SVG icon layer first
    - components second
    - archetype screens third
    - product screens last
- Current state:
  - Historical drift did occur during the first MVP shell pass
  - The codebase now contains the missing foundational layers:
    - SVG icon layer
    - shared components
    - archetype scaffolds
    - state system
    - operational flow framing
- Evidence:
  - `ui/assets/icons`
  - `ui/lib/shared/icons`
  - `ui/lib/shared/components`
  - `ui/lib/features`
- Risk:
  - Rework required during remediation
- Required remediation:
  - Backfill missing foundational layers before polishing screens
- Status: Resolved

### GAP-010
- Title: Input -> analysis -> insight -> priority -> action flow is only represented rhetorically
- Severity: High
- Source authority:
  - `MASTER BUILD SPEC.md`
  - `MASTER_BEHAVIOUR_DOC.md`
  - `FRONTEND_MASTER_PLAN.md`
- Requirement:
  - Major surfaces must express the full operational flow
- Current state:
  - Shared operational flow component now exists
  - Active screens and gated execution screens now render the five-stage flow explicitly
  - Workflow depth is visible in dashboard, keywords, ranks, content, reviews, optimization, creative, and workflow surfaces
- Evidence:
  - `ui/lib/shared/components/flow_blocks.dart`
  - `ui/lib/features/*`
- Risk:
  - Product may still read as a dashboard shell rather than an operational workflow system
- Required remediation:
  - Add explicit flow framing in screen composition and data models
- Status: Resolved

### GAP-011
- Title: Trust cues are only partially implemented
- Severity: Medium
- Source authority:
  - `MARKET_RESEARCH_PLAYSTORE.md`
  - `PHASE_02_BEHAVIOUR_AND_MARKET_OVERLAY.md`
- Requirement:
  - Improve trust with freshness, source, and confidence cues
- Current state:
  - Freshness, source, and confidence are now surfaced through shared trust bars on active screens
- Evidence:
  - `ui/lib/shared/widgets/sections.dart`
  - `ui/lib/features/settings/settings_screen.dart`
- Risk:
  - Market pain around stale data and trust is only partly addressed
- Required remediation:
  - Add source badges, confidence labels, and stale-state UI treatments
- Status: Resolved

### GAP-012
- Title: Mobile operational depth remains partial
- Severity: Medium
- Source authority:
  - `MARKET_RESEARCH_PLAYSTORE.md`
- Requirement:
  - The UI should counter shallow mobile-tool patterns with operational depth
- Current state:
  - Home and module screens are action-oriented
  - Drilldown, workflow, optimization, and creative continuation surfaces now exist
  - Active screens now show explicit operational flow instead of static insight-only cards
- Evidence:
  - `ui/lib/features/*`
  - `ui/lib/shared/components/flow_blocks.dart`
- Risk:
  - The app still risks feeling like a polished preview instead of a mobile operating surface
- Required remediation:
  - Add drilldown and workflow continuation experiences
- Status: Resolved

### GAP-013
- Title: Frontend implementation blueprint not fully realized in folder structure
- Severity: Medium
- Source authority:
  - `PHASE_04_IMPLEMENTATION_BLUEPRINT.md`
- Requirement:
  - Planned architecture includes `features/gated_modules`
  - `core` should hold module gating and app constants
- Current state:
  - `features/gated_modules` now exists as an explicit index boundary
  - `core` now holds module constants and module registry metadata
- Evidence:
  - `ui/lib/features/gated_modules/gated_modules_index.dart`
  - `ui/lib/core/constants/module_constants.dart`
  - `ui/lib/core/models/module_registry.dart`
- Risk:
  - Planned architecture and actual code are diverging
- Required remediation:
  - Add the missing folder/module areas and move gating concerns into `core`
- Status: Resolved

### GAP-014
- Title: Inspiration extraction was translated visually, but not governed formally
- Severity: Medium
- Source authority:
  - `SYSTEMATIC_UI_ARCHITECTURE.md`
  - `PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md`
- Requirement:
  - Patterns extracted from inspiration should be formalized with usage governance
  - Pattern extraction checklist should define:
    - pattern name
    - purpose
    - where used
    - structure
    - behaviour notes
    - allowed variants
    - anti-patterns
- Current state:
  - Inspiration extraction records now exist
  - Pattern checklist records now include allowed variants and anti-patterns for implemented patterns
- Evidence:
  - `docs/frontend/phases/PHASE_03_PATTERNS_LANGUAGE_AND_SYSTEM.md`
- Risk:
  - Pattern reuse may drift during later implementation
- Required remediation:
  - Expand the pattern register with governance fields per pattern
- Status: Resolved

### GAP-015
- Title: Iteration and polish passes have not been executed as discrete layers
- Severity: Medium
- Source authority:
  - `SYSTEMATIC_UI_ARCHITECTURE.md`
- Requirement:
  - Iteration must happen in ordered passes:
    - structural refinement
    - hierarchy refinement
    - design language application
    - design system enforcement
    - density / clarity tuning
    - polish
- Current state:
  - Pass execution framework now exists
  - Readiness rules are defined in the phase anchor
  - A dedicated pass log template exists for later execution
- Evidence:
  - `docs/frontend/phases/PHASE_12_ITERATION_PASSES.md`
  - `docs/frontend/logs/ITERATION_PASS_LOG.md`
- Risk:
  - Refinement could become ad hoc without architectural checkpoints
- Required remediation:
  - Create a pass-by-pass execution checklist before refinement
- Status: Resolved

## What Is Already Aligned
- Flutter is used as the frontend layer
- Lean dependency policy was respected
- MVP-active surfaces exist
- UI is not a raw metric dump only
- Reusable shared primitives exist
- Full-suite intent is at least represented visually via gated previews
- The design direction broadly reflects the market and inspiration inputs

## Remediation Priority

### Priority 1
- GAP-001 SVG icon layer
- GAP-002 explicit module surface
- GAP-004 activation and gating model
- GAP-006 state system

### Priority 2
- GAP-003 unified workflow preview/module
- GAP-005 incomplete archetypes
- GAP-007 missing pattern components
- GAP-008 incomplete component system
- GAP-009 build-order backfill
- GAP-010 explicit operational flow representation

### Priority 3
- GAP-011 trust cues
- GAP-012 mobile operational depth
- GAP-013 folder-structure alignment
- GAP-014 pattern governance completeness
- GAP-015 formal iteration-pass register

## Final Gap Analysis
- The current frontend is a credible visual system prototype and MVP shell.
- It is not yet fully compliant with the governing docs line by line.
- The major misses are architectural rather than cosmetic.
- No polish pass should start yet.
- The next correct move is architectural remediation, then state/pattern completion, then controlled iteration passes.
