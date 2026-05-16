const assert = require("node:assert/strict");

const {
  getExecutionService,
  resetExecutionServiceState,
} = require("./domains/execution/service");

async function testRecommendationApprovalAndTaskCreation() {
  resetExecutionServiceState();
  const executionService = getExecutionService();

  const recommendation = await executionService.createRecommendation({
    sourceModuleKey: "review_analysis",
    title: "Fix billing complaint cluster",
    summary: "Recurring billing complaints need owner review and remediation planning.",
    actionType: "review_cluster_remediation",
    payload: {
      clusterKey: "billing",
      recommendation: "Create a billing remediation brief before executing any live change.",
    },
    target: {
      websiteUrl: "https://example.com",
    },
    actor: "qa_test",
  });

  assert.equal(recommendation.currentStatus, "recommended");
  assert.equal(recommendation.approvalStatus, "recommended");
  assert.equal(recommendation.taskId, null);
  assert.ok(recommendation.governanceResult);
  assert.equal(typeof recommendation.governanceResult.overallClassification, "string");
  assert.ok(recommendation.score);
  assert.equal(typeof recommendation.score.derivedPriority, "string");

  await assert.rejects(
    executionService.createTaskFromRecommendation(recommendation.id, {
      actor: "qa_test",
    }),
    /recommendation_requires_approval/,
  );

  const approvedRecommendation = await executionService.updateRecommendationStatus(
    recommendation.id,
    {
      nextStatus: "approved",
      actor: "qa_reviewer",
      reason: "Recommendation reviewed and approved for queued execution planning.",
    },
  );

  assert.equal(approvedRecommendation.currentStatus, "approved");
  assert.equal(approvedRecommendation.approvalStatus, "approved");

  const task = await executionService.createTaskFromRecommendation(recommendation.id, {
    actor: "qa_reviewer",
    rollbackMetadata: {
      rollbackPlan: "Restore previous approved content snapshot if verification fails.",
    },
  });

  assert.equal(task.currentStatus, "queued");
  assert.equal(task.approvalStatus, "approved");
  assert.equal(task.executionStatus, "queued");
  assert.equal(task.verificationStatus, null);
  assert.ok(task.governanceResult);
  assert.ok(task.score);

  const queuedHistory = await executionService.listTaskStatusHistory(task.id);
  assert.equal(queuedHistory.length, 1);
  assert.equal(queuedHistory[0].nextStatus, "queued");

  const queuedRecommendation = await executionService.listRecommendations();
  assert.equal(queuedRecommendation[0].currentStatus, "queued");
  assert.equal(queuedRecommendation[0].executionStatus, "queued");
  assert.equal(queuedRecommendation[0].taskId, task.id);
}

async function testTaskStatusHistoryAndAuditTrail() {
  resetExecutionServiceState();
  const executionService = getExecutionService();

  const recommendation = await executionService.createRecommendation({
    sourceModuleKey: "keyword_analysis",
    title: "Refresh keyword landing page coverage",
    summary: "A queued content change is required, but must remain approval-gated and reversible.",
    actionType: "content_refresh_plan",
    payload: {
      keyword: "seo platform",
    },
    target: {
      websiteUrl: "https://example.com",
    },
    actor: "qa_test",
  });

  await executionService.updateRecommendationStatus(recommendation.id, {
    nextStatus: "approved",
    actor: "qa_reviewer",
    reason: "Approved for task creation.",
  });

  const task = await executionService.createTaskFromRecommendation(recommendation.id, {
    actor: "qa_reviewer",
    rollbackMetadata: {
      rollbackPlan: "Restore prior copy revision.",
      rollbackOwner: "seo_ops",
    },
  });

  const executedTask = await executionService.updateTaskStatus(task.id, {
    nextStatus: "executed",
    actor: "seo_ops",
    reason: "Execution state recorded after planned manual work completion.",
    metadata: {
      executionTicket: "exec-001",
    },
  });

  assert.equal(executedTask.currentStatus, "executed");
  assert.equal(executedTask.executionStatus, "executed");
  assert.ok(executedTask.governanceResult);
  assert.ok(executedTask.score);

  const verifiedTask = await executionService.updateTaskStatus(task.id, {
    nextStatus: "verified",
    actor: "seo_qa",
    reason: "Verification completed against acceptance criteria.",
    metadata: {
      verificationTicket: "verify-001",
    },
  });

  assert.equal(verifiedTask.currentStatus, "verified");
  assert.equal(verifiedTask.verificationStatus, "verified");

  const history = await executionService.listTaskStatusHistory(task.id);
  assert.equal(history.length, 3);
  assert.deepEqual(
    history.map((entry) => entry.nextStatus),
    ["queued", "executed", "verified"],
  );

  const auditLogs = await executionService.listAuditLogs();
  assert.equal(auditLogs.length, 6);
  assert.equal(auditLogs[0].action, "recommendation_created");
  assert.equal(auditLogs[1].action, "recommendation_status_changed");
  assert.equal(auditLogs[2].action, "task_created");
  assert.equal(auditLogs[3].action, "recommendation_status_changed");
  assert.equal(auditLogs[4].action, "task_status_changed");
  assert.equal(auditLogs[5].action, "task_status_changed");

  await assert.rejects(
    executionService.updateTaskStatus(task.id, {
      nextStatus: "approved",
      actor: "seo_qa",
    }),
    /invalid_task_status/,
  );
}

async function run() {
  await testRecommendationApprovalAndTaskCreation();
  await testTaskStatusHistoryAndAuditTrail();
  console.log("execution-lifecycle tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
