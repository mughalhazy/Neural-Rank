MASTER_PRODUCT_BUILD_SPEC.md

> **Status — 2026-05-17:** This spec was written for the original 8-module product definition. The backend now implements 18 modules (17 default-active + local_seo opt-in). For the current full technical specification, see [SEO-OS-Build-Plan.md](SEO-OS-Build-Plan.md). The core principles, behavior contract, and UI system authority in this document remain valid.

GOAL:
Define the master product build specification for a unified SEO platform that starts with Google Play delivery in Flutter, but is architected from day 1 for later expansion into:
- web app
- client portal
- website
with minimum tech change later.

---

PRODUCT TYPE:
Unified SEO Platform

COVERAGE:
- Web SEO
- App Store SEO / ASO

---

PRODUCT POSITIONING:
- unified SEO + ASO
- action-first
- workflow-based

This product must not behave like:
- a shallow utility bundle
- a rank checker only
- a dashboard-only analytics shell
- a raw data viewer

This product must behave like:
- an operational SEO system
- an insight-to-action platform
- a modular workflow product

---

CORE FUNCTION:
Enable users to:
- analyze SEO performance
- identify opportunities
- execute improvements

---

MARKET BASIS:
The product is grounded in the observed gaps discussed earlier:

- fragmented tool ecosystem
- shallow mobile tools
- desktop dependency
- weak actionability
- weak workflow cohesion
- missing unified reporting
- missing prioritization
- weak review intelligence
- weak creative optimization
- poor SMB / indie positioning

These gaps apply to the broader SEO opportunity, while Play Store signals were used as one concrete market signal base.

---

MASTER PRODUCT MODULES:

MODULE 1 — REVIEW ANALYSIS
Purpose:
- analyze review/customer feedback signals
- cluster complaints
- detect feature requests
- convert review data into insights and actions

---

MODULE 2 — CONTENT / LISTING INSIGHTS
Purpose:
- analyze content quality for SEO
- analyze listing quality for app stores
- convert observations into action-oriented outputs

---

MODULE 3 — KEYWORD ANALYSIS
Purpose:
- generate keyword suggestions
- identify keyword opportunities
- support prioritized SEO / ASO discovery

---

MODULE 4 — RANK TRACKING
Purpose:
- track keyword positions
- monitor changes
- surface actionable rank movement

---

MODULE 5 — COMPETITOR ANALYSIS
Purpose:
- track competitors
- compare signals
- identify gaps and opportunities

---

MODULE 6 — OPTIMIZATION LAYER
Purpose:
- produce content suggestions
- produce metadata improvement suggestions
- turn intelligence into execution guidance

---

MODULE 7 — CREATIVE / MESSAGING LAYER
Purpose:
- critique screenshot/content presentation
- generate messaging suggestions
- support conversion-oriented optimization

---

MODULE 8 — UNIFIED WORKFLOW LAYER
Purpose:
- combine all modules into one operating workflow
- centralize insight and action planning
- provide one product surface instead of fragmented tools

---

> **Note:** The above reflects the original 8-module MVP scope. The production backend implements 18 modules. See SEO-OS-Build-Plan.md for the complete module catalogue.

ROLLOUT STRATEGY:

BUILD STRATEGY:
- build all modules together now
- MVP modules are activated first
- full-suite modules are present but inactive / gated initially

This means:
- architecture must include all modules now
- module boundaries must exist now
- later activation must not require major structural rewrite

---

MVP ACTIVATION BOUNDARY:

MVP ACTIVE MODULES:
- Review Analysis
- Content / Listing Insights
- Keyword Analysis
- Rank Tracking

These are the initially activated capabilities.

---

FULL-SUITE MODULES BUILT BUT INACTIVE INITIALLY:
- Competitor Analysis (now default-active in production)
- Optimization Layer (now default-active in production)
- Creative / Messaging Layer (now default-active in production)
- Unified Workflow Layer beyond MVP activation (now default-active in production)

Inactive means:
- module exists in architecture
- module exists in codebase
- module may exist in UI/system composition
- module is gated from initial activation and user exposure

Inactive does not mean:
- omitted
- commented out
- fake shell only
- absent from architecture

---

PRIMARY SYSTEM FLOW:

INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION

This flow is mandatory across all modules.

The product must not stop at:
- input → raw data
- input → chart
- input → report without prioritization

The product must always aim to convert:
- data → insight
- insight → action

---

INPUT TYPES:
- website URL
- app URL
- keywords
- reviews
- competitor URLs / apps where relevant

---

OUTPUT TYPES:
- keyword insights
- ranking insights
- content insights
- review insights
- competitor insights
- optimization actions
- prioritized actions

---

CORE OUTPUT RULE:
System must output:
- insights
- prioritized actions

System must not output raw data without interpretation.

---

TECH STACK PRINCIPLE:
The stack must support:
1. Google Play app launch first
2. later web app expansion
3. later client portal expansion
4. later website expansion
with minimum tech changes later

---

RECOMMENDED PRODUCT STACK:

FRONTEND PRODUCT LAYER:
- Flutter

Use Flutter from day 1 for:
- Android app
- future web app
- future client portal

Reason:
- keep one UI technology
- preserve design system reuse
- preserve component reuse
- preserve domain/presentation reuse
- minimize future product-surface tech change

---

BACKEND / DATA LAYER:
- Supabase
- Postgres as source of truth

Use:
- Auth
- Database
- Storage
- Edge Functions only where needed

Reason:
- supports Flutter integration
- supports multi-surface expansion
- reduces early backend complexity
- preserves later expansion flexibility

---

WEBSITE EXPANSION PRINCIPLE:
The future public marketing website is a separate concern from the product app/client portal.

Current build priority:
- product architecture must not assume the marketing website is part of the same product surface

The product build should therefore optimize first for:
- app
- product web app
- client portal

not for public marketing-site concerns.

---

TECH STACK RULES:

RULE 1:
Build the product as Flutter-first, not Android-only.

RULE 2:
Do not make mobile-only architectural assumptions that block later web expansion.

RULE 3:
Keep business logic separated from UI.

RULE 4:
Keep platform-specific integrations abstracted where needed.

RULE 5:
Use modular architecture so future surfaces reuse the same core logic.

RULE 6:
Do not lock the product into a stack that forces a rewrite when expanding to web/client portal.

---

ARCHITECTURE REQUIREMENTS:

1. All modules must exist as explicit bounded modules.
2. Domain logic, data logic, and presentation logic must be separated.
3. Activation boundaries must be explicit.
4. Future module activation must not require major rewrite.
5. Product architecture must be scalable from day 1.
6. Shared primitives may be built where genuinely reused.
7. Avoid speculative enterprise complexity not discussed.

---

MODULE IMPLEMENTATION RULES:

For each module:
- input handling path must exist
- analysis path must exist
- insight generation path must exist
- action/prioritization path must exist

No module should be treated as complete if it only:
- displays raw data
- displays charts without interpretation
- acts as a static UI shell

---

UI SYSTEM AUTHORITY:
Use the Systematic UI Architecture as the UI source of truth.

UI must be built as:
- archetypes
- behaviour overlays
- pattern library
- design language
- design system
- component-based SVG icon layer
- reusable component system
- layered iteration and polish

UI must not be built as ad hoc one-off screens.

---

INITIAL ACTIVE UI SURFACES:
Only MVP-active modules should be exposed initially.

Initial active UI includes:
- dashboard / summary entry
- keyword screen
- rank screen
- content insight screen
- review insight screen
- required settings / configuration surface

---

BUILT BUT INACTIVE UI SURFACES:
- competitor analysis surfaces (now default-active in production)
- optimization layer surfaces (now default-active in production)
- creative / messaging surfaces (now default-active in production)
- unified workflow expansion surfaces (now default-active in production)

These must be architected and coded in a way that supports later activation.

---

BEHAVIOUR AUTHORITY:
Use the Master Behaviour Doc as behavioural source of truth.

Mandatory behavioural rules:
- always convert data → insight
- always convert insight → action
- always prioritize outputs
- avoid information overload
- highlight highest impact item
- do not output raw data without interpretation

---

QUALITY BAR:

The build must result in:
- scalable architecture
- explicit module boundaries
- explicit activation boundaries
- maintainable code
- reusable UI system
- reusable component system
- reusable icon system
- minimal coupling
- no fake dashboard-only progress
- no raw-data-only completion
- no drift outside defined product scope

---

DONE WHEN:

1. All product modules are present in the codebase.
2. MVP modules are activated by default.
3. Full-suite modules are built but inactive by default.
4. Product stack supports:
   - Android first
   - future web app
   - future client portal
   with minimum tech change later.
5. UI implementation aligns to the systematic UI architecture.
6. Behaviour aligns to the master behaviour rules.
7. Build can expand later without major structural rewrite.

---

NON-GOALS:

Do not:
- reduce product to ASO only
- reduce product to web SEO only
- reduce product to utility tools only
- collapse all modules into one vague dashboard
- expose inactive modules as if they are active
- build in a way that assumes rewrite later for web/client portal
- treat public marketing website needs as the primary driver of product architecture at this stage
