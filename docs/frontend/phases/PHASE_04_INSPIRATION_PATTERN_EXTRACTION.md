# Phase 4: Inspiration Pattern Extraction

## Objective
Extract proven structural patterns from `Design Inspiration` and translate them into governed product patterns rather than loose styling references.

## Reference Inputs
- `Design Inspiration` image set

## Extraction Categories
- layout patterns
- navigation patterns
- table patterns
- chart patterns
- card patterns
- filter patterns
- insight / alert patterns

## Extraction Method
For each reference that influences the frontend:
1. identify the structural pattern
2. name the pattern
3. define why it is useful for Neural Rank
4. separate structure from decoration
5. note what must not be copied literally

## Initial Expected Outputs
- command-header pattern
- stacked decision-card layout
- bottom-navigation pattern for mobile
- compact trend-summary block
- emphasis-card pattern for highest-priority work
- soft-atmosphere background treatment

## Non-Goals
- copying finance/product screens literally
- importing unrelated auth-only ideas into analytics screens
- using inspiration as justification for decorative noise

## Completion Criteria
- inspiration influence is expressed as named patterns
- every reused pattern is traceable to a practical product need
- extracted patterns are ready to enter the pattern checklist phase

## Extraction Records

### Command Header
- Reference signal:
  - finance-style mobile hero/header compositions from `Design Inspiration`
- Practical use:
  - establish context, freshness, and primary action above data
- Structural borrow:
  - strong top anchor
  - one clear CTA
  - scanable status framing
- Not copied literally:
  - no consumer-fintech balance framing
  - no decorative-only top hero

### Atmospheric Backplate
- Reference signal:
  - soft gradient ambience in the inspiration screens
- Practical use:
  - premium analytical feel without flat enterprise monotony
- Structural borrow:
  - restrained glow behind the main content layer
- Not copied literally:
  - no pastel-heavy consumer palette
  - no decorative background dominating content

### Stacked Decision Cards
- Reference signal:
  - clean stacked card hierarchy from mobile product inspiration
- Practical use:
  - turn analytics into ordered operational blocks
- Structural borrow:
  - top-heavy hierarchy
  - rounded modular surfaces
  - strong containment of one decision area per block
- Not copied literally:
  - no generic template cloning

### Compact Trend Blocks
- Reference signal:
  - mobile chart summaries and compact movement blocks
- Practical use:
  - support keyword and rank movement inspection on small screens
- Structural borrow:
  - compact chart plus explanatory framing in one block
- Not copied literally:
  - no pure finance metaphor layer
  - no chart without action framing

### Bottom Navigation Pattern
- Reference signal:
  - clean mobile bottom-nav behavior in the inspiration set
- Practical use:
  - keep primary MVP modules reachable in one thumb zone
- Structural borrow:
  - minimal bottom-nav item framing
  - selected vs unselected emphasis
- Not copied literally:
  - no over-decorated tab chrome

### Input Panel Pattern
- Reference signal:
  - clean auth/settings field presentation in the inspiration set
- Practical use:
  - settings and target configuration should feel system-native, not a separate template
- Structural borrow:
  - strong field containment
  - lightweight supporting label above input surface
- Not copied literally:
  - no auth-template duplication into the product shell
