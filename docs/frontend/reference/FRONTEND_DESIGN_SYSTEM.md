# Phase 8: Design System

## Objective
Convert the premium-minimal design language into enforceable reusable implementation rules.

## Anchor
- `docs/frontend/phases/PHASE_04_INSPIRATION_VISUAL_AUDIT.md`
- `docs/frontend/reference/FRONTEND_DESIGN_LANGUAGE.md`

## Rule Categories
- typography
- spacing
- color
- layout
- sizing
- elevation
- interaction states

## System Direction
The system should optimize for:
- calm screens
- few visible components
- large readable hierarchy
- soft surfaces
- restrained accents

The system should not optimize for:
- high component variety on one page
- dense dashboards
- chip-heavy status communication
- dark-shell framing

## Typography Rules

### Heading System
- large screen title
- medium section or feature title
- quiet support copy

Typography should create hierarchy before color or borders do.

### Text Rules
- one strong headline per screen
- one short supporting sentence
- avoid paragraph stacks on parent screens
- label usage must be minimal

## Spacing Rules

### Outer Spacing
- parent screens need larger top and horizontal breathing room than the current implementation
- outer spacing should feel premium, not compressed

### Internal Spacing
- card padding should be visibly generous
- feature rows should have clean vertical separation
- section gaps should be wider than component gaps

### Density Rule
- if two blocks compete visually, one should move to a subpage

## Color Rules

### Base Canvas
- off-white or very soft cool neutral
- subtle tonal background shifts are allowed
- dark canvases are secondary, not default

### Accent Usage
- primary action blue
- optional restrained aqua/teal support
- semantic colors used only for true feedback states

### Contrast Rule
- text should carry contrast
- borders should not carry the full burden of separation

## Layout Rules

### Parent Screens
- header
- feature area
- optional short list

That is enough.

### Subpages
- may contain grouped lists, task stacks, detail panels, or evidence views
- still prefer one dominant block at a time

### Section Rule
- sections should be separated primarily by whitespace, not rails or hard dividers

## Card Rules

### Card Count
- minimize visible cards per viewport
- one strong card is better than many weak cards

### Card Surface
- light background
- soft shadow
- very soft border or no visible border
- moderate-to-large radius

### Nested Card Rule
- avoid card inside card
- if grouping is needed, use rows, spacing, or subtle bands

## Button Rules
- one strong primary button per active area
- large tap target
- filled accent button should feel confident, not loud
- secondary actions should be quiet text or soft-outline treatment

## Input Rules
- inputs should be large, soft, and calm
- visible noise around inputs should stay low
- fields should not carry heavy outlines

## Navigation Rules
- bottom navigation should be visually lighter than content
- active state should be clear but restrained
- navigation should not overpower the feature area

## Icon Rules
- small, clean, simple line icons
- icons are optional support, not decorative density
- icons must come from a reusable SVG component layer
- feature rows and short descriptive lists may use one icon per row when it improves recognition
- icon size, stroke, padding, and alignment should be tokenized through shared components
- do not mix unrelated icon families across the product
- avoid placing icons on every text fragment; use them only where they improve navigation, feature recognition, or row scanning

## Elevation Rules
- soft diffuse shadow
- low border contrast
- avoid layered glow effects on normal product surfaces

## Interaction State Rules
- default: calm and readable
- pressed: slight tonal shift
- selected: accent or tonal emphasis, not extra framing clutter
- disabled: softer contrast
- loading: lightweight and non-disruptive

## Component Reduction Rule
The following components should be deprioritized or reduced in parent screens:
- chips
- repeated alert strips
- process flow cards
- nested status containers
- metric rails that do not change the next action

## Preferred Parent Screen Components
- `CommandHeader` simplified
- one premium feature card or feature list
- clean list rows
- optional primary button

## Completion Criteria
- the system can produce calm premium screens consistently
- the design system favors whitespace and typography over framing
- parent screens are visually lighter than the current implementation
- shared components no longer pull the UI toward a dashboard-heavy feel
