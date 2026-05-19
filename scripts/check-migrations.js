#!/usr/bin/env node
// Verifies that all expected tables exist in the target Postgres database.
// Uses DATABASE_URL from the environment (set to the test DB in CI).
// Skips silently (exit 0) when DATABASE_URL is not set.
//
// Usage: node scripts/check-migrations.js
// Or via npm: npm run check:migrations

const EXPECTED_TABLES = [
  // Foundation — 8 Phase 1 module records tables
  "product_targets",
  "review_analysis_records",
  "content_listing_insight_records",
  "keyword_analysis_records",
  "rank_tracking_records",
  "competitor_analysis_records",
  "optimization_layer_records",
  "creative_messaging_layer_records",
  "unified_workflow_layer_records",
  // Execution lifecycle
  "execution_recommendations",
  "execution_tasks",
  "execution_task_status_history",
  "execution_audit_logs",
  "audit_logs",
  // Governance
  "governance_rules",
  "governance_evaluation_records",
  "governance_policy_states",
  // Measurement
  "metric_sources",
  "baseline_snapshots",
  "post_change_snapshots",
  "attribution_links",
  // Search intelligence
  "search_query_records",
  "search_intent_records",
  "serp_pattern_records",
  "serp_feature_records",
  "opportunity_score_records",
  "competitor_result_records",
  // Business intelligence
  "business_profiles",
  "business_priority_extensions",
  // Recommendation scoring
  "recommendation_score_dimensions",
  // Phase 2 — 10 expansion module records tables
  "technical_seo_audit_records",
  "on_page_seo_records",
  "backlink_intelligence_records",
  "eeat_signal_records",
  "search_intent_classifier_records",
  "serp_feature_analyzer_records",
  "topical_authority_records",
  "site_architecture_records",
  "analytics_integration_records",
  "local_seo_records",
];

if (!process.env.DATABASE_URL) {
  console.log("check:migrations — DATABASE_URL not set, skipping.");
  process.exit(0);
}

async function main() {
  let Pool;
  try {
    ({ Pool } = require("pg"));
  } catch {
    console.error("check:migrations — pg package not available.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10_000,
  });

  try {
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'app_public'
       ORDER BY table_name`,
    );
    const existingTables = new Set(result.rows.map((r) => r.table_name));

    const missing = EXPECTED_TABLES.filter((t) => !existingTables.has(t));

    if (missing.length > 0) {
      console.error(`check:migrations FAILED — ${missing.length} expected table(s) missing from app_public schema:`);
      for (const t of missing) {
        console.error(`  missing: ${t}`);
      }
      console.error("\nEnsure all migrations in supabase/migrations/ have been applied.");
      process.exit(1);
    }

    console.log(`check:migrations OK — all ${EXPECTED_TABLES.length} expected tables present in app_public.`);
    process.exit(0);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("check:migrations error:", err.message);
  process.exit(1);
});
