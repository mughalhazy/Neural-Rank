const { createApiError } = require("./errors");

const SUPABASE_URL = process.env.SUPABASE_URL || null;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || null;

// When SUPABASE_URL is set, all mutation callers must provide a valid Supabase
// session JWT via Authorization: Bearer <token>. When it is not set (local dev
// or CI), we fall back to the x-neural-rank-actor header so existing tests
// and internal tooling continue to work unchanged.

async function verifySupabaseToken(token) {
  if (!SUPABASE_URL || !token) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
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

  // No Authorization header: fall back to actor header only when Supabase is
  // not configured (non-production environments).
  if (!SUPABASE_URL) {
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
