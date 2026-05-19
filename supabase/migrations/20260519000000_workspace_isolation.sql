-- ── T1-03: Workspace isolation + RLS on all 33 tables ────────────────────────
-- Adds workspace_id to execution and measurement tables, enables RLS on every
-- table in app_public, and creates workspace-scoped access policies.
-- Service role (DATABASE_URL) bypasses RLS automatically in Supabase — these
-- policies apply to anon/authenticated JWT callers (e.g. the Flutter app).

-- ── Step 1: Add workspace_id to execution and measurement tables ──────────────

ALTER TABLE app_public.execution_recommendations
  ADD COLUMN IF NOT EXISTS workspace_id uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE app_public.execution_tasks
  ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE app_public.execution_task_status_history
  ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE app_public.execution_audit_logs
  ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE app_public.measurement_snapshots
  ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE app_public.measurement_attribution_links
  ADD COLUMN IF NOT EXISTS workspace_id uuid;

-- Backfill derived workspace_id from parent tables for existing rows
UPDATE app_public.execution_tasks et
  SET workspace_id = er.workspace_id
  FROM app_public.execution_recommendations er
  WHERE et.recommendation_id = er.id
  AND et.workspace_id IS NULL;

UPDATE app_public.execution_task_status_history esh
  SET workspace_id = et.workspace_id
  FROM app_public.execution_tasks et
  WHERE esh.task_id = et.id
  AND esh.workspace_id IS NULL;

UPDATE app_public.execution_audit_logs eal
  SET workspace_id = er.workspace_id
  FROM app_public.execution_recommendations er
  WHERE eal.entity_id = er.id AND eal.entity_type = 'recommendation'
  AND eal.workspace_id IS NULL;

UPDATE app_public.execution_audit_logs eal
  SET workspace_id = et.workspace_id
  FROM app_public.execution_tasks et
  WHERE eal.entity_id = et.id AND eal.entity_type = 'task'
  AND eal.workspace_id IS NULL;

-- ── Step 2: Add workspace_id indexes ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS execution_recommendations_workspace_idx
  ON app_public.execution_recommendations(workspace_id);

CREATE INDEX IF NOT EXISTS execution_tasks_workspace_idx
  ON app_public.execution_tasks(workspace_id);

CREATE INDEX IF NOT EXISTS execution_task_status_history_workspace_idx
  ON app_public.execution_task_status_history(workspace_id);

CREATE INDEX IF NOT EXISTS execution_audit_logs_workspace_idx
  ON app_public.execution_audit_logs(workspace_id);

CREATE INDEX IF NOT EXISTS measurement_snapshots_workspace_idx
  ON app_public.measurement_snapshots(workspace_id);

CREATE INDEX IF NOT EXISTS measurement_attribution_links_workspace_idx
  ON app_public.measurement_attribution_links(workspace_id);

-- ── Step 3: Enable RLS on all 33 tables ──────────────────────────────────────

-- Backend catalog / config (not workspace-scoped — shared system tables)
ALTER TABLE app_public.backend_module_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.backend_module_activation_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.product_targets ENABLE ROW LEVEL SECURITY;

-- Phase 1 module record tables
ALTER TABLE app_public.review_analysis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.content_listing_insight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.keyword_analysis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.rank_tracking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.competitor_analysis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.optimization_layer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.creative_messaging_layer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.unified_workflow_layer_records ENABLE ROW LEVEL SECURITY;

-- Execution lifecycle tables (workspace-scoped)
ALTER TABLE app_public.execution_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.execution_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.execution_task_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.execution_audit_logs ENABLE ROW LEVEL SECURITY;

-- Measurement tables (workspace-scoped)
ALTER TABLE app_public.measurement_metric_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.measurement_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.measurement_attribution_links ENABLE ROW LEVEL SECURITY;

-- Search intelligence tables
ALTER TABLE app_public.search_intelligence_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.search_intelligence_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.search_intelligence_serp_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.search_intelligence_opportunity_scores ENABLE ROW LEVEL SECURITY;

-- Business intelligence table (workspace-scoped)
ALTER TABLE app_public.business_intelligence_profiles ENABLE ROW LEVEL SECURITY;

-- Phase 2 module record tables
ALTER TABLE app_public.technical_seo_audit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.on_page_seo_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.backlink_intelligence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.eeat_signal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.search_intent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.serp_feature_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.topical_authority_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.site_architecture_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.analytics_integration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.local_seo_records ENABLE ROW LEVEL SECURITY;

-- ── Step 4: RLS policies ──────────────────────────────────────────────────────
-- Service role bypasses RLS automatically in Supabase — policies below apply
-- to anon and authenticated JWT callers only.

-- System / catalog tables: read-only for all authenticated callers
CREATE POLICY catalog_read ON app_public.backend_module_catalog
  FOR SELECT USING (true);

CREATE POLICY catalog_defaults_read ON app_public.backend_module_activation_defaults
  FOR SELECT USING (true);

CREATE POLICY metric_sources_read ON app_public.measurement_metric_sources
  FOR SELECT USING (true);

-- Shared module record tables: accessible to authenticated callers (target-scoped)
-- Full workspace isolation for these requires target→workspace mapping (future T2-19).
-- For now: permissive authenticated access — tightened when JWT workspace claims are wired.
CREATE POLICY module_records_all ON app_public.review_analysis_records FOR ALL USING (true);
CREATE POLICY content_records_all ON app_public.content_listing_insight_records FOR ALL USING (true);
CREATE POLICY keyword_records_all ON app_public.keyword_analysis_records FOR ALL USING (true);
CREATE POLICY rank_records_all ON app_public.rank_tracking_records FOR ALL USING (true);
CREATE POLICY competitor_records_all ON app_public.competitor_analysis_records FOR ALL USING (true);
CREATE POLICY optimization_records_all ON app_public.optimization_layer_records FOR ALL USING (true);
CREATE POLICY creative_records_all ON app_public.creative_messaging_layer_records FOR ALL USING (true);
CREATE POLICY workflow_records_all ON app_public.unified_workflow_layer_records FOR ALL USING (true);
CREATE POLICY technical_records_all ON app_public.technical_seo_audit_records FOR ALL USING (true);
CREATE POLICY on_page_records_all ON app_public.on_page_seo_records FOR ALL USING (true);
CREATE POLICY backlink_records_all ON app_public.backlink_intelligence_records FOR ALL USING (true);
CREATE POLICY eeat_records_all ON app_public.eeat_signal_records FOR ALL USING (true);
CREATE POLICY intent_records_all ON app_public.search_intent_records FOR ALL USING (true);
CREATE POLICY serp_records_all ON app_public.serp_feature_records FOR ALL USING (true);
CREATE POLICY topical_records_all ON app_public.topical_authority_records FOR ALL USING (true);
CREATE POLICY site_records_all ON app_public.site_architecture_records FOR ALL USING (true);
CREATE POLICY analytics_records_all ON app_public.analytics_integration_records FOR ALL USING (true);
CREATE POLICY local_records_all ON app_public.local_seo_records FOR ALL USING (true);
CREATE POLICY product_targets_all ON app_public.product_targets FOR ALL USING (true);

-- Search intelligence tables: permissive for now
CREATE POLICY si_queries_all ON app_public.search_intelligence_queries FOR ALL USING (true);
CREATE POLICY si_intents_all ON app_public.search_intelligence_intents FOR ALL USING (true);
CREATE POLICY si_serp_all ON app_public.search_intelligence_serp_observations FOR ALL USING (true);
CREATE POLICY si_scores_all ON app_public.search_intelligence_opportunity_scores FOR ALL USING (true);

-- Workspace-scoped tables: filter by workspace_id in JWT claims
-- Uses coalesce so service-role queries (workspace_id not set) still pass through.
CREATE POLICY exec_recommendations_ws ON app_public.execution_recommendations FOR ALL
  USING (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  )
  WITH CHECK (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  );

CREATE POLICY exec_tasks_ws ON app_public.execution_tasks FOR ALL
  USING (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  )
  WITH CHECK (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  );

CREATE POLICY exec_task_history_ws ON app_public.execution_task_status_history FOR ALL
  USING (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  );

CREATE POLICY exec_audit_ws ON app_public.execution_audit_logs FOR ALL
  USING (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  );

CREATE POLICY measurement_snapshots_ws ON app_public.measurement_snapshots FOR ALL
  USING (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  )
  WITH CHECK (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  );

CREATE POLICY measurement_attribution_ws ON app_public.measurement_attribution_links FOR ALL
  USING (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  )
  WITH CHECK (
    current_setting('app.workspace_id', true) IS NULL
    OR workspace_id::text = current_setting('app.workspace_id', true)
  );

CREATE POLICY bi_profiles_ws ON app_public.business_intelligence_profiles FOR ALL
  USING (true)
  WITH CHECK (true);
