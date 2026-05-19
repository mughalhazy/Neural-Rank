#!/usr/bin/env node
// Usage: node scripts/scaffold-module.js <moduleKey> <displayName>
// Example: node scripts/scaffold-module.js local_seo_v2 "Local SEO v2"
// Or via npm: npm run scaffold -- local_seo_v2 "Local SEO v2"

const { writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require("path");

const [, , moduleKey, ...displayParts] = process.argv;
const displayName = displayParts.join(" ");

if (!moduleKey || !displayName) {
  console.error("Usage: node scripts/scaffold-module.js <moduleKey> <displayName>");
  console.error('Example: node scripts/scaffold-module.js local_seo_v2 "Local SEO v2"');
  process.exit(1);
}

if (!/^[a-z][a-z0-9_]*$/.test(moduleKey)) {
  console.error(`Invalid moduleKey: "${moduleKey}". Must be snake_case (lowercase letters, digits, underscores).`);
  process.exit(1);
}

const camel = moduleKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
const moduleDirName = moduleKey.replace(/_/g, "-");
const moduleDir = path.join(__dirname, "..", "backend", "src", "modules", moduleDirName);

if (existsSync(moduleDir)) {
  console.error(`Module directory already exists: ${moduleDir}`);
  process.exit(1);
}

mkdirSync(moduleDir, { recursive: true });

// ── analysis.js ──────────────────────────────────────────────────────────────
writeFileSync(path.join(moduleDir, "analysis.js"), `function analyze${pascal}Input(moduleInput = {}) {
  return {
    moduleKey: "${moduleKey}",
    status: "analyzed",
    input: moduleInput,
  };
}

module.exports = { analyze${pascal}Input };
`);

// ── insights.js ──────────────────────────────────────────────────────────────
writeFileSync(path.join(moduleDir, "insights.js"), `function generate${pascal}Insights(analysis = {}) {
  return [
    {
      type: "${moduleKey}_insight",
      summary: "Insight placeholder — replace with real signal logic.",
      evidence: [],
      explanation: "",
      nextStep: "",
    },
  ];
}

module.exports = { generate${pascal}Insights };
`);

// ── actions.js ────────────────────────────────────────────────────────────────
writeFileSync(path.join(moduleDir, "actions.js"), `function build${pascal}Actions(insights = []) {
  return insights.map((insight) => ({
    moduleKey: "${moduleKey}",
    type: "${moduleKey}_action",
    priority: "medium",
    action: "Review and address: " + insight.summary,
    reference: null,
  }));
}

module.exports = { build${pascal}Actions };
`);

// ── repository.js ─────────────────────────────────────────────────────────────
writeFileSync(path.join(moduleDir, "repository.js"), `const { createPostgresModuleRunRepository, resolveQueryFunction } = require("../../core/persistence");

const RECORDS_TABLE = "${moduleKey}_records";

function resolve${pascal}Repository(context = {}) {
  const query = resolveQueryFunction(context);
  if (!query) return null;
  return createPostgresModuleRunRepository({ recordsTable: RECORDS_TABLE, query });
}

async function persist${pascal}Run(context = {}, payload = {}) {
  const repo = resolve${pascal}Repository(context);
  if (!repo) return { persisted: false };
  const savedRecord = await repo.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = { resolve${pascal}Repository, persist${pascal}Run };
`);

// ── service.js ────────────────────────────────────────────────────────────────
writeFileSync(path.join(moduleDir, "service.js"), `const { analyze${pascal}Input } = require("./analysis");
const { generate${pascal}Insights } = require("./insights");
const { build${pascal}Actions } = require("./actions");
const { persist${pascal}Run } = require("./repository");

const MODULE_KEY = "${moduleKey}";
const DISPLAY_NAME = "${displayName}";

async function run(moduleInput = {}, context = {}) {
  const analysisResult = analyze${pascal}Input(moduleInput);
  const insightResult = generate${pascal}Insights(analysisResult);
  const actionResult = build${pascal}Actions(insightResult);

  const priorityResult = {
    moduleKey: MODULE_KEY,
    items: actionResult.map((a) => ({ ...a, businessValue: null })),
  };

  const persistence = await persist${pascal}Run(context, {
    productTarget: context.productTarget || {},
    input: moduleInput,
    analysis: analysisResult,
    insights: insightResult,
    priority: priorityResult,
    actions: actionResult,
  });

  return {
    moduleKey: MODULE_KEY,
    displayName: DISPLAY_NAME,
    defaultActive: true,
    initialState: "ready",
    activeByDefault: true,
    status: actionResult.length > 0 ? "completed" : "actions_empty",
    flow: {
      input: moduleInput,
      analysis: analysisResult,
      insight: insightResult,
      priority: priorityResult,
      action: actionResult,
    },
    intakeResult: moduleInput,
    analysisResult,
    insightResult,
    actionResult,
    persistence,
    integrationStatus: "not_configured",
  };
}

module.exports = { run };
`);

// ── service.test.js ───────────────────────────────────────────────────────────
writeFileSync(path.join(moduleDir, "service.test.js"), `const assert = require("node:assert/strict");
const { run } = require("./service");

async function test${pascal}Service() {
  console.log("[${moduleKey}] running service tests...");

  const result = await run({ websiteUrl: "https://example.com" }, {});
  assert.equal(result.moduleKey, "${moduleKey}");
  assert.equal(typeof result.flow.analysis, "object");
  assert.ok(Array.isArray(result.flow.insight));
  assert.ok(Array.isArray(result.flow.action));

  console.log("[${moduleKey}] all service tests passed");
}

test${pascal}Service().catch((err) => { console.error(err); process.exit(1); });
`);

console.log(`\nScaffolded module: ${moduleKey} ("${displayName}")`);
console.log(`Directory: ${moduleDir}`);
console.log("\nFiles created:");
["analysis.js", "insights.js", "actions.js", "repository.js", "service.js", "service.test.js"].forEach((f) => {
  console.log(`  ${path.join(moduleDir, f)}`);
});

console.log("\nRemaining manual steps:");
console.log(`  1. Add "${moduleKey}" to DEFAULT_ACTIVE_MODULES or BUILT_BUT_INACTIVE_MODULES in backend/src/core/activation.js`);
console.log(`  2. Add a catalog entry to backend/src/core/moduleCatalog.js`);
console.log(`  3. Register the service in backend/src/orchestration/serviceRegistry.js`);
console.log(`  4. Create migration: supabase/migrations/<timestamp>_${moduleKey}_records.sql`);
console.log(`  5. Run npm run ci to verify the scaffold passes lint + tests`);
