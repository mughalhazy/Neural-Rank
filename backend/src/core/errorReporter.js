const { randomUUID } = require("node:crypto");
const { request: httpsRequest } = require("node:https");

let sentryProjectId = null;
let sentryPublicKey = null;

if (process.env.SENTRY_DSN) {
  try {
    const url = new URL(process.env.SENTRY_DSN);
    sentryPublicKey = url.username;
    sentryProjectId = url.pathname.replace(/^\/+/, "");
  } catch {
    // invalid DSN — Sentry disabled
  }
}

function parseStack(stack = "") {
  return stack.split("\n").slice(1, 8).map((line) => ({ filename: line.trim() }));
}

// Fire-and-forget POST to Sentry HTTP API — zero npm dependency.
// No-op when SENTRY_DSN is absent or invalid.
function reportError(error, context = {}) {
  if (!sentryProjectId || !sentryPublicKey) return;

  const event = JSON.stringify({
    event_id: randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: "node",
    level: "error",
    message: error?.message || String(error),
    exception: {
      values: [{
        type: error?.name || "Error",
        value: error?.message || String(error),
        stacktrace: error?.stack ? { frames: parseStack(error.stack) } : undefined,
      }],
    },
    tags: context.tags || {},
    extra: context.extra || {},
  });

  const req = httpsRequest(
    {
      hostname: "sentry.io",
      path: `/api/${sentryProjectId}/store/`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(event),
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${sentryPublicKey}`,
      },
    },
    () => {},
  );
  req.on("error", () => {});
  req.write(event);
  req.end();
}

module.exports = { reportError };
