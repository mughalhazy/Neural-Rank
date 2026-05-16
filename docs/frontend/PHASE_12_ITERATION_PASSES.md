# Phase 12: Iteration Passes

## Objective
Refine the frontend in controlled layers after the architecture stack is in place.

## Pass Order
1. structural refinement
2. hierarchy refinement
3. design language application
4. design system enforcement
5. density / clarity tuning
6. polish pass

## Pass Rules
- each pass should have explicit review notes
- later passes must not silently rewrite unresolved earlier-phase architecture
- polish cannot be used to hide missing structure

## Expected Evidence Per Pass
- what changed
- what was intentionally not changed
- what still blocks the next pass

## Pass Readiness Record
Before pass 1 begins, the following must already be true:
- foundational phases are closed
- module surfaces exist for active and gated product areas
- operational flow is visible in the active frontend
- gap register no longer contains unresolved structural blockers

## Review Log Template
Use this structure for every later pass review:

### Pass <n>: <name>
- Goal:
- Inputs reviewed:
- Structural changes made:
- Visual changes made:
- Intentionally unchanged:
- Remaining blockers:
- Approval status:

## Current Readiness
- pass execution framework is now established
- structural remediation is complete enough to permit later controlled refinement
- no pass should begin until the current gap register remains free of open structural blockers

## Pass 1 Focus
- normalize screen composition order across active and gated surfaces
- reduce structurally redundant one-off stacking
- group intake, evidence, and action layers consistently
- avoid hierarchy, density, or polish changes in this pass

## Pass 2 Focus
- improve scan order and decision clarity after structural grouping
- make section boundaries readable without changing screen architecture
- reduce visual competition from operational-flow cards
- make priority/action areas easier to identify quickly on mobile
- avoid design-language, density, or polish changes in this pass

## Pass 3 Focus
- apply the frozen design language across shared surfaces
- strengthen premium trust cues without changing structure
- align icon and accent usage with the SVG language
- make card/data surfaces feel like decision instruments, not generic dashboard blocks
- avoid density tuning, motion, or polish changes in this pass

## Pass 4 Focus
- enforce shared design-system tokens after the design language pass
- centralize reusable spacing, inset, opacity, radius, size, and state rules
- remove local styling drift from major shared components
- avoid changing screen structure, visual language direction, density, or motion in this pass

## Pass 5 Focus
- reduce vertical bloat on mobile without removing required operational context
- compact flow cards, section gaps, priority cards, insight cards, action queue items, review clusters, and competitor blocks
- keep the Pass 1 structure, Pass 2 hierarchy, Pass 3 language, and Pass 4 system tokens intact
- avoid motion, polish-only decoration, or navigation changes in this pass

## Pass 6 Focus
- resolve the boxed-in phone feeling by integrating surfaces closer to the device edges
- remove default component margins that create a second inner screen boundary
- blend bottom navigation into the canvas
- keep all prior structure, hierarchy, language, system tokens, and density decisions intact

## Pass 6B Edge Integration Correction
- triggered by mobile screenshots in `Design Inspiration/UI Screenshots`
- remove compound inset effects that make the UI feel like a framed panel inside the phone
- soften card boundaries and reduce the global screen gutter
- remove the section rail on mobile surfaces because it creates an artificial inner wall
- flatten nested flow stages from rounded boxes into rows with separators
- preserve all screen architecture, module logic, and required operational content

## Completion Criteria
- passes are executed in order
- each pass has a short review record
- the final polish pass happens only after structural and system gaps are closed
