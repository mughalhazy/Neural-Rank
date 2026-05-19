const { executionContract } = require("./contract");
const {
  createUnifiedWorkflowCompatibilityAdapter,
} = require("./adapters/unifiedWorkflowAdapter");
const {
  createRecommendationRecord,
  createTaskRecord,
  deriveTaskState,
} = require("./models");
const {
  RECOMMENDATION_STATUSES,
  TASK_STATUSES,
  assertRecommendationTransition,
  assertTaskTransition,
  assertExecutionStatus,
} = require("./statuses");
const {
  createInMemoryExecutionRepository,
  createPostgresExecutionRepository,
} = require("./repository");
const { writeAuditLog } = require("./auditLogWriter");
const { createGovernanceService } = require("../governance/service");
const { createRecommendationScore } = require("../../core/recommendationScoring");
const { withTransaction } = require("../../db");

const defaultExecutionRepository = createInMemoryExecutionRepository();
const governanceService = createGovernanceService();

function resolveRepository(context = {}) {
  if (context.executionRepository) {
    return context.executionRepository;
  }

  if (context.query || context.db?.query || context.pg?.query) {
    return createPostgresExecutionRepository(context);
  }

  return defaultExecutionRepository;
}

function assertRecommendationStatus(nextStatus) {
  assertExecutionStatus(nextStatus, "recommendation_status");
  if (!RECOMMENDATION_STATUSES.includes(nextStatus)) {
    throw new Error("invalid_recommendation_status");
  }
}

function assertTaskStatus(nextStatus) {
  assertExecutionStatus(nextStatus, "task_status");
  if (!TASK_STATUSES.includes(nextStatus)) {
    throw new Error("invalid_task_status");
  }
}

async function createRecommendation(input = {}, context = {}) {
  // Governance evaluation is pure computation — runs outside the transaction.
  const governanceResult = governanceService.evaluateActionGovernance(input);

  if (governanceResult.overallClassification === "block") {
    throw new Error(`governance_blocks_${input.actionType || "action"}`);
  }

  const score = createRecommendationScore({
    ...(input.score || {}),
    governanceRisk: input.score?.governanceRisk,
    rationale: input.score?.rationale || input.rationale || "",
    governanceResult,
  });
  const recommendation = createRecommendationRecord({
    ...input,
    governanceResult,
    score,
    workspaceId: context.workspaceId || null,
  });

  return withTransaction(async ({ transactionalQuery }) => {
    const txContext = transactionalQuery ? { ...context, query: transactionalQuery } : context;
    const repository = resolveRepository(txContext);

    const created = await repository.createRecommendation(recommendation);

    await writeAuditLog(repository, {
      entityType: "recommendation",
      entityId: created.id,
      action: "recommendation_created",
      actor: created.createdBy,
      payload: {
        currentStatus: created.currentStatus,
        sourceModuleKey: created.sourceModuleKey,
        governanceClassification: created.governanceResult?.overallClassification || "allow",
        score: created.score,
        derivedPriority: created.score?.derivedPriority || "low",
      },
      createdAt: new Date().toISOString(),
    });

    return created;
  });
}

async function listRecommendations(context = {}) {
  const repository = resolveRepository(context);
  return repository.listRecommendations(context.workspaceId || null);
}

async function updateRecommendationStatus(
  recommendationId,
  { nextStatus, actor = "system", reason = "", metadata = {} } = {},
  context = {},
) {
  assertRecommendationStatus(nextStatus);

  return withTransaction(async ({ transactionalQuery }) => {
    const txContext = transactionalQuery ? { ...context, query: transactionalQuery } : context;
    const repository = resolveRepository(txContext);
    const recommendation = await repository.getRecommendation(recommendationId);

    if (!recommendation) {
      throw new Error("recommendation_not_found");
    }

    if (nextStatus === "approved") {
      governanceService.assertGovernanceAllowsApproval(recommendation.governanceResult);
    }

    assertRecommendationTransition(recommendation.currentStatus, nextStatus);

    const updated = await repository.updateRecommendation(recommendationId, {
      currentStatus: nextStatus,
      approvalStatus:
        nextStatus === "approved" || nextStatus === "rejected"
          ? nextStatus
          : recommendation.approvalStatus,
      updatedAt: new Date().toISOString(),
    });

    await writeAuditLog(repository, {
      entityType: "recommendation",
      entityId: recommendationId,
      action: "recommendation_status_changed",
      actor,
      payload: {
        previousStatus: recommendation.currentStatus,
        nextStatus,
        reason,
        metadata,
        governanceClassification:
          recommendation.governanceResult?.overallClassification || "allow",
        score: recommendation.score,
      },
      createdAt: new Date().toISOString(),
    });

    return updated;
  });
}

async function createTaskFromRecommendation(
  recommendationId,
  { actor = "system", rollbackMetadata = {}, reason = "" } = {},
  context = {},
) {
  return withTransaction(async ({ transactionalQuery }) => {
    const txContext = transactionalQuery ? { ...context, query: transactionalQuery } : context;
    const repository = resolveRepository(txContext);
    const recommendation = await repository.getRecommendation(recommendationId);

    if (!recommendation) {
      throw new Error("recommendation_not_found");
    }

    if (recommendation.currentStatus !== "approved") {
      throw new Error("recommendation_requires_approval");
    }

    if (recommendation.taskId) {
      throw new Error("task_already_exists_for_recommendation");
    }

    governanceService.assertGovernanceAllowsTaskCreation(recommendation.governanceResult);

    const task = createTaskRecord({
      recommendation,
      actor,
      rollbackMetadata,
    });
    const createdTask = await repository.createTask(task);

    await repository.updateRecommendation(recommendationId, {
      currentStatus: "queued",
      approvalStatus: recommendation.approvalStatus,
      executionStatus: "queued",
      taskId: createdTask.id,
      updatedAt: new Date().toISOString(),
    });

    await repository.appendTaskStatusHistory({
      taskId: createdTask.id,
      previousStatus: null,
      nextStatus: "queued",
      actor,
      reason: reason || "task_created_from_recommendation",
      metadata: {},
      createdAt: new Date().toISOString(),
    });

    await writeAuditLog(repository, {
      entityType: "task",
      entityId: createdTask.id,
      action: "task_created",
      actor,
      payload: {
        recommendationId,
        currentStatus: createdTask.currentStatus,
        governanceClassification:
          createdTask.governanceResult?.overallClassification || "allow",
        score: createdTask.score,
      },
      createdAt: new Date().toISOString(),
    });

    await writeAuditLog(repository, {
      entityType: "recommendation",
      entityId: recommendationId,
      action: "recommendation_status_changed",
      actor,
      payload: {
        previousStatus: "approved",
        nextStatus: "queued",
        reason: reason || "task_created_from_recommendation",
        taskId: createdTask.id,
        governanceClassification:
          createdTask.governanceResult?.overallClassification || "allow",
        score: createdTask.score,
      },
      createdAt: new Date().toISOString(),
    });

    return createdTask;
  });
}

async function listTasks(context = {}) {
  const repository = resolveRepository(context);
  return repository.listTasks(context.workspaceId || null);
}

async function getTask(taskId, context = {}) {
  const repository = resolveRepository(context);
  return repository.getTask(taskId);
}

async function listTaskStatusHistory(taskId, context = {}) {
  const repository = resolveRepository(context);
  return repository.listTaskStatusHistory(taskId);
}

async function updateTaskStatus(
  taskId,
  {
    nextStatus,
    actor = "system",
    reason = "",
    metadata = {},
    rollbackMetadata = null,
  } = {},
  context = {},
) {
  assertTaskStatus(nextStatus);

  return withTransaction(async ({ transactionalQuery }) => {
    const txContext = transactionalQuery ? { ...context, query: transactionalQuery } : context;
    const repository = resolveRepository(txContext);
    const task = await repository.getTask(taskId);

    if (!task) {
      throw new Error("task_not_found");
    }

    governanceService.assertGovernanceAllowsExecution(task.governanceResult, nextStatus);
    assertTaskTransition(task.currentStatus, nextStatus);

    const derivedState = deriveTaskState(task, nextStatus, rollbackMetadata);
    const updated = await repository.updateTask(taskId, {
      ...derivedState,
      updatedAt: new Date().toISOString(),
    });

    await repository.appendTaskStatusHistory({
      taskId,
      previousStatus: task.currentStatus,
      nextStatus,
      actor,
      reason,
      metadata,
      createdAt: new Date().toISOString(),
    });

    await writeAuditLog(repository, {
      entityType: "task",
      entityId: taskId,
      action: "task_status_changed",
      actor,
      payload: {
        previousStatus: task.currentStatus,
        nextStatus,
        reason,
        metadata,
        rollbackMetadata,
        governanceClassification:
          task.governanceResult?.overallClassification || "allow",
        score: task.score,
      },
      createdAt: new Date().toISOString(),
    });

    return updated;
  });
}

async function listAuditLogs(context = {}) {
  const repository = resolveRepository(context);
  return repository.listAuditLogs();
}

function createExecutionService() {
  return {
    contract: executionContract,
    compatibilityAdapters: {
      unified_workflow_layer: createUnifiedWorkflowCompatibilityAdapter(),
    },
    createRecommendation,
    listRecommendations,
    updateRecommendationStatus,
    createTaskFromRecommendation,
    listTasks,
    getTask,
    listTaskStatusHistory,
    updateTaskStatus,
    listAuditLogs,
  };
}

const executionService = createExecutionService();

function getExecutionService() {
  return executionService;
}

function resetExecutionServiceState() {
  if (typeof defaultExecutionRepository.reset === "function") {
    defaultExecutionRepository.reset();
  }
}

module.exports = {
  createExecutionService,
  getExecutionService,
  resetExecutionServiceState,
};
