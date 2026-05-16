function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

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

function resolveTargetKind(productTarget = {}) {
  const explicitType = normalizeText(productTarget.targetType).toLowerCase();

  if (explicitType === "app" || explicitType === "app_target") {
    return "app";
  }

  if (explicitType === "website" || explicitType === "product_target") {
    return "website";
  }

  if (
    normalizeText(productTarget.appId) ||
    normalizeText(productTarget.appStoreUrl) ||
    normalizeText(productTarget.playStoreUrl)
  ) {
    return "app";
  }

  return "website";
}

function resolveCanonicalRef(productTarget = {}) {
  return (
    normalizeText(productTarget.targetRef) ||
    normalizeText(productTarget.websiteUrl) ||
    normalizeText(productTarget.appStoreUrl) ||
    normalizeText(productTarget.playStoreUrl) ||
    normalizeText(productTarget.appId) ||
    "unknown_target"
  );
}

function createPostgresModuleRunRepository({ recordsTable, query }) {
  return {
    async saveRun({
      productTarget = {},
      inputPayload = {},
      analysisPayload = {},
      insightPayload = [],
      priorityPayload,
      actionPayload = [],
      integrationState = "internal_only",
      processingStatus = "completed",
    }) {
      const resolvedPriorityPayload = Array.isArray(priorityPayload)
        ? priorityPayload
        : actionPayload;

      const targetResult = await query(
        `
          insert into app_public.product_targets (
            target_kind,
            canonical_ref
          ) values ($1, $2)
          on conflict (target_kind, canonical_ref)
          do update set
            updated_at = now()
          returning id
        `,
        [
          resolveTargetKind(productTarget),
          resolveCanonicalRef(productTarget),
        ],
      );

      const targetId =
        targetResult?.rows?.[0]?.id ||
        targetResult?.[0]?.id ||
        null;

      return query(
        `
          insert into app_public.${recordsTable} (
            target_id,
            integration_state,
            input_payload,
            analysis_payload,
            insights_payload,
            priority_payload,
            actions_payload,
            processing_status
          )
          values ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8)
          returning id
        `,
        [
          targetId,
          integrationState,
          JSON.stringify(inputPayload),
          JSON.stringify(analysisPayload),
          JSON.stringify(insightPayload),
          JSON.stringify(resolvedPriorityPayload),
          JSON.stringify(actionPayload),
          processingStatus,
        ],
      );
    },
  };
}

module.exports = {
  createPostgresModuleRunRepository,
  resolveCanonicalRef,
  resolveQueryFunction,
  resolveTargetKind,
};
