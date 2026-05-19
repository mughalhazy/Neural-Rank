const {
  resolveCanonicalRef,
  resolveTargetKind,
} = require("./persistence");

// structuredClone is available in Node.js 17+. Falls back to JSON round-trip for older versions.
function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  // Fallback: handles primitives, plain objects, arrays. Does NOT handle Date, Symbol, undefined.
  return JSON.parse(JSON.stringify(value));
}

function normalizeRows(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.rows)) return result.rows;
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

module.exports = { clone, normalizeRows, upsertProductTarget };
