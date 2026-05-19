const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 120;
const MUTATION_LIMIT = 30;
const TRUSTED_PROXY_COUNT = Number(process.env.TRUSTED_PROXY_COUNT) || 1;
const IP_PATTERN = /^[\d.:a-fA-F]+$/;

const store = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      store.delete(key);
    }
  }
}

setInterval(cleanupOldEntries, 5 * 60_000).unref();

function checkLimit(key, limit = DEFAULT_LIMIT) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + WINDOW_MS, limit };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return {
    allowed: entry.count <= limit,
    remaining,
    resetAt: entry.windowStart + WINDOW_MS,
    limit,
  };
}

function getIpKey(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim());
    const candidateIndex = Math.max(0, parts.length - TRUSTED_PROXY_COUNT);
    const candidate = parts[candidateIndex];
    if (candidate && IP_PATTERN.test(candidate)) {
      return `ip:${candidate}`;
    }
  }
  return `ip:${request.socket?.remoteAddress || "unknown"}`;
}

function getActorKey(actor) {
  return `actor:${actor}`;
}

function resetForTests() {
  store.clear();
}

module.exports = {
  DEFAULT_LIMIT,
  MUTATION_LIMIT,
  checkLimit,
  getIpKey,
  getActorKey,
  resetForTests,
};
