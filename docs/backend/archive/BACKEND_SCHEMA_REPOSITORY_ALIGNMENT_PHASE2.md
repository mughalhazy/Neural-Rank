# Backend Schema / Repository Alignment — Phase 2

Date: 2026-05-16
Scope: 10 new module repositories added in the SEO OS expansion (2026-05-15)
Sources:
- Repository files: `backend/src/modules/*/repository.js`
- Migration: `supabase/migrations/20260516120000_seo_os_expansion_modules.sql`
- Persistence factory: `backend/src/core/persistence.js`

---

## Shared Factory Pattern

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

All 10 repositories delegate to this factory without modification. The `recordsTable` value in each repository determines which table Query 2 writes to.

---

## Per-Module Alignment Check

### technical_seo_audit

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "technical_seo_audit_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.technical_seo_audit_records` | `CREATE TABLE IF NOT EXISTS app_public.technical_seo_audit_records` | PASS |
| Column alignment | target_id, integration_state, input_payload, analysis_payload, insights_payload, priority_payload, actions_payload, processing_status | All 8 columns + id, created_at, updated_at present in migration | PASS |

No deviations.

---

### on_page_seo_scorer

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "on_page_seo_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.on_page_seo_records` | `CREATE TABLE IF NOT EXISTS app_public.on_page_seo_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

### backlink_intelligence

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "backlink_intelligence_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.backlink_intelligence_records` | `CREATE TABLE IF NOT EXISTS app_public.backlink_intelligence_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

### eeat_signals

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "eeat_signal_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.eeat_signal_records` | `CREATE TABLE IF NOT EXISTS app_public.eeat_signal_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

Note: The module key is `eeat_signals` (plural) but the table name is `eeat_signal_records` (singular). This is intentional and consistent between repository and migration — both use `eeat_signal_records`. No mismatch.

---

### search_intent_classifier

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "search_intent_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.search_intent_records` | `CREATE TABLE IF NOT EXISTS app_public.search_intent_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

### serp_feature_analyzer

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "serp_feature_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.serp_feature_records` | `CREATE TABLE IF NOT EXISTS app_public.serp_feature_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

### topical_authority

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "topical_authority_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.topical_authority_records` | `CREATE TABLE IF NOT EXISTS app_public.topical_authority_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

### site_architecture

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "site_architecture_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.site_architecture_records` | `CREATE TABLE IF NOT EXISTS app_public.site_architecture_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

### analytics_integration

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "analytics_integration_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.analytics_integration_records` | `CREATE TABLE IF NOT EXISTS app_public.analytics_integration_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

### local_seo

| Item | Repository | Migration | Status |
|------|-----------|-----------|--------|
| Factory call | `createPostgresModuleRunRepository({ recordsTable: "local_seo_records", query })` | — | PASS |
| Query 1 target | `app_public.product_targets` | `app_public.product_targets` | PASS |
| Query 2 table | `app_public.local_seo_records` | `CREATE TABLE IF NOT EXISTS app_public.local_seo_records` | PASS |
| Column alignment | All 8 factory columns present | All 8 columns in migration DDL | PASS |

No deviations.

---

## Summary Table

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

---

## Migration Coverage Check

The migration `20260516120000_seo_os_expansion_modules.sql` also:

1. Expands the `initial_state` check constraint on `backend_module_catalog` to include `'backend_active'` — required because all 10 new modules use this value.
2. Registers all 10 modules in `app_public.backend_module_catalog` with `initial_state = 'backend_active'`.
3. Inserts activation defaults into `app_public.backend_module_activation_defaults`: 9 modules `is_active = true`, `local_seo` with `is_active = false`. This matches `activation.js`.
4. Creates `updated_at` triggers for all 10 new tables using the shared `app_public.set_updated_at()` function.

All four migration concerns are consistent with the runtime code.

---

## Findings

No schema alignment issues found. All 10 repositories are correctly configured and match the migration DDL exactly.
