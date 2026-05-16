const { normalizeProductTarget } = require("../../core/targeting");
const { expectedCtrByPosition, ctrEfficiencyScore, ctrOpportunityLift } = require("../../core/seoScorer");

const MODULE_KEY = "analytics_integration";

function toNumber(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSearchEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const query = String(raw.query ?? raw.keyword ?? raw.term ?? "").toLowerCase().trim();
  if (!query) return null;
  return {
    query,
    page: String(raw.page ?? raw.url ?? ""),
    clicks: toNumber(raw.clicks, 0),
    impressions: toNumber(raw.impressions, 0),
    ctr: toNumber(raw.ctr, null),
    position: toNumber(raw.position ?? raw.avgPosition ?? raw.avg_position, null),
  };
}

function normalizePageMetric(raw) {
  if (!raw || typeof raw !== "object") return null;
  const url = String(raw.url ?? raw.page ?? "").trim();
  if (!url) return null;
  return {
    url,
    organicSessions: toNumber(raw.organicSessions ?? raw.organic_sessions ?? raw.sessions, 0),
    organicSessionsPrev: toNumber(raw.organicSessionsPrev ?? raw.sessions_previous, null),
    conversions: toNumber(raw.conversions, 0),
    bounceRate: toNumber(raw.bounceRate ?? raw.bounce_rate, null),
  };
}

function normalizeCrawlError(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    url: String(raw.url ?? ""),
    type: String(raw.type ?? raw.errorType ?? "unknown"),
    statusCode: toNumber(raw.statusCode ?? raw.status_code, null),
  };
}

function normalizeAnalyticsInput(inputPayload = {}) {
  const gsc = inputPayload.gscData ?? inputPayload.gsc ?? {};
  const ga4 = inputPayload.ga4Data ?? inputPayload.ga4 ?? {};

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    gsc: {
      searchAnalytics: Array.isArray(gsc.searchAnalytics)
        ? gsc.searchAnalytics.map(normalizeSearchEntry).filter(Boolean)
        : [],
      indexCoverage: {
        validIndexed: toNumber(gsc.indexCoverage?.validIndexed, 0),
        warnings: toNumber(gsc.indexCoverage?.warnings, 0),
        errors: toNumber(gsc.indexCoverage?.errors, 0),
        excluded: toNumber(gsc.indexCoverage?.excluded, 0),
      },
      crawlErrors: Array.isArray(gsc.crawlErrors)
        ? gsc.crawlErrors.map(normalizeCrawlError).filter(Boolean)
        : [],
      coreWebVitals: gsc.coreWebVitals ?? {},
    },
    ga4: {
      pageMetrics: Array.isArray(ga4.pageMetrics)
        ? ga4.pageMetrics.map(normalizePageMetric).filter(Boolean)
        : [],
      totalOrganicSessions: toNumber(ga4.totalOrganicSessions, null),
    },
  };
}

function analyzeCtrEfficiency(searchAnalytics) {
  const entries = searchAnalytics.filter((e) => e.impressions >= 100 && e.position !== null);

  const ctrOpportunities = entries
    .map((entry) => {
      const efficiency = entry.ctr !== null ? ctrEfficiencyScore(entry.ctr, entry.position) : null;
      const lift = entry.ctr !== null ? ctrOpportunityLift(entry.ctr, entry.position, entry.impressions) : 0;
      const isUnderperforming = efficiency !== null && efficiency < 0.7 && entry.impressions >= 500;
      return { ...entry, ctrEfficiency: efficiency, estimatedClickLift: lift, isUnderperforming };
    })
    .sort((a, b) => b.estimatedClickLift - a.estimatedClickLift);

  const highImpressionLowCtr = ctrOpportunities.filter((e) => e.isUnderperforming);
  const totalEstimatedLift = ctrOpportunities.reduce((s, e) => s + e.estimatedClickLift, 0);

  return { ctrOpportunities: ctrOpportunities.slice(0, 20), highImpressionLowCtr, totalEstimatedLift };
}

function analyzeTrafficOpportunities(searchAnalytics) {
  const page2Keywords = searchAnalytics.filter(
    (e) => e.position !== null && e.position >= 11 && e.position <= 20 && e.impressions >= 50,
  ).sort((a, b) => b.impressions - a.impressions);

  // positionDelta requires two time-period snapshots which GSC single-period data doesn't carry.
  // Surface high-click page-2 entries as the closest proxy for momentum instead.
  const highClickPage2 = page2Keywords.filter((e) => e.clicks > 0).slice(0, 10);

  return { page2Keywords: page2Keywords.slice(0, 20), highClickPage2 };
}

function analyzeIndexHealth(indexCoverage, crawlErrors) {
  const totalErrors = crawlErrors.length;
  const errorTypes = crawlErrors.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  const indexHealthScore = Math.max(0, 100 - indexCoverage.errors * 5 - indexCoverage.warnings * 2 - totalErrors * 3);

  return { indexCoverage, crawlErrors: crawlErrors.slice(0, 20), errorTypes, totalErrors, indexHealthScore };
}

function analyzeLandingPagePerformance(pageMetrics) {
  const sorted = [...pageMetrics].sort((a, b) => b.organicSessions - a.organicSessions);
  const topPages = sorted.slice(0, 10);

  const decliningPages = pageMetrics.filter((p) => {
    if (p.organicSessionsPrev === null || p.organicSessionsPrev === 0) return false;
    const drop = (p.organicSessionsPrev - p.organicSessions) / p.organicSessionsPrev;
    return drop > 0.2;
  }).map((p) => ({
    ...p,
    dropPercent: Math.round(((p.organicSessionsPrev - p.organicSessions) / p.organicSessionsPrev) * 100),
  })).sort((a, b) => b.dropPercent - a.dropPercent);

  const zeroConversionHighTraffic = pageMetrics.filter(
    (p) => p.conversions === 0 && p.organicSessions >= 100,
  );

  return { topPages, decliningPages, zeroConversionHighTraffic };
}

function computeOverallHealthScore(ctrAnalysis, indexHealth, landingPages) {
  const ctrScore = Math.min(100, 100 - Math.min(ctrAnalysis.highImpressionLowCtr.length * 5, 50));
  const indexScore = indexHealth.indexHealthScore;
  const trafficScore = Math.max(0, 100 - landingPages.decliningPages.length * 10);
  return Math.round(ctrScore * 0.35 + indexScore * 0.35 + trafficScore * 0.3);
}

function analyzeAnalyticsData(normalizedInput) {
  const { gsc, ga4 } = normalizedInput;

  const ctrAnalysis = analyzeCtrEfficiency(gsc.searchAnalytics);
  const trafficOpportunities = analyzeTrafficOpportunities(gsc.searchAnalytics);
  const indexHealth = analyzeIndexHealth(gsc.indexCoverage, gsc.crawlErrors);
  const landingPagePerformance = analyzeLandingPagePerformance(ga4.pageMetrics);
  const overallHealthScore = computeOverallHealthScore(ctrAnalysis, indexHealth, landingPagePerformance);

  return {
    normalizedInput,
    ctrAnalysis,
    trafficOpportunities,
    indexHealth,
    landingPagePerformance,
    overallHealthScore,
    healthBand: overallHealthScore >= 75 ? "healthy" : overallHealthScore >= 50 ? "needs_work" : "critical",
    totalSearchQueries: gsc.searchAnalytics.length,
    totalPageMetrics: ga4.pageMetrics.length,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeAnalyticsData,
  normalizeAnalyticsInput,
};
