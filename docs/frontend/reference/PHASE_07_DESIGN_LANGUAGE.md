# Phase 7: Design Language

## Objective
Define a premium minimal visual language for the product based on direct inspiration-screen observation.

This phase replaces the earlier dark command-center drift.

## Anchor
- `docs/frontend/PHASE_04_INSPIRATION_VISUAL_AUDIT.md`

## Design Language Axes
- visual tone
- density level
- hierarchy style
- spacing character
- card treatment
- border/radius style
- shadow/elevation style
- icon style
- data-display feel
- trust/premium cues

## Frozen Design Language Decisions

### Visual Tone
- premium minimal
- calm
- modern
- product-led
- light-first

Not:
- tactical dashboard
- heavy command-center
- dark analytical shell

### Density Level
- low to medium density
- one clear focus area per screen
- information should be deferred into subpages rather than stacked on the parent page

### Hierarchy Style
- large title first
- one short supporting line second
- primary feature area third
- everything else secondary

### Spacing Character
- generous outer whitespace
- generous card padding
- obvious vertical rhythm between sections
- no cramped stacking

### Card Treatment
- soft sheets, not rigid panels
- cards should feel calm and light
- cards exist to isolate one feature or one grouped task only

### Border and Radius Style
- medium-large radius family
- borders are soft or nearly invisible
- avoid visible outline-heavy composition

### Shadow and Elevation Style
- soft elevation
- large blur, low contrast
- depth should feel atmospheric, not mechanical

### Icon Style
- simple, thin, modern icons
- icon usage is restrained
- icons support recognition but should not dominate the layout
- icons should come from a component-based SVG icon layer, not ad hoc per-screen shapes
- icons are most valuable when paired with feature rows, short descriptions, and navigation cues
- icons should improve scan speed and recognition, not add decoration

### Data-Display Feel
- feature-led, not dashboard-led
- the interface should show what the user can do, not how the system is structured
- visible data should be reduced to only what changes a decision

### Trust and Premium Cues
- whitespace
- typographic confidence
- visual calm
- consistency
- restrained accent use

## Palette Direction
- primary base: off-white, cloud grey, or very soft cool neutral
- primary accent: strong blue
- secondary accent: restrained aqua/teal only where justified
- dark mode should not be the primary design identity

## Parent Screen Language Rule
- one module
- one job
- one dominant feature area
- one-line supporting explanation

Parent screens should not explain system process, backend structure, or workflow mechanics in visible UI.

## Subpage Language Rule
Deeper detail belongs in archetype subpages, not on parent screens.

Subpages may carry:
- evidence
- filters
- lists
- actions
- supporting detail

But even subpages should remain minimal and focused.

## Mobile Canvas Rule
- the UI should feel native to the phone canvas
- avoid inner framed dashboards
- avoid stacked rails and repeated container walls
- let spacing and soft elevation create structure

## Anti-Language Rules
- no dark-heavy shell as default identity
- no chip-heavy composition
- no section-after-section explanation walls
- no “system process” aesthetic as the visible product personality
- no random icon mixing or inconsistent icon metaphors across modules

## Constraints
- must work on Android first
- must remain Flutter-friendly
- must support later web adaptation without changing the core visual language

## Completion Criteria
- the product reads as premium minimal, not dashboard-heavy
- hierarchy comes primarily from typography and whitespace
- parent screens are visually calm and feature-led
- subpages carry depth without cluttering parent screens
