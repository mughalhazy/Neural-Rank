const https = require("node:https");

const ADAPTER_NAME = "pageSpeedInsightsAdapter";
const PSI_API_BASE = "www.googleapis.com";

function resolveCredentials(context = {}) {
  return {
    apiKey:
      context.pageSpeedApiKey ||
      context.credentials?.pageSpeed?.apiKey ||
      process.env.PAGESPEED_API_KEY ||
      null,
  };
}

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          const raw = Buffer.concat(chunks).toString("utf8");
          resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
        } catch {
          reject(new Error("Failed to parse PageSpeed Insights API response"));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function extractLighthouseMetric(lhr, auditId) {
  return lhr?.audits?.[auditId]?.numericValue ?? null;
}

function extractCategoryScore(lhr, categoryId) {
  const score = lhr?.categories?.[categoryId]?.score;
  return score != null ? Math.round(score * 100) : null;
}

function extractCwvMetrics(lhr) {
  const lcpMs = extractLighthouseMetric(lhr, "largest-contentful-paint");
  const clsRaw = extractLighthouseMetric(lhr, "cumulative-layout-shift");
  const inpMs = extractLighthouseMetric(lhr, "interaction-to-next-paint");
  const fidMs = extractLighthouseMetric(lhr, "max-potential-fid");
  const ttfbMs = extractLighthouseMetric(lhr, "server-response-time");
  const tbtMs = extractLighthouseMetric(lhr, "total-blocking-time");
  const siMs = extractLighthouseMetric(lhr, "speed-index");
  const fciMs = extractLighthouseMetric(lhr, "first-contentful-paint");

  return {
    lcp: lcpMs != null ? Math.round(lcpMs) : null,
    cls: clsRaw != null ? Math.round(clsRaw * 1000) / 1000 : null,
    inp: inpMs != null ? Math.round(inpMs) : null,
    fid: fidMs != null ? Math.round(fidMs) : null,
    ttfb: ttfbMs != null ? Math.round(ttfbMs) : null,
    tbt: tbtMs != null ? Math.round(tbtMs) : null,
    si: siMs != null ? Math.round(siMs) : null,
    fcp: fciMs != null ? Math.round(fciMs) : null,
  };
}

function classifyLcp(ms) {
  if (ms == null) return "unknown";
  if (ms <= 2500) return "good";
  if (ms <= 4000) return "needs_improvement";
  return "poor";
}

function classifyCls(value) {
  if (value == null) return "unknown";
  if (value <= 0.1) return "good";
  if (value <= 0.25) return "needs_improvement";
  return "poor";
}

function classifyInp(ms) {
  if (ms == null) return "unknown";
  if (ms <= 200) return "good";
  if (ms <= 500) return "needs_improvement";
  return "poor";
}

function extractFailedAudits(lhr) {
  const audits = lhr?.audits || {};
  const failed = [];
  for (const [id, audit] of Object.entries(audits)) {
    if (audit.score != null && audit.score < 0.9 && audit.score !== -1) {
      failed.push({
        id,
        title: audit.title || id,
        score: audit.score,
        displayValue: audit.displayValue || null,
      });
    }
  }
  return failed.sort((a, b) => a.score - b.score).slice(0, 20);
}

async function fetchPageSpeed(apiKey, url, strategy = "mobile") {
  const params = new URLSearchParams({
    url,
    strategy,
    ...(apiKey ? { key: apiKey } : {}),
  });

  const path = `/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  const result = await httpsRequest({
    hostname: PSI_API_BASE,
    path,
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (result.statusCode !== 200) {
    throw new Error(
      `PageSpeed Insights API error: ${result.statusCode} — ${JSON.stringify(result.body?.error || {})}`
    );
  }

  return result.body;
}

async function collect(context = {}, request = {}) {
  const { apiKey } = resolveCredentials(context);
  const url = request.url || context.targetUrl || null;

  if (!url) {
    return {
      status: "integration_not_connected",
      moduleKey: "technical_seo_audit",
      reason: "No target URL provided for PageSpeed Insights analysis.",
      normalizedPayload: {},
    };
  }

  const strategies = request.strategies || ["mobile", "desktop"];

  try {
    const results = await Promise.all(
      strategies.map((strategy) => fetchPageSpeed(apiKey, url, strategy))
    );

    const pageSpeedData = {};

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      const data = results[i];
      const lhr = data.lighthouseResult;

      const cwv = extractCwvMetrics(lhr);
      const performanceScore = extractCategoryScore(lhr, "performance");
      const accessibilityScore = extractCategoryScore(lhr, "accessibility");
      const seoScore = extractCategoryScore(lhr, "seo");
      const bestPracticesScore = extractCategoryScore(lhr, "best-practices");

      pageSpeedData[strategy] = {
        url,
        strategy,
        performanceScore,
        accessibilityScore,
        seoScore,
        bestPracticesScore,
        cwv: {
          lcp: cwv.lcp,
          lcpStatus: classifyLcp(cwv.lcp),
          cls: cwv.cls,
          clsStatus: classifyCls(cwv.cls),
          inp: cwv.inp,
          inpStatus: classifyInp(cwv.inp),
          fid: cwv.fid,
          ttfb: cwv.ttfb,
          tbt: cwv.tbt,
          si: cwv.si,
          fcp: cwv.fcp,
        },
        failedAudits: extractFailedAudits(lhr),
      };
    }

    const primary = pageSpeedData.mobile || pageSpeedData[strategies[0]];

    return {
      status: "integration_connected",
      normalizedPayload: {
        pageSpeedData: {
          url,
          lcp: primary?.cwv?.lcp ?? null,
          lcpStatus: primary?.cwv?.lcpStatus ?? "unknown",
          cls: primary?.cwv?.cls ?? null,
          clsStatus: primary?.cwv?.clsStatus ?? "unknown",
          inp: primary?.cwv?.inp ?? null,
          inpStatus: primary?.cwv?.inpStatus ?? "unknown",
          performanceScore: primary?.performanceScore ?? null,
          byStrategy: pageSpeedData,
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
