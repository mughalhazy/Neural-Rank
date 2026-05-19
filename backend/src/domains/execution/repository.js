const { randomUUID } = require("node:crypto");
const { resolveQueryFunction } = require("../../core/persistence");
const { clone, normalizeRows, upsertProductTarget } = require("../../core/dbUtils");

function mapRecommendationRow(row = {}) {
  return {
    id: row.id,
    sourceModuleKey: row.source_module_key,
    title: row.title,
    summary: row.summary,
    actionType: row.action_type,
    payload: row.payload || {},
    targetId: row.target_id || null,
    currentStatus: row.current_status,
    approvalStatus: row.approval_status,
    executionStatus: row.execution_status,
    verificationStatus: row.verification_status,
    rollbackMetadata: row.rollback_metadata || {},
    governanceResult: row.governance_result || null,
    score: row.score_payload || null,
    taskId: row.task_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

function mapTaskRow(row = {}) {
  return {
    id: row.id,
    recommendationId: row.recommendation_id,
    sourceModuleKey: row.source_module_key,
    title: row.title,
    summary: row.summary,
    actionType: row.action_type,
    payload: row.payload || {},
    targetId: row.target_id || null,
    currentStatus: row.current_status,
    approvalStatus: row.approval_status,
    executionStatus: row.execution_status,
    verificationStatus: row.verification_status,
    rollbackMetadata: row.rollback_metadata || {},
    governanceResult: row.governance_result || null,
    score: row.score_payload || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

function mapTaskHistoryRow(row = {}) {
  return {
    id: row.id,
    taskId: row.task_id,
    previousStatus: row.previous_status,
    nextStatus: row.next_status,
    actor: row.actor,
    reason: row.reason,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

function mapAuditLogRow(row = {}) {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    actor: row.actor,
    payload: row.payload || {},
    createdAt: row.created_at,
  };
}

function createPostgresExecutionRepository(context = {}) {
  const query = resolveQueryFunction(context);

  if (!query) {
    throw new Error("execution_query_not_configured");
  }

  return {
    async createRecommendation(record) {
      const targetId = await upsertProductTarget(query, record.target);
      const result = await query(
        `
          insert into app_public.execution_recommendations (
            id,
            source_module_key,
            target_id,
            title,
            summary,
            action_type,
            payload,
            workspace_id,
            current_status,
            approval_status,
            execution_status,
            verification_status,
            rollback_metadata,
            governance_result,
            score_payload,
            task_id,
            created_by,
            created_at,
            updated_at
          )
          values (
            $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16, $17, $18, $19
          )
          returning *
        `,
        [
          record.id,
          record.sourceModuleKey,
          targetId,
          record.title,
          record.summary,
          record.actionType,
          JSON.stringify(record.payload || {}),
          record.workspaceId,
          record.currentStatus,
          record.approvalStatus,
          record.executionStatus,
          record.verificationStatus,
          JSON.stringify(record.rollbackMetadata || {}),
          JSON.stringify(record.governanceResult || {}),
          JSON.stringify(record.score || {}),
          record.taskId,
          record.createdBy,
          record.createdAt,
          record.updatedAt,
        ],
      );

      return mapRecommendationRow(normalizeRows(result)[0]);
    },
    async listRecommendations(workspaceId) {
      if (workspaceId) {
        const result = await query(
          `select * from app_public.execution_recommendations where workspace_id = $1 order by created_at asc`,
          [workspaceId],
        );
        return normalizeRows(result).map(mapRecommendationRow);
      }
      const result = await query(
        `select * from app_public.execution_recommendations order by created_at asc`,
      );
      return normalizeRows(result).map(mapRecommendationRow);
    },
    async getRecommendation(id) {
      const result = await query(
        `
          select *
          from app_public.execution_recommendations
          where id = $1
          limit 1
        `,
        [id],
      );

      const row = normalizeRows(result)[0];
      return row ? mapRecommendationRow(row) : null;
    },
    async updateRecommendation(id, patch) {
      const current = await this.getRecommendation(id);

      if (!current) {
        return null;
      }

      const targetId = current.targetId;
      const next = {
        ...current,
        ...patch,
        targetId,
      };

      const result = await query(
        `
          update app_public.execution_recommendations
          set
            current_status = $2,
            approval_status = $3,
            execution_status = $4,
            verification_status = $5,
            rollback_metadata = $6::jsonb,
            governance_result = $7::jsonb,
            score_payload = $8::jsonb,
            task_id = $9,
            updated_at = $10
          where id = $1
          returning *
        `,
        [
          id,
          next.currentStatus,
          next.approvalStatus,
          next.executionStatus,
          next.verificationStatus,
          JSON.stringify(next.rollbackMetadata || {}),
          JSON.stringify(next.governanceResult || {}),
          JSON.stringify(next.score || {}),
          next.taskId,
          next.updatedAt,
        ],
      );

      return mapRecommendationRow(normalizeRows(result)[0]);
    },
    async createTask(record) {
      const targetId = await upsertProductTarget(query, record.target);
      const result = await query(
        `
          insert into app_public.execution_tasks (
            id,
            recommendation_id,
            source_module_key,
            target_id,
            title,
            summary,
            action_type,
            payload,
            current_status,
            approval_status,
            execution_status,
            verification_status,
            rollback_metadata,
            governance_result,
            score_payload,
            created_by,
            created_at,
            updated_at
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16, $17, $18
          )
          returning *
        `,
        [
          record.id,
          record.recommendationId,
          record.sourceModuleKey,
          targetId,
          record.title,
          record.summary,
          record.actionType,
          JSON.stringify(record.payload || {}),
          record.currentStatus,
          record.approvalStatus,
          record.executionStatus,
          record.verificationStatus,
          JSON.stringify(record.rollbackMetadata || {}),
          JSON.stringify(record.governanceResult || {}),
          JSON.stringify(record.score || {}),
          record.createdBy,
          record.createdAt,
          record.updatedAt,
        ],
      );

      return mapTaskRow(normalizeRows(result)[0]);
    },
    async listTasks(workspaceId) {
      if (workspaceId) {
        const result = await query(
          `select * from app_public.execution_tasks where workspace_id = $1 order by created_at asc`,
          [workspaceId],
        );
        return normalizeRows(result).map(mapTaskRow);
      }
      const result = await query(
        `select * from app_public.execution_tasks order by created_at asc`,
      );
      return normalizeRows(result).map(mapTaskRow);
    },
    async getTask(id) {
      const result = await query(
        `
          select *
          from app_public.execution_tasks
          where id = $1
          limit 1
        `,
        [id],
      );

      const row = normalizeRows(result)[0];
      return row ? mapTaskRow(row) : null;
    },
    async updateTask(id, patch) {
      const current = await this.getTask(id);

      if (!current) {
        return null;
      }

      const next = {
        ...current,
        ...patch,
      };

      const result = await query(
        `
          update app_public.execution_tasks
          set
            current_status = $2,
            approval_status = $3,
            execution_status = $4,
            verification_status = $5,
            rollback_metadata = $6::jsonb,
            governance_result = $7::jsonb,
            score_payload = $8::jsonb,
            updated_at = $9
          where id = $1
          returning *
        `,
        [
          id,
          next.currentStatus,
          next.approvalStatus,
          next.executionStatus,
          next.verificationStatus,
          JSON.stringify(next.rollbackMetadata || {}),
          JSON.stringify(next.governanceResult || {}),
          JSON.stringify(next.score || {}),
          next.updatedAt,
        ],
      );

      return mapTaskRow(normalizeRows(result)[0]);
    },
    async appendTaskStatusHistory(entry) {
      const result = await query(
        `
          insert into app_public.execution_task_status_history (
            task_id,
            previous_status,
            next_status,
            actor,
            reason,
            metadata,
            created_at
          )
          values ($1, $2, $3, $4, $5, $6::jsonb, $7)
          returning *
        `,
        [
          entry.taskId,
          entry.previousStatus,
          entry.nextStatus,
          entry.actor,
          entry.reason || "",
          JSON.stringify(entry.metadata || {}),
          entry.createdAt,
        ],
      );

      return mapTaskHistoryRow(normalizeRows(result)[0]);
    },
    async listTaskStatusHistory(taskId) {
      const result = await query(
        `
          select *
          from app_public.execution_task_status_history
          where task_id = $1
          order by created_at asc, id asc
        `,
        [taskId],
      );

      return normalizeRows(result).map(mapTaskHistoryRow);
    },
    async writeAuditLog(entry) {
      const result = await query(
        `
          insert into app_public.execution_audit_logs (
            entity_type,
            entity_id,
            action,
            actor,
            payload,
            created_at
          )
          values ($1, $2, $3, $4, $5::jsonb, $6)
          returning *
        `,
        [
          entry.entityType,
          entry.entityId,
          entry.action,
          entry.actor,
          JSON.stringify(entry.payload || {}),
          entry.createdAt,
        ],
      );

      return mapAuditLogRow(normalizeRows(result)[0]);
    },
    async listAuditLogs() {
      const result = await query(
        `
          select *
          from app_public.execution_audit_logs
          order by created_at asc, id asc
        `,
      );

      return normalizeRows(result).map(mapAuditLogRow);
    },
  };
}

function createInMemoryExecutionRepository() {
  const state = {
    recommendations: new Map(),
    tasks: new Map(),
    taskStatusHistory: [],
    auditLogs: [],
  };

  return {
    async createRecommendation(record) {
      state.recommendations.set(record.id, clone(record));
      return clone(record);
    },
    async listRecommendations(workspaceId) {
      const all = Array.from(state.recommendations.values()).map(clone);
      if (workspaceId) {
        return all.filter((r) => r.workspaceId === workspaceId);
      }
      return all;
    },
    async getRecommendation(id) {
      const record = state.recommendations.get(id);
      return record ? clone(record) : null;
    },
    async updateRecommendation(id, patch) {
      const current = state.recommendations.get(id);
      if (!current) {
        return null;
      }

      const next = { ...current, ...clone(patch) };
      state.recommendations.set(id, next);
      return clone(next);
    },
    async createTask(record) {
      state.tasks.set(record.id, clone(record));
      return clone(record);
    },
    async listTasks(workspaceId) {
      const all = Array.from(state.tasks.values()).map(clone);
      if (workspaceId) {
        return all.filter((t) => t.workspaceId === workspaceId);
      }
      return all;
    },
    async getTask(id) {
      const record = state.tasks.get(id);
      return record ? clone(record) : null;
    },
    async updateTask(id, patch) {
      const current = state.tasks.get(id);
      if (!current) {
        return null;
      }

      const next = { ...current, ...clone(patch) };
      state.tasks.set(id, next);
      return clone(next);
    },
    async appendTaskStatusHistory(entry) {
      const record = {
        id: randomUUID(),
        ...clone(entry),
      };
      state.taskStatusHistory.push(record);
      return clone(record);
    },
    async listTaskStatusHistory(taskId) {
      return state.taskStatusHistory
        .filter((entry) => entry.taskId === taskId)
        .map(clone);
    },
    async writeAuditLog(entry) {
      const record = {
        id: randomUUID(),
        ...clone(entry),
      };
      state.auditLogs.push(record);
      return clone(record);
    },
    async listAuditLogs() {
      return state.auditLogs.map(clone);
    },
    reset() {
      state.recommendations.clear();
      state.tasks.clear();
      state.taskStatusHistory.length = 0;
      state.auditLogs.length = 0;
    },
  };
}

module.exports = {
  createInMemoryExecutionRepository,
  createPostgresExecutionRepository,
};
