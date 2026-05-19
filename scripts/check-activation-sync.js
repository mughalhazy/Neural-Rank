#!/usr/bin/env node
// T2-19: Checks that the JS activation catalog matches the DB backend_module_catalog table.
// Requires DATABASE_URL. Run via: npm run test:integration
// Skipped automatically when DATABASE_URL is not set.

const path = require("node:path");

const { getRegisteredModuleKeys } = require(path.join(__dirname, "../backend/src/orchestration/serviceRegistry"));
const { DEFAULT_ACTIVE_MODULES, BUILT_BUT_INACTIVE_MODULES } = require(path.join(__dirname, "../backend/src/core/activation"));

async function checkActivationSync() {
  if (!process.env.DATABASE_URL) {
    console.log("check-activation-sync: skipped — DATABASE_URL not set");
    return;
  }

  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  try {
    const result = await pool.query(
      "SELECT module_key, initial_state FROM app_public.backend_module_catalog ORDER BY module_key",
    );

    const dbRows = result.rows;
    const jsRegisteredKeys = new Set(getRegisteredModuleKeys());

    for (const row of dbRows) {
      const isActive = DEFAULT_ACTIVE_MODULES.has(row.module_key);
      const isInactive = BUILT_BUT_INACTIVE_MODULES.has(row.module_key);

      if (!isActive && !isInactive) {
        throw new Error(
          `DB module '${row.module_key}' is present in backend_module_catalog but missing from both JS activation sets`,
        );
      }

      const expectedState = isActive ? "active" : "inactive";
      if (row.initial_state !== expectedState) {
        throw new Error(
          `Module '${row.module_key}' initial_state mismatch — DB='${row.initial_state}', JS='${expectedState}'`,
        );
      }
    }

    // Verify every registered JS key is in the DB catalog.
    for (const moduleKey of jsRegisteredKeys) {
      const found = dbRows.find((r) => r.module_key === moduleKey);
      if (!found) {
        throw new Error(
          `JS-registered module '${moduleKey}' is missing from app_public.backend_module_catalog`,
        );
      }
    }

    console.log(`check-activation-sync: OK — ${dbRows.length} modules verified`);
  } finally {
    await pool.end();
  }
}

checkActivationSync().catch((err) => {
  console.error("check-activation-sync FAILED:", err.message);
  process.exit(1);
});
