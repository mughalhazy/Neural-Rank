# Backend Schema / Repository Alignment

> This document supersedes BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_REPORT.md and BACKEND_SCHEMA_REPOSITORY_ALIGNMENT_PHASE2.md

Last updated: 2026-05-17

---

## Overview

This document consolidates the full schema/repository alignment history for Neural Rank's backend. It covers:

- **Phase 1 (2026-05-06):** Alignment of the original 8 module repositories against the foundation migration. Systemic field-name mismatches were discovered and fixed without requiring a schema migration.
- **Phase 2 (2026-05-16):** Alignment audit of the 10 new module repositories added during the SEO OS expansion (2026-05-15). All 10 repositories were confirmed clean — no deviations found.

---

## Phase 1 — Original 8 Modules (2026-05-06)

### Scope

- Audited all backend module repository files present at 2026-05-06
- Compared repository SQL field usage against `supabase/migrations/20260422020600_backend_foundation.sql`
- Aligned repository writes to the existing schema without altering migration DDL
- Added persistence-path verification coverage

### Findings

The mismatch was systemic across all eight module repositories. Repository code was writing fields not present in the schema:

| Repository field (wrong) | Schema field (correct) |
|--------------------------|----------------------|
| `target_ref` | `canonical_ref` |
| `target_type` | `target_kind` |
| `product_target_id` | `target_id` |
| `module_key` | *(not in schema — removed)* |
| `action_payload` | `actions_payload` |

No migration was required. Alignment was resolved in repository code.

### Implementation

Shared persistence helper added:
- `backend/src/core/persistence.js`

Repository files aligned:
- `backend/src/modules/review-analysis/repository.js`
- `backend/src/modules/content-listing-insights/repository.js`
- `backend/src/modules/keyword-analysis/repository.js`
- `backend/src/modules/rank-tracking/repository.js`
- `backend/src/modules/competitor-analysis/repository.js`
- `backend/src/modules/optimization-layer/repository.js`
- `backend/src/modules/creative-messaging-layer/repository.js`
- `backend/src/modules/unified-workflow-layer/repository.js`

`priorityPayload` was also threaded into persistence calls so persisted priority data matches runtime output.

### Field Alignment Result

- `canonical_ref` now replaces `target_ref` in all repository writes
- `target_kind` now replaces `target_type` in all repository writes
- `target_id` now replaces `product_target_id` in all repository writes
- `module_key` is no longer written into run record tables (field does not exist in schema)
- `actions_payload` is now written with the correct schema name
- `priority_payload` now stores actual priority payload instead of duplicating actions by default

### Verification

| Test | File | Result |
|------|------|--------|
| Persistence alignment | `backend/src/persistence-alignment.test.js` | PASS |
| Full backend validation | `backend/src/full-backend-validation.test.js` | PASS |

### Acceptance Status

- No repository writes fields missing from schema: `PASS`
- No schema fields required by runtime are missing: `PASS`
- Backend can write module results without SQL field-name mismatch: `PASS`

---

## Phase 2 — SEO OS Expansion Modules (2026-05-16)

### Scope

- 10 new module repositories added during the SEO OS expansion (2026-05-15)
- Sources: `backend/src/modules/*/repository.js`, `supabase/migrations/20260516120000_seo_os_expansion_modules.sql`, `backend/src/core/persistence.js`

### Shared Factory Pattern

All 10 new repositories use the shared factory defined in `src/core/persistence.js`:

```js
createPostgresModuleRunRepository({ recordsTable, query })
```

The factory's `saveRun()` method executes exactly two queries in sequence:

**Query 1 — Upsert product target:**
```sql
INSERT INTO app_public.product_targets (target_kind, canonical_ref)
VALUES ($1, $2)
ON CONFLICT (target_kind, canonical_ref)
DO UPDATE SET updated_at = now()
RETURNING id
```

**Query 2 — Insert module run record:**
```sql
INSERT INTO app_public.${recordsTable} (
  target_id, integration_state, input_payload, analysis_payload,
  insights_payload, priority_payload, actions_payload, processing_status
) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8)
RETURNING id
```

All 10 repositories delegate to this factory without modification.

### Per-Module Alignment Check

#### technical_seo_audit

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "technical_seo_audit_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.technical_seo_audit_records` | `CREATE TABLE IF NOT EXISTS app_public.technical_seo_audit_records` | PASS |
| Column alignment | target_id, integration_state, input_payload, analysis_payload, insights_payload, priority_payload, actions_payload, processing_status | All 8 columns + id, created_at, updated_at present in migration | PASS |

No deviations.

#### on_page_seo_scorer

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "on_page_seo_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.on_page_seo_records` | `CREATE TABLE IF NOT EXISTS app_public.on_page_seo_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

#### backlink_intelligence

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "backlink_intelligence_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.backlink_intelligence_records` | `CREATE TABLE IF NOT EXISTS app_public.backlink_intelligence_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

#### eeat_signals

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "eeat_signal_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.eeat_signal_records` | `CREATE TABLE IF NOT EXISTS app_public.eeat_signal_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

Note: The module key is `eeat_signals` (plural) but the table name is `eeat_signal_records` (singular). This is intentional and consistent between repository and migration. No mismatch.

#### search_intent_classifier

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "search_intent_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.search_intent_records` | `CREATE TABLE IF NOT EXISTS app_public.search_intent_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

#### serp_feature_analyzer

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "serp_feature_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.serp_feature_records` | `CREATE TABLE IF NOT EXISTS app_public.serp_feature_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

#### topical_authority

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "topical_authority_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.topical_authority_records` | `CREATE TABLE IF NOT EXISTS app_public.topical_authority_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

#### site_architecture

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "site_architecture_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.site_architecture_records` | `CREATE TABLE IF NOT EXISTS app_public.site_architecture_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

#### analytics_integration

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "analytics_integration_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.analytics_integration_records` | `CREATE TABLE IF NOT EXISTS app_public.analytics_integration_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

#### local_seo

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "local_seo_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.local_seo_records` | `CREATE TABLE IF NOT EXISTS app_public.local_seo_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

### Summary Table

| Module | recordsTable (repository) | Table in migration | Aligned |
|--------|--------------------------|-------------------|---------|
| technical_seo_audit | `technical_seo_audit_records` | `technical_seo_audit_records` | YES |
| on_page_seo_scorer | `on_page_seo_records` | `on_page_seo_records` | YES |
| backlink_intelligence | `backlink_intelligence_records` | `backlink_intelligence_records` | YES |
| eeat_signals | `eeat_signal_records` | `eeat_signal_records` | YES |
| search_intent_classifier | `search_intent_records` | `search_intent_records` | YES |
| serp_feature_analyzer | `serp_feature_records` | `serp_feature_records` | YES |
| topical_authority | `topical_authority_records` | `topical_authority_records` | YES |
| site_architecture | `site_architecture_records` | `site_architecture_records` | YES |
| analytics_integration | `analytics_integration_records` | `analytics_integration_records` | YES |
| local_seo | `local_seo_records` | `local_seo_records` | YES |

**10/10 aligned. No deviations.**

### Migration Coverage Check

The migration `20260516120000_seo_os_expansion_modules.sql` also:

1. Expands the `initial_state` check constraint on `backend_module_catalog` to include `'backend_active'` — required because all 10 new modules use this value.
2. Registers all 10 modules in `app_public.backend_module_catalog` with `initial_state = 'backend_active'`.
3. Inserts activation defaults into `app_public.backend_module_activation_defaults`: 9 modules `is_active = true`, `local_seo` with `is_active = false`. This matches `activation.js`.
4. Creates `updated_at` triggers for all 10 new tables using the shared `app_public.set_updated_at()` function.

All four migration concerns are consistent with the runtime code.

### Findings

No schema alignment issues found. All 10 repositories are correctly configured and match the migration DDL exactly.

---

## Combined Status

| Phase | Modules Checked | Issues Found | Resolution |
|-------|----------------|--------------|------------|
| Phase 1 (2026-05-06) | 8 original modules | Systemic field-name mismatches (5 field renames) | Fixed in repository code; no migration required |
| Phase 2 (2026-05-16) | 10 expansion modules | None | All aligned via shared factory from the start |
| **Total** | **18 modules** | — | **All repositories aligned to schema** |
