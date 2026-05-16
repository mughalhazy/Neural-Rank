const https = require("node:https");

const ADAPTER_NAME = "googleAnalytics4Adapter";
const GA4_API_BASE = "analyticsdata.googleapis.com";

function resolveCredentials(context = {}) {
  const ga4 = context.ga4Credentials || context.credentials?.googleAnalytics4 || {};
  return {
    accessToken: ga4.accessToken || ga4.access_token || process.env.GA4_ACCESS_TOKEN || null,
    propertyId: ga4.propertyId || ga4.property_id || context.ga4PropertyId || process.env.GA4_PROPERTY_ID || null,
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
          reject(new Error("Failed to parse GA4 API response"));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function fetchOrganicLandingPages(accessToken, propertyId, request = {}) {
  const startDate = request.startDate || offsetDate(-90);
  const endDate = request.endDate || offsetDate(-1);
  const prevStartDate = request.prevStartDate || offsetDate(-180);
  const prevEndDate = request.prevEndDate || offsetDate(-91);

  const payload = JSON.stringify({
    dateRanges: [
      { startDate, endDate },
      { startDate: prevStartDate, endDate: prevEndDate },
    ],
    dimensions: [{ name: "landingPagePlusQueryString" }, { name: "sessionDefaultChannelGroup" }],
    metrics: [
      { name: "sessions" },
      { name: "conversions" },
      { name: "bounceRate" },
    ],
    dimensionFilter: {
      filter: {
        fieldName: "sessionDefaultChannelGroup",
        stringFilter: { matchType: "EXACT", value: "Organic Search" },
      },
    },
    limit: 200,
  });

  const result = await httpsRequest({
    hostname: GA4_API_BASE,
    path: `/v1beta/properties/${propertyId}:runReport`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  }, payload);

  if (result.statusCode !== 200) {
    throw new Error(`GA4 API error: ${result.statusCode} — ${JSON.stringify(result.body?.error || {})}`);
  }

  const rows = result.body.rows || [];
  const pageMetrics = [];

  for (const row of rows) {
    const url = row.dimensionValues?.[0]?.value || "";
    const currentSessions = Number(row.metricValues?.[0]?.value || 0);
    const prevSessions = Number(row.metricValues?.[3]?.value || 0);
    const conversions = Number(row.metricValues?.[1]?.value || 0);
    const bounceRate = Number(row.metricValues?.[2]?.value || 0);

    if (url && url !== "(not set)") {
      pageMetrics.push({
        url,
        organicSessions: currentSessions,
        organicSessionsPrev: prevSessions || null,
        conversions,
        bounceRate: Math.round(bounceRate * 100) / 100,
      });
    }
  }

  const totalOrganicSessions = pageMetrics.reduce((s, p) => s + p.organicSessions, 0);

  return { pageMetrics, totalOrganicSessions };
}

async function collect(context = {}, request = {}) {
  const { accessToken, propertyId } = resolveCredentials(context);

  if (!accessToken || !propertyId) {
    return {
      status: "integration_not_connected",
      moduleKey: "analytics_integration",
      reason: "GA4 credentials (accessToken + propertyId) not found in context or environment.",
      normalizedPayload: {},
    };
  }

  try {
    const { pageMetrics, totalOrganicSessions } = await fetchOrganicLandingPages(accessToken, propertyId, request);

    return {
      status: "integration_connected",
      normalizedPayload: {
        ga4Data: { pageMetrics, totalOrganicSessions },
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
