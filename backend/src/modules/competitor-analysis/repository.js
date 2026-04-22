const MODULE_KEY = "competitor_analysis";

function resolveQueryAdapter(context = {}) {
  return (
    context.query ||
    context?.db?.query ||
    context?.pg?.query ||
    null
  );
}

function resolveExplicitRepository(context = {}) {
  return (
    context.competitorAnalysisRepository ||
    context?.repositories?.competitorAnalysis ||
    null
  );
}

function createQueryBackedRepository(query) {
  return {
    async saveRun({ productTarget, inputPayload, analysisPayload, insightPayload, actionPayload }) {
      const upsertTargetSql = `
        insert into app_public.product_targets (
          target_ref,
          target_type,
          website_url,
          app_id,
          app_store_url,
          play_store_url
        ) values ($1, $2, $3, $4, $5, $6)
        on conflict (target_ref)
        do update set
          target_type = excluded.target_type,
          website_url = excluded.website_url,
          app_id = excluded.app_id,
          app_store_url = excluded.app_store_url,
          play_store_url = excluded.play_store_url,
          updated_at = now()
        returning id
      `;

      const targetResult = await query(upsertTargetSql, [
        productTarget.targetRef,
        productTarget.targetType,
        productTarget.websiteUrl,
        productTarget.appId,
        productTarget.appStoreUrl,
        productTarget.playStoreUrl,
      ]);

      const productTargetId =
        targetResult?.rows?.[0]?.id ||
        targetResult?.[0]?.id ||
        null;

      const insertRunSql = `
        insert into app_public.competitor_analysis_records (
          product_target_id,
          module_key,
          input_payload,
          analysis_payload,
          insight_payload,
          priority_payload,
          action_payload
        ) values ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)
        returning id
      `;

      return query(insertRunSql, [
        productTargetId,
        MODULE_KEY,
        JSON.stringify(inputPayload),
        JSON.stringify(analysisPayload),
        JSON.stringify(insightPayload),
        JSON.stringify(actionPayload),
        JSON.stringify(actionPayload),
      ]);
    },
  };
}

function resolveCompetitorAnalysisRepository(context = {}) {
  const explicitRepository = resolveExplicitRepository(context);
  if (explicitRepository) {
    return explicitRepository;
  }

  const query = resolveQueryAdapter(context);
  if (!query) {
    return null;
  }

  return createQueryBackedRepository(query);
}

module.exports = {
  resolveCompetitorAnalysisRepository,
};
