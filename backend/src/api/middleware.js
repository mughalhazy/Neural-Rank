"use strict";

const { randomUUID } = require("node:crypto");
const { resolveRequestIdentity } = require("./auth");
const {
  DEFAULT_LIMIT,
  MUTATION_LIMIT,
  checkLimit,
  getIpKey,
  getActorKey,
} = require("../core/rateLimiter");

// compose(...middlewares) → async (req, res, ctx) → ctx | null
// Each middleware returns the updated context or null to abort (response already sent).
function compose(...middlewares) {
  return async (req, res, ctx) => {
    let current = ctx;
    for (const mw of middlewares) {
      const result = await mw(req, res, current);
      if (result === null) return null;
      current = result;
    }
    return current;
  };
}

async function withCorrelationId(req, res, ctx) {
  const correlationId = req.headers["x-request-id"] || randomUUID();
  res.setHeader("X-Request-ID", correlationId);
  return { ...ctx, correlationId };
}

async function withIdentity(req, res, ctx) {
  const identity = await resolveRequestIdentity(req);
  return { ...ctx, identity };
}

async function withRateLimit(req, res, ctx) {
  const ipResult = checkLimit(getIpKey(req), DEFAULT_LIMIT);
  if (!ipResult.allowed) {
    sendTooManyRequests(res, ipResult);
    return null;
  }

  const { actor = null, isMutation = false } = ctx.rateLimitOptions || {};
  if (isMutation && actor) {
    const actorResult = checkLimit(getActorKey(actor), MUTATION_LIMIT);
    if (!actorResult.allowed) {
      sendTooManyRequests(res, actorResult);
      return null;
    }
    return { ...ctx, rl: actorResult };
  }

  return { ...ctx, rl: ipResult };
}

async function withBody(req, res, ctx) {
  const body = await readJsonBody(req);
  return { ...ctx, body };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function sendTooManyRequests(res, info) {
  const body = JSON.stringify({
    ok: false,
    data: null,
    error: {
      code: "rate_limit_exceeded",
      message: `Rate limit of ${info.limit} requests/minute exceeded. Retry after ${Math.ceil((info.resetAt - Date.now()) / 1000)}s.`,
    },
    meta: {},
  });
  res.writeHead(429, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "X-RateLimit-Limit": String(info.limit),
    "X-RateLimit-Remaining": String(info.remaining),
    "X-RateLimit-Reset": String(Math.ceil(info.resetAt / 1000)),
    "X-RateLimit-Policy": `${info.limit};w=60`,
    "X-RateLimit-Enforced": "true",
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let oversized = false;
    req.on("data", (chunk) => {
      if (oversized) return;
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        oversized = true;
        reject(new Error("payload_too_large"));
        req.pause();
      }
    });
    req.on("end", () => {
      if (oversized) return;
      if (!raw.trim()) { resolve({}); return; }
      try { resolve(JSON.parse(raw)); } catch { reject(new Error("invalid_json")); }
    });
    req.on("error", reject);
  });
}

module.exports = { compose, withCorrelationId, withIdentity, withRateLimit, withBody };
