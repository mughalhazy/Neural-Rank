# Phase 9: SVG Icon Layer

## Objective
Build the iconography layer as its own system before continuing with downstream component refinement.

## Required Scope
- SVG icon set
- component-based usage
- consistent stroke/fill logic
- consistent sizing behavior
- reusable icon wrappers for UI components

## Required Frontend Outcomes
- icon asset strategy
- icon naming convention
- wrapper component API
- sizing tiers
- active / muted / warning / locked icon color behavior

## Rules
- direct ad hoc icon usage should be phased out
- icon wrappers should be used by nav items, cards, alerts, chips, and action controls
- icon style must match the design-language decisions

## Completion Criteria
- icon layer exists as a distinct frontend subsystem
- shared components no longer depend on arbitrary raw icon choices
- iconography is reusable across active and gated modules
