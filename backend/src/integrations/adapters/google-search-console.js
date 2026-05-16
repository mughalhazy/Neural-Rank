const https = require("node:https");

const ADAPTER_NAME = "googleSearchConsoleAdapter";
const GSC_API_BASE = "searchconsole.googleapis.com";

function resolveCredentials(context = {}) {
  const gsc = context.gscCredentials || context.credentials?.googleSearchConsole || {};
  return {
    accessToken: gsc.accessToken || gsc.access_token || process.env.GSC_ACCESS_TOKEN || null,
    siteUrl: gsc.siteUrl || gsc.site_url || context.siteUrl || process.env.GSC_SITE_URL || null,
  };
}

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
          reject(new Error("Failed to parse GSC API response"));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function fetchSearchAnalytics(accessToken, siteUrl, request = {}) {
  const startDate = request.startDate || offsetDate(-90);
  const endDate = request.endDate || offsetDate(-3);
  const rowLimit = Math.min(request.rowLimit || 500, 25000);

  const payload = JSON.stringify({
    startDate,
    endDate,
    dimensions: ["query", "page"],
    rowLimit,
    dataState: "all",
  });

  const encodedSite = encodeURIComponent(siteUrl);
  const result = await httpsRequest({
    hostname: GSC_API_BASE,
    path: `/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  }, payload);

  if (result.statusCode !== 200) {
    throw new Error(`GSC Search Analytics API error: ${result.statusCode}`);
  }

  return (result.body.rows || []).map((row) => ({
    query: row.keys[0] || "",
    page: row.keys[1] || "",
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || null,
  }));
}

async function fetchIndexCoverage(accessToken, siteUrl) {
  const encodedSite = encodeURIComponent(siteUrl);
  const result = await httpsRequest({
    hostname: GSC_API_BASE,
    path: `/webmasters/v3/sites/${encodedSite}/sitemaps`,
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (result.statusCode !== 200) {
    return { validIndexed: 0, warnings: 0, errors: 0, excluded: 0 };
  }

  const sitemaps = result.body.sitemap || [];
  return {
    validIndexed: sitemaps.reduce((s, sm) => s + (sm.contents?.[0]?.submitted || 0), 0),
    warnings: 0,
    errors: 0,
    excluded: 0,
    sitemaps: sitemaps.map((sm) => sm.path),
  };
}

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function collect(context = {}, request = {}) {
  const { accessToken, siteUrl } = resolveCredentials(context);

  if (!accessToken || !siteUrl) {
    return {
      status: "integration_not_connected",
      moduleKey: "rank_tracking",
      reason: "GSC credentials (accessToken + siteUrl) not found in context or environment.",
      normalizedPayload: {},
    };
  }

  try {
    const [searchAnalytics, indexCoverage] = await Promise.all([
      fetchSearchAnalytics(accessToken, siteUrl, request),
      fetchIndexCoverage(accessToken, siteUrl),
    ]);

    return {
      status: "integration_connected",
      normalizedPayload: {
        gscData: {
          searchAnalytics,
          indexCoverage,
          crawlErrors: [],
          coreWebVitals: {},
        },
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

async function collectForRankTracking(context = {}, request = {}) {
  const { accessToken, siteUrl } = resolveCredentials(context);

  if (!accessToken || !siteUrl) {
    return {
      status: "integration_not_connected",
      moduleKey: "rank_tracking",
      reason: "GSC credentials not found.",
      normalizedPayload: {},
    };
  }

  try {
    const rows = await fetchSearchAnalytics(accessToken, siteUrl, { ...request, rowLimit: 200 });

    const rankEntries = rows
      .filter((r) => r.query && r.position)
      .map((r, i) => ({
        rankId: `gsc_${i + 1}`,
        keyword: r.query,
        currentPosition: Math.round(r.position),
        previousPosition: null,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        rankingUrl: r.page,
      }));

    return {
      status: "integration_connected",
      normalizedPayload: { rankEntries },
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
  collectForRankTracking,
  normalizeInput,
};
