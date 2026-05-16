const {
  resolveCanonicalRef,
  resolveQueryFunction,
  resolveTargetKind,
} = require("../../core/persistence");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeRows(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.rows)) {
    return result.rows;
  }

  return [];
}

async function upsertProductTarget(query, target = {}) {
  const result = await query(
    `
      insert into app_public.product_targets (
        target_kind,
        canonical_ref
      )
      values ($1, $2)
      on conflict (target_kind, canonical_ref)
      do update set
        updated_at = now()
      returning id
    `,
    [resolveTargetKind(target), resolveCanonicalRef(target)],
  );

  return normalizeRows(result)[0]?.id || null;
}

function mapBusinessProfileRow(row = {}) {
  return {
    id: row.id,
    businessObjective: row.business_objective || null,
    targetId: row.target_id || null,
    targetPage: row.target_page || null,
    funnelStage: row.funnel_stage || null,
    leadRevenueRelevance:
      row.lead_revenue_relevance === null || row.lead_revenue_relevance === undefined
        ? null
        : Number(row.lead_revenue_relevance),
    conversionRisk:
      row.conversion_risk === null || row.conversion_risk === undefined
        ? null
        : Number(row.conversion_risk),
    contentRoiScore:
      row.content_roi_score === null || row.content_roi_score === undefined
        ? null
        : Number(row.content_roi_score),
    targetPageValue:
      row.target_page_value === null || row.target_page_value === undefined
        ? null
        : Number(row.target_page_value),
    highValueKeywords: row.high_value_keywords || [],
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

function createPostgresBusinessIntelligenceRepository(context = {}) {
  const query = resolveQueryFunction(context);

  if (!query) {
    throw new Error("business_intelligence_query_not_configured");
  }

  return {
    async createBusinessProfile(record) {
      const targetId = await upsertProductTarget(query, record.target);
      const result = await query(
        `
          insert into app_public.business_intelligence_profiles (
            id,
            target_id,
            business_objective,
            target_page,
            funnel_stage,
            lead_revenue_relevance,
            conversion_risk,
            content_roi_score,
            target_page_value,
            high_value_keywords,
            notes,
            created_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
          returning *
        `,
        [
          record.id,
          targetId,
          record.businessObjective,
          record.targetPage,
          record.funnelStage,
          record.leadRevenueRelevance,
          record.conversionRisk,
          record.contentRoiScore,
          record.targetPageValue,
          JSON.stringify(record.highValueKeywords || []),
          record.notes,
          record.createdAt,
        ],
      );

      return mapBusinessProfileRow(normalizeRows(result)[0]);
    },
    async listBusinessProfiles() {
      const result = await query(
        `
          select *
          from app_public.business_intelligence_profiles
          order by created_at asc
        `,
      );

      return normalizeRows(result).map(mapBusinessProfileRow);
    },
  };
}

function createInMemoryBusinessIntelligenceRepository() {
  const state = {
    profiles: new Map(),
  };

  return {
    async createBusinessProfile(record) {
      state.profiles.set(record.id, clone(record));
      return clone(record);
    },
    async listBusinessProfiles() {
      return Array.from(state.profiles.values()).map(clone);
    },
    reset() {
      state.profiles.clear();
    },
  };
}

module.exports = {
  createInMemoryBusinessIntelligenceRepository,
  createPostgresBusinessIntelligenceRepository,
};
