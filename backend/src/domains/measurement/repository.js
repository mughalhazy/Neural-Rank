const { resolveQueryFunction } = require("../../core/persistence");
const { clone, normalizeRows, upsertProductTarget } = require("../../core/dbUtils");

function mapSnapshotRow(row = {}) {
  return {
    id: row.id,
    snapshotKind: row.snapshot_kind,
    metricId: row.metric_id,
    targetId: row.target_id || null,
    recommendationId: row.recommendation_id || null,
    taskId: row.task_id || null,
    changeId: row.change_id || null,
    metricValue: row.metric_value === null || row.metric_value === undefined ? null : Number(row.metric_value),
    rawValue: row.raw_value || null,
    valueStatus: row.value_status,
    observedAt: row.observed_at,
    sourceRef: row.source_ref || null,
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

function mapAttributionRow(row = {}) {
  return {
    id: row.id,
    recommendationId: row.recommendation_id || null,
    taskId: row.task_id || null,
    changeId: row.change_id || null,
    metricId: row.metric_id,
    baselineSnapshotId: row.baseline_snapshot_id || null,
    postChangeSnapshotId: row.post_change_snapshot_id || null,
    confidence: row.confidence === null || row.confidence === undefined ? null : Number(row.confidence),
    impactClassification: row.impact_classification,
    rationale: row.rationale || "",
    createdAt: row.created_at,
  };
}

function mapMetricSourceRow(row = {}) {
  return {
    metricId: row.metric_id,
    displayName: row.display_name,
    sourceStatus: row.source_status,
    supportsNumericValue: row.supports_numeric_value,
    createdAt: row.created_at,
  };
}

function createPostgresMeasurementRepository(context = {}) {
  const query = resolveQueryFunction(context);

  if (!query) {
    throw new Error("measurement_query_not_configured");
  }

  return {
    async upsertMetricSource(metricSource) {
      const result = await query(
        `
          insert into app_public.measurement_metric_sources (
            metric_id,
            display_name,
            source_status,
            supports_numeric_value
          )
          values ($1, $2, $3, $4)
          on conflict (metric_id)
          do update set
            display_name = excluded.display_name,
            source_status = excluded.source_status,
            supports_numeric_value = excluded.supports_numeric_value
          returning *
        `,
        [
          metricSource.metricId,
          metricSource.displayName,
          metricSource.sourceStatus,
          metricSource.supportsNumericValue,
        ],
      );

      return mapMetricSourceRow(normalizeRows(result)[0]);
    },
    async listMetricSources() {
      const result = await query(
        `
          select *
          from app_public.measurement_metric_sources
          order by metric_id asc
        `,
      );

      return normalizeRows(result).map(mapMetricSourceRow);
    },
    async createSnapshot(record) {
      const targetId = await upsertProductTarget(query, record.target);
      const result = await query(
        `
          insert into app_public.measurement_snapshots (
            id,
            snapshot_kind,
            metric_id,
            target_id,
            recommendation_id,
            task_id,
            change_id,
            metric_value,
            raw_value,
            value_status,
            observed_at,
            source_ref,
            notes,
            created_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14)
          returning *
        `,
        [
          record.id,
          record.snapshotKind,
          record.metricId,
          targetId,
          record.recommendationId,
          record.taskId,
          record.changeId,
          record.metricValue,
          JSON.stringify(record.rawValue),
          record.valueStatus,
          record.observedAt,
          record.sourceRef,
          record.notes,
          record.createdAt,
        ],
      );

      return mapSnapshotRow(normalizeRows(result)[0]);
    },
    async getSnapshot(id) {
      const result = await query(
        `
          select *
          from app_public.measurement_snapshots
          where id = $1
          limit 1
        `,
        [id],
      );

      const row = normalizeRows(result)[0];
      return row ? mapSnapshotRow(row) : null;
    },
    async createAttribution(record) {
      const result = await query(
        `
          insert into app_public.measurement_attribution_links (
            id,
            recommendation_id,
            task_id,
            change_id,
            metric_id,
            baseline_snapshot_id,
            post_change_snapshot_id,
            confidence,
            impact_classification,
            rationale,
            created_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          returning *
        `,
        [
          record.id,
          record.recommendationId,
          record.taskId,
          record.changeId,
          record.metricId,
          record.baselineSnapshotId,
          record.postChangeSnapshotId,
          record.confidence,
          record.impactClassification,
          record.rationale,
          record.createdAt,
        ],
      );

      return mapAttributionRow(normalizeRows(result)[0]);
    },
    async getAttribution(id) {
      const result = await query(
        `
          select *
          from app_public.measurement_attribution_links
          where id = $1
          limit 1
        `,
        [id],
      );

      const row = normalizeRows(result)[0];
      return row ? mapAttributionRow(row) : null;
    },
  };
}

function createInMemoryMeasurementRepository() {
  const state = {
    metricSources: new Map(),
    snapshots: new Map(),
    attributions: new Map(),
  };

  return {
    async upsertMetricSource(metricSource) {
      const record = clone(metricSource);
      state.metricSources.set(metricSource.metricId, record);
      return clone(record);
    },
    async listMetricSources() {
      return Array.from(state.metricSources.values()).map(clone);
    },
    async createSnapshot(record) {
      state.snapshots.set(record.id, clone(record));
      return clone(record);
    },
    async getSnapshot(id) {
      const record = state.snapshots.get(id);
      return record ? clone(record) : null;
    },
    async createAttribution(record) {
      state.attributions.set(record.id, clone(record));
      return clone(record);
    },
    async getAttribution(id) {
      const record = state.attributions.get(id);
      return record ? clone(record) : null;
    },
    reset() {
      state.metricSources.clear();
      state.snapshots.clear();
      state.attributions.clear();
    },
  };
}

module.exports = {
  createInMemoryMeasurementRepository,
  createPostgresMeasurementRepository,
};
