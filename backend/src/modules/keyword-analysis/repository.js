const MODULE_KEY = "keyword_analysis";

function resolveQueryFunction(context = {}) {
  if (typeof context.query === "function") {
    return context.query.bind(context);
  }

  if (typeof context.db?.query === "function") {
    return context.db.query.bind(context.db);
  }

  if (typeof context.pg?.query === "function") {
    return context.pg.query.bind(context.pg);
  }

  return null;
}

function resolveKeywordAnalysisRepository(context = {}) {
  return (
    context.keywordAnalysisRepository ||
    context.repositories?.keywordAnalysis ||
    null
  );
}

function createPostgresKeywordAnalysisRepository(query) {
  return {
    async saveRun({ productTarget, inputPayload, analysisPayload, insightPayload, actionPayload }) {
      const targetResult = await query(
        `
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
        `,
        [
          productTarget.targetRef,
          productTarget.targetType,
          productTarget.websiteUrl,
          productTarget.appId,
          productTarget.appStoreUrl,
          productTarget.playStoreUrl,
        ],
      );

      const productTargetId =
        targetResult?.rows?.[0]?.id ||
        targetResult?.[0]?.id ||
        null;

      return query(
        `
          insert into app_public.keyword_analysis_records (
            product_target_id,
            module_key,
            input_payload,
            analysis_payload,
            insight_payload,
            priority_payload,
            action_payload
          )
          values ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)
          returning id
        `,
        [
          productTargetId,
          MODULE_KEY,
          JSON.stringify(inputPayload),
          JSON.stringify(analysisPayload),
          JSON.stringify(insightPayload),
          JSON.stringify(actionPayload),
          JSON.stringify(actionPayload),
        ],
      );
    },
  };
}

async function persistKeywordAnalysisRun(context = {}, payload) {
  const explicitRepository = resolveKeywordAnalysisRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresKeywordAnalysisRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return {
      persisted: false,
      reason: "keyword_analysis_repository_not_configured",
    };
  }

  const savedRecord = await repository.saveRun(payload);

  return {
    persisted: true,
    savedRecord,
  };
}

module.exports = {
  createPostgresKeywordAnalysisRepository,
  persistKeywordAnalysisRun,
  resolveKeywordAnalysisRepository,
};
