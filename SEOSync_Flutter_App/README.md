# SEOSync

**Unified SEO Platform — Insight to Action**

A Flutter-first SEO/ASO operational platform built for Google Play, architected for future web app and client portal expansion.

## Product Positioning

- **Unified** — One platform for Web SEO + App Store SEO
- **Action-first** — Every data point converts to insight, every insight converts to action
- **Workflow-based** — Not a dashboard shell, but an operational system

## Architecture

### MVP Active Modules
- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking

### Full-Suite Modules (Built, Gated)
- Competitor Analysis
- Optimization Layer
- Creative / Messaging
- Unified Workflow Layer

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Flutter (Android → Web → Portal) |
| State Management | BLoC (flutter_bloc) |
| Navigation | go_router |
| Backend | Supabase-ready (MockRepository for MVP) |
| Local Storage | Hive |
| Charts | fl_chart |

## Design System

- **Light minimalistic premium enterprise grade**
- Systematic UI Architecture: archetypes, behaviour overlays, pattern library
- Inter + SpaceGrotesk typography
- Semantic color system with full dark mode support

## Primary Flow

```
INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION
```

## Behaviour Rules
1. Convert data → insight
2. Convert insight → action
3. Prioritize all outputs
4. Avoid overload
5. Highlight highest impact item

## Build for Play Store

```bash
flutter pub get
flutter build appbundle --release
```

The generated `.aab` file is ready for Google Play Console upload.

## Future Expansion

This codebase is architected from day 1 for:
- Web app (Flutter Web)
- Client portal (Flutter Web)
- Public marketing website (separate concern)

Zero structural rewrite required for expansion.

---

Built with precision. Ready for scale.
