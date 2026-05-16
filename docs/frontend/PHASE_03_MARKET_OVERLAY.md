# Phase 3: Market Overlay

## Objective
Apply market truth from `MARKET_RESEARCH_PLAYSTORE.md` and `MASTER BUILD SPEC.md` to the frozen archetypes and behaviour layer before pattern assembly.

## Market Inputs
- fragmented mobile SEO/ASO tooling
- shallow utility-first products
- desktop dependency
- weak actionability
- weak workflow cohesion
- stale-data trust concerns
- missing prioritization
- poor SMB / indie positioning

## Required Overlay Rules
- Every major surface must feel unified, not like a loose tool bundle.
- Every data block must communicate what to do next.
- Trust cues must be visible:
  - freshness
  - source
  - confidence where relevant
- Mobile screens must support operational work, not quick-check-only usage.
- Language must stay simple and action-first for SMB / indie users.

## UI Implications
- dashboard must summarize cross-module work, not just show module tiles
- keyword and rank screens must show action framing, not raw lists
- content and review screens must cluster findings into insight-to-action blocks
- settings must reinforce source trust and sync clarity
- gated modules must show future workflow value without looking fake or absent

## Required Deliverables
- market overlay notes per archetype
- list of trust cues by screen family
- actionability rules for each active module screen
- anti-pattern list for shallow-tool behavior

## Anti-Patterns
- metric dump without explanation
- utility grid as the main experience
- screen that stops at ranking visualization
- mobile screen that clearly expects desktop follow-up to become usable

## Completion Criteria
- each active surface has an explicit market-alignment note
- trust cues are defined, not implied
- shallow mobile-tool patterns are explicitly rejected in the phase output

## Current Frontend Closure Notes
- Active screens now expose trust cues through shared trust bars:
  - source
  - freshness
  - confidence
- Dashboard, keywords, ranks, content, reviews, and settings all show action-first framing plus trust-signal visibility
- The frontend now resists shallow mobile-tool behavior more explicitly by keeping source and trust context near decision surfaces
