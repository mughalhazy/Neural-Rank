// T2-05: Real Postgres integration tests for the execution lifecycle domain.
// Requires DATABASE_URL to point to a test Postgres instance.
// Run with: npm run test:integration
// Skipped automatically when DATABASE_URL is not set.

const assert = require("node:assert/strict");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.log("integration/execution-postgres: skipped — DATABASE_URL not set");
    return;
  }

  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });

  const { createPostgresExecutionRepository } = require("../domains/execution/repository");
  const { createRecommendationRecord, createTaskRecord } = require("../domains/execution/models");
  const { createGovernanceService } = require("../domains/governance/service");
  const { createRecommendationScore } = require("../core/recommendationScoring");

  const query = (sql, params) => pool.query(sql, params);
  const context = { query };
  const repository = createPostgresExecutionRepository(context);
  const governanceService = createGovernanceService();

  try {
    // Create recommendation
    const input = {
      sourceModuleKey: "integration_test",
      title: "Integration test recommendation",
      actionType: "content_update",
      target: { websiteUrl: "https://integration-test.example.com" },
    };

    const governanceResult = governanceService.evaluateActionGovernance(input);
    const score = createRecommendationScore({ governanceResult });
    const rec = createRecommendationRecord({ ...input, governanceResult, score });
    const created = await repository.createRecommendation(rec);

    assert.ok(created.id, "recommendation should have an id");
    assert.equal(created.currentStatus, "recommended");
    assert.equal(created.sourceModuleKey, "integration_test");

    // List recommendations
    const list = await repository.listRecommendations(null);
    assert.ok(list.length >= 1, "should have at least one recommendation");
    const found = list.find((r) => r.id === created.id);
    assert.ok(found, "created recommendation should appear in list");

    // Get recommendation
    const fetched = await repository.getRecommendation(created.id);
    assert.equal(fetched.id, created.id);

    // Write audit log
    await repository.writeAuditLog({
      entityType: "recommendation",
      entityId: created.id,
      action: "integration_test_created",
      actor: "integration_test",
      payload: { status: created.currentStatus },
      createdAt: new Date().toISOString(),
    });

    // List audit logs
    const logs = await repository.listAuditLogs();
    const testLog = logs.find((l) => l.entityId === created.id);
    assert.ok(testLog, "audit log entry should exist");

    // Update recommendation status
    const updated = await repository.updateRecommendation(created.id, {
      currentStatus: "approved",
      approvalStatus: "approved",
      updatedAt: new Date().toISOString(),
    });
    assert.equal(updated.currentStatus, "approved");

    // Create task
    const task = createTaskRecord({ recommendation: updated, actor: "integration_test" });
    const createdTask = await repository.createTask(task);
    assert.ok(createdTask.id, "task should have an id");

    // Append status history
    await repository.appendTaskStatusHistory({
      taskId: createdTask.id,
      previousStatus: null,
      nextStatus: "queued",
      actor: "integration_test",
      reason: "integration test",
      metadata: {},
      createdAt: new Date().toISOString(),
    });

    const history = await repository.listTaskStatusHistory(createdTask.id);
    assert.equal(history.length, 1);
    assert.equal(history[0].nextStatus, "queued");

    // Cleanup test data
    await query("DELETE FROM app_public.execution_tasks WHERE source_module_key = $1", ["integration_test"]);
    await query("DELETE FROM app_public.audit_logs WHERE actor = $1", ["integration_test"]);
    await query("DELETE FROM app_public.execution_recommendations WHERE source_module_key = $1", ["integration_test"]);

    console.log("integration/execution-postgres tests passed");
  } finally {
    await pool.end();
  }
}

module.exports = { run };

if (require.main === module) {
  run().catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
  });
}
