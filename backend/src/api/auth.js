const { createApiError } = require("./errors");

const SUPABASE_URL = process.env.SUPABASE_URL || null;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || null;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Warn at startup if production is running without Supabase auth configured.
if (IS_PRODUCTION && !SUPABASE_URL) {
  console.log(JSON.stringify({
    kind: "auth_degraded",
    reason: "SUPABASE_URL not set — all mutation requests will be rejected in production",
  }));
}

// When SUPABASE_URL is set, all mutation callers must provide a valid Supabase
// session JWT via Authorization: Bearer <token>. When it is not set (local dev
// or CI), we fall back to the x-neural-rank-actor header so existing tests
// and internal tooling continue to work unchanged.

async function verifySupabaseToken(token) {
  if (!SUPABASE_URL || !token) return null;

  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
      },
    });
  } catch (networkErr) {
    throw createApiError("auth_service_unavailable", "Authentication service is temporarily unavailable. Retry shortly.", 503);
  }

  if (res.status === 401 || res.status === 403) return null;

  if (!res.ok) {
    throw createApiError("auth_service_unavailable", "Authentication service returned an error. Retry shortly.", 503);
  }

  return await res.json();
}

async function resolveRequestIdentity(request) {
  const clientId = request.headers["x-neural-rank-client-id"] || null;
  const workspaceId = request.headers["x-neural-rank-workspace-id"] || null;

  const authHeader = request.headers.authorization || request.headers.Authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = await verifySupabaseToken(token);
    if (user) {
      return {
        actor: user.email || user.id,
        userId: user.id,
        email: user.email || null,
        authMethod: "supabase_jwt",
        clientId: clientId?.trim() || null,
        workspaceId: workspaceId?.trim() || null,
      };
    }

    // Bearer token present but verification failed — always reject
    return null;
  }

  // No Authorization header: in production without SUPABASE_URL, reject all
  // requests rather than silently degrading to no-auth.
  if (!SUPABASE_URL) {
    if (IS_PRODUCTION) return null;

    const actor = request.headers["x-neural-rank-actor"];
    if (typeof actor === "string" && actor.trim()) {
      return {
        actor: actor.trim(),
        userId: null,
        email: null,
        authMethod: "header",
        clientId: clientId?.trim() || null,
        workspaceId: workspaceId?.trim() || null,
      };
    }
  }

  return null;
}

function requireIdentity(identity) {
  if (!identity?.actor) {
    throw createApiError(
      "missing_actor_identity",
      SUPABASE_URL
        ? "Authentication required. Provide a valid Supabase session token in Authorization: Bearer <token>."
        : "Mutation requests require x-neural-rank-actor.",
      401,
    );
  }
}

function requireWorkspace(identity) {
  if (!identity?.workspaceId) {
    throw createApiError(
      "missing_workspace_identity",
      "Mutation requests require x-neural-rank-workspace-id.",
      400,
    );
  }
}

module.exports = {
  resolveRequestIdentity,
  requireIdentity,
  requireWorkspace,
  verifySupabaseToken,
};
