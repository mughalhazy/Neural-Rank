"use strict";

const { createInMemoryExecutionRepository } = require("./domains/execution/repository");
const { createExecutionService } = require("./domains/execution/service");
const { createMeasurementService } = require("./domains/measurement/service");
const { createTechnicalOperationsService } = require("./domains/technical-operations/service");
const { createSearchIntelligenceService } = require("./domains/search-intelligence/service");
const { createBusinessIntelligenceService } = require("./domains/business-intelligence/service");

// createContainer builds all domain services with isolated state.
// Each call returns a fresh container — no shared singletons between containers.
// Pass { query } when a DB connection is available (production startup).
function createContainer({ query = null } = {}) {
  const executionRepository = createInMemoryExecutionRepository();
  const rawExecutionService = createExecutionService();

  // Wrap execution service to inject this container's repo as default.
  // Per-call context can override with context.query for Postgres or context.executionRepository.
  const executionService = {
    contract: rawExecutionService.contract,
    compatibilityAdapters: rawExecutionService.compatibilityAdapters,
    createRecommendation: (input, ctx = {}) =>
      rawExecutionService.createRecommendation(input, _injectRepo(ctx, executionRepository, query)),
    listRecommendations: (ctx = {}) =>
      rawExecutionService.listRecommendations(_injectRepo(ctx, executionRepository, query)),
    updateRecommendationStatus: (id, body, ctx = {}) =>
      rawExecutionService.updateRecommendationStatus(id, body, _injectRepo(ctx, executionRepository, query)),
    createTaskFromRecommendation: (id, body, ctx = {}) =>
      rawExecutionService.createTaskFromRecommendation(id, body, _injectRepo(ctx, executionRepository, query)),
    listTasks: (ctx = {}) =>
      rawExecutionService.listTasks(_injectRepo(ctx, executionRepository, query)),
    getTask: (id, ctx = {}) =>
      rawExecutionService.getTask(id, _injectRepo(ctx, executionRepository, query)),
    listTaskStatusHistory: (id, ctx = {}) =>
      rawExecutionService.listTaskStatusHistory(id, _injectRepo(ctx, executionRepository, query)),
    updateTaskStatus: (id, body, ctx = {}) =>
      rawExecutionService.updateTaskStatus(id, body, _injectRepo(ctx, executionRepository, query)),
    listAuditLogs: (ctx = {}) =>
      rawExecutionService.listAuditLogs(_injectRepo(ctx, executionRepository, query)),
  };

  return {
    query,
    baseContext: query ? { query } : {},
    executionService,
    measurementService: createMeasurementService(),
    technicalOperationsService: createTechnicalOperationsService(),
    searchIntelligenceService: createSearchIntelligenceService(),
    businessIntelligenceService: createBusinessIntelligenceService(),
  };
}

// If the caller already supplies a postgres query or explicit repo, honour it.
// Otherwise fall back to this container's isolated in-memory repo.
function _injectRepo(ctx, inMemoryRepo, containerQuery) {
  if (ctx.query || ctx.executionRepository) return ctx;
  if (containerQuery) return { query: containerQuery, ...ctx };
  return { executionRepository: inMemoryRepo, ...ctx };
}

module.exports = { createContainer };
