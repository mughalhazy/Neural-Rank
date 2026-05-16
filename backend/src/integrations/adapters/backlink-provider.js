const https = require("node:https");

const ADAPTER_NAME = "backlinkProviderAdapter";

const SUPPORTED_PROVIDERS = new Set(["ahrefs", "semrush", "moz"]);

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          const raw = Buffer.concat(chunks).toString("utf8");
          resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
        } catch {
          reject(new Error("Failed to parse backlink provider API response"));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Ahrefs ───────────────────────────────────────────────────────────────────

async function fetchAhrefs(apiKey, target, request = {}) {
  const limit = Math.min(request.limit || 500, 1000);

  const backlinksPath = `/v3/site-explorer/backlinks?select=url_from,domain_from,ahrefs_rank,domain_rating,anchor,url_to,first_seen,last_visited,is_dofollow&target=${encodeURIComponent(target)}&limit=${limit}&output=json`;

  const refDomainsPath = `/v3/site-explorer/referring-domains?select=domain,domain_rating,ahrefs_rank,backlinks,dofollow_backlinks&target=${encodeURIComponent(target)}&limit=200&output=json`;

  const [blRes, rdRes] = await Promise.all([
    httpsRequest({
      hostname: "apiv2.ahrefs.com",
      path: backlinksPath,
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    }),
    httpsRequest({
      hostname: "apiv2.ahrefs.com",
      path: refDomainsPath,
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    }),
  ]);

  if (blRes.statusCode !== 200) {
    throw new Error(`Ahrefs API error: ${blRes.statusCode}`);
  }

  const backlinks = (blRes.body?.backlinks || []).map((bl) => ({
    sourceUrl: bl.url_from || "",
    sourceDomain: bl.domain_from || "",
    targetUrl: bl.url_to || "",
    anchor: bl.anchor || "",
    domainAuthority: bl.domain_rating || 0,
    isDoFollow: bl.is_dofollow !== false,
    firstSeen: bl.first_seen || null,
    lastSeen: bl.last_visited || null,
    spamScore: 0,
  }));

  const referringDomains = (rdRes.body?.refdomains || []).map((rd) => ({
    domain: rd.domain || "",
    domainAuthority: rd.domain_rating || 0,
    backlinks: rd.backlinks || 0,
    doFollowBacklinks: rd.dofollow_backlinks || 0,
  }));

  return { backlinks, referringDomains };
}

// ── Semrush ──────────────────────────────────────────────────────────────────

async function fetchSemrush(apiKey, target, request = {}) {
  const limit = Math.min(request.limit || 500, 1000);

  const blParams = new URLSearchParams({
    key: apiKey,
    action: "report",
    type: "backlinks",
    target,
    target_type: "root_domain",
    display_limit: String(limit),
    export_columns: "page_ascore,source_url,target_url,anchor,external_num,nofollow,first_seen,last_seen",
  });

  const rdParams = new URLSearchParams({
    key: apiKey,
    action: "report",
    type: "backlinks_refdomains",
    target,
    target_type: "root_domain",
    display_limit: "200",
    export_columns: "domain_ascore,domain,backlinks_num",
  });

  const [blRes, rdRes] = await Promise.all([
    httpsRequest({
      hostname: "api.semrush.com",
      path: `/?${blParams.toString()}`,
      method: "GET",
      headers: { Accept: "application/json" },
    }),
    httpsRequest({
      hostname: "api.semrush.com",
      path: `/?${rdParams.toString()}`,
      method: "GET",
      headers: { Accept: "application/json" },
    }),
  ]);

  if (blRes.statusCode !== 200) {
    throw new Error(`Semrush API error: ${blRes.statusCode}`);
  }

  const blRows = blRes.body || [];
  const backlinks = Array.isArray(blRows)
    ? blRows.map((row) => ({
        sourceUrl: row.source_url || "",
        sourceDomain: extractDomain(row.source_url || ""),
        targetUrl: row.target_url || "",
        anchor: row.anchor || "",
        domainAuthority: Number(row.page_ascore || 0),
        isDoFollow: row.nofollow !== "1",
        firstSeen: row.first_seen || null,
        lastSeen: row.last_seen || null,
        spamScore: 0,
      }))
    : [];

  const rdRows = rdRes.body || [];
  const referringDomains = Array.isArray(rdRows)
    ? rdRows.map((rd) => ({
        domain: rd.domain || "",
        domainAuthority: Number(rd.domain_ascore || 0),
        backlinks: Number(rd.backlinks_num || 0),
        doFollowBacklinks: 0,
      }))
    : [];

  return { backlinks, referringDomains };
}

// ── Moz ──────────────────────────────────────────────────────────────────────

async function fetchMoz(apiKey, target, request = {}) {
  const limit = Math.min(request.limit || 500, 1000);

  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id: "nr-backlinks",
    method: "data.site.metrics.fetch",
    params: { site: target },
  });

  const blPayload = JSON.stringify({
    jsonrpc: "2.0",
    id: "nr-links",
    method: "data.links.fetch",
    params: {
      target,
      scope: "site.to.url",
      limit,
      select: ["anchor_text", "source.url", "source.domain_authority", "link_type", "first_seen", "last_seen"],
    },
  });

  const [metricsRes, linksRes] = await Promise.all([
    httpsRequest(
      {
        hostname: "api.moz.com",
        path: "/jsonrpc",
        method: "POST",
        headers: {
          "x-moz-token": apiKey,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      payload
    ),
    httpsRequest(
      {
        hostname: "api.moz.com",
        path: "/jsonrpc",
        method: "POST",
        headers: {
          "x-moz-token": apiKey,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(blPayload),
        },
      },
      blPayload
    ),
  ]);

  if (linksRes.statusCode !== 200) {
    throw new Error(`Moz API error: ${linksRes.statusCode}`);
  }

  const links = linksRes.body?.result?.results_by_index?.["0"]?.links || [];
  const backlinks = links.map((link) => ({
    sourceUrl: link.source?.url || "",
    sourceDomain: extractDomain(link.source?.url || ""),
    targetUrl: target,
    anchor: link.anchor_text || "",
    domainAuthority: link.source?.domain_authority || 0,
    isDoFollow: link.link_type !== "nofollow",
    firstSeen: link.first_seen || null,
    lastSeen: link.last_seen || null,
    spamScore: link.source?.spam_score || 0,
  }));

  const domainMetrics = metricsRes.body?.result || {};
  const referringDomains = [
    {
      domain: target,
      domainAuthority: domainMetrics.domain_authority || 0,
      backlinks: domainMetrics.linking_domains || 0,
      doFollowBacklinks: 0,
    },
  ];

  return { backlinks, referringDomains };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractDomain(url) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

// Returns a flat list of referring-domain objects { domain, domainAuthority, backlinks, doFollowBacklinks }
// that link to at least one competitor. The backlink-intelligence module compares this flat list
// against the target's own referringDomains to identify link-gap opportunities.
async function fetchCompetitorBacklinks(provider, apiKey, competitors = [], request = {}) {
  const seen = new Set();
  const flat = [];

  for (const competitor of competitors.slice(0, 3)) {
    try {
      let data = { backlinks: [], referringDomains: [] };
      if (provider === "ahrefs") data = await fetchAhrefs(apiKey, competitor, { ...request, limit: 100 });
      else if (provider === "semrush") data = await fetchSemrush(apiKey, competitor, { ...request, limit: 100 });
      else if (provider === "moz") data = await fetchMoz(apiKey, competitor, { ...request, limit: 100 });

      for (const rd of data.referringDomains) {
        const key = rd.domain;
        if (key && !seen.has(key)) {
          seen.add(key);
          flat.push({
            domain: rd.domain,
            domainAuthority: rd.domainAuthority || 0,
            backlinks: rd.backlinks || 0,
            doFollowBacklinks: rd.doFollowBacklinks || 0,
          });
        }
      }
    } catch {
      // skip failed competitor lookups — don't block the main result
    }
  }

  return flat;
}

async function collect(context = {}, request = {}) {
  const bl = context.backlinkCredentials || context.credentials?.backlinkProvider || {};
  const provider = (bl.provider || context.backlinkProvider || process.env.BACKLINK_PROVIDER || "").toLowerCase();
  const apiKey = bl.apiKey || bl.api_key || context.backlinkApiKey || process.env.BACKLINK_API_KEY || null;
  const target = bl.target || request.target || context.targetDomain || process.env.BACKLINK_TARGET || null;

  if (!provider || !SUPPORTED_PROVIDERS.has(provider)) {
    return {
      status: "integration_not_connected",
      moduleKey: "backlink_intelligence",
      reason: `Backlink provider not set or unsupported. Supported: ${[...SUPPORTED_PROVIDERS].join(", ")}.`,
      normalizedPayload: {},
    };
  }

  if (!apiKey || !target) {
    return {
      status: "integration_not_connected",
      moduleKey: "backlink_intelligence",
      reason: `Backlink provider credentials (apiKey + target) not found for provider: ${provider}.`,
      normalizedPayload: {},
    };
  }

  try {
    let data = { backlinks: [], referringDomains: [] };

    if (provider === "ahrefs") data = await fetchAhrefs(apiKey, target, request);
    else if (provider === "semrush") data = await fetchSemrush(apiKey, target, request);
    else if (provider === "moz") data = await fetchMoz(apiKey, target, request);

    const competitors = request.competitors || context.competitors || [];
    const competitorBacklinks = await fetchCompetitorBacklinks(provider, apiKey, competitors, request);

    return {
      status: "integration_connected",
      normalizedPayload: {
        domain: target,
        backlinks: data.backlinks,
        referringDomains: data.referringDomains,
        competitorBacklinks,
      },
    };
  } catch (err) {
    return {
      status: "integration_error",
      reason: err.message,
      normalizedPayload: {},
    };
  }
}

async function normalizeInput(context = {}, request = {}) {
  const result = await collect(context, request);
  return { ...result, normalizedPayload: result.normalizedPayload || {} };
}

module.exports = {
  adapterName: ADAPTER_NAME,
  supportsCollection: true,
  isImplemented: true,
  collect,
  normalizeInput,
};
