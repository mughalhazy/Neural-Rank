const { normalizeProductTarget } = require("../../core/targeting");

const MODULE_KEY = "technical_seo_audit";

const VITAL_THRESHOLDS = Object.freeze({
  lcp:  { good: 2500,  needsImprovement: 4000 },
  cls:  { good: 0.1,   needsImprovement: 0.25 },
  inp:  { good: 200,   needsImprovement: 500  },
});

function toNumber(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeAuditInput(inputPayload = {}) {
  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    url: String(inputPayload.url || "").trim(),
    crawlData: Array.isArray(inputPayload.crawlData) ? inputPayload.crawlData : [],
    pageSpeedData: inputPayload.pageSpeedData && typeof inputPayload.pageSpeedData === "object"
      ? inputPayload.pageSpeedData : {},
    robotsData: inputPayload.robotsData && typeof inputPayload.robotsData === "object"
      ? inputPayload.robotsData : {},
    sitemapData: inputPayload.sitemapData && typeof inputPayload.sitemapData === "object"
      ? inputPayload.sitemapData : {},
    schemaData: Array.isArray(inputPayload.schemaData) ? inputPayload.schemaData : [],
  };
}

function scoreVital(metric, value) {
  const thresholds = VITAL_THRESHOLDS[metric];
  if (!thresholds || value === null) {
    return { rating: "unknown", score: 50 };
  }
  if (value <= thresholds.good) {
    return { rating: "good", score: 100 };
  }
  if (value <= thresholds.needsImprovement) {
    return { rating: "needs_improvement", score: 60 };
  }
  return { rating: "poor", score: 0 };
}

function analyzeCoreWebVitals(pageSpeedData) {
  const lcp = toNumber(pageSpeedData.lcp, null);
  const cls = toNumber(pageSpeedData.cls, null);
  const inp = toNumber(pageSpeedData.inp ?? pageSpeedData.fid, null);

  const lcpResult = scoreVital("lcp", lcp);
  const clsResult = scoreVital("cls", cls);
  const inpResult = scoreVital("inp", inp);

  const knownScores = [lcpResult, clsResult, inpResult].filter((r) => r.rating !== "unknown");
  const vitalScore = knownScores.length > 0
    ? Math.round(knownScores.reduce((s, r) => s + r.score, 0) / knownScores.length)
    : 50;

  const hasAnyPoor = [lcpResult, clsResult, inpResult].some((r) => r.rating === "poor");

  return {
    lcp: { value: lcp, ...lcpResult },
    cls: { value: cls, ...clsResult },
    inp: { value: inp, ...inpResult },
    vitalScore,
    hasAnyPoor,
  };
}

function analyzeCrawlability(robotsData, crawlData) {
  const robotsBlocked = toNumber(robotsData.blockedPages, 0);
  const noindexCount = crawlData.filter((p) => p.noindex === true).length;
  const nofollowCount = crawlData.filter((p) => p.nofollow === true).length;

  const crawlabilityScore = Math.max(
    0,
    100 - robotsBlocked * 20 - noindexCount * 10,
  );

  return {
    robotsBlocked,
    noindexCount,
    nofollowCount,
    crawlabilityScore,
    robotsTxtPresent: robotsData.present !== false,
  };
}

function analyzeIndexation(crawlData) {
  const canonicalIssues = crawlData.filter(
    (p) => p.canonicalIssue === true || p.missingCanonical === true,
  );
  const duplicateUrls = crawlData.filter((p) => p.duplicateUrl === true);

  const indexationScore = Math.max(
    0,
    100 - canonicalIssues.length * 15 - duplicateUrls.length * 10,
  );

  return {
    canonicalIssues: canonicalIssues.map((p) => p.url).filter(Boolean),
    canonicalIssueCount: canonicalIssues.length,
    duplicateUrls: duplicateUrls.map((p) => p.url).filter(Boolean),
    duplicateUrlCount: duplicateUrls.length,
    indexationScore,
  };
}

function analyzeRedirects(crawlData) {
  const redirectChains = crawlData.filter(
    (p) => p.redirectChain === true || (toNumber(p.redirectDepth, 0) >= 2),
  );
  const redirect404s = crawlData.filter((p) => p.redirectTarget404 === true);

  const redirectScore = Math.max(
    0,
    100 - redirectChains.length * 20 - redirect404s.length * 30,
  );

  return {
    redirectChainCount: redirectChains.length,
    redirect404Count: redirect404s.length,
    redirectChainUrls: redirectChains.map((p) => p.url).filter(Boolean),
    redirectScore,
  };
}

function analyzeSchema(schemaData) {
  const schemaTypes = schemaData
    .map((s) => s.type || s["@type"])
    .filter(Boolean);
  const schemaErrors = schemaData.filter((s) => s.error || s.invalid).length;
  const schemaCoverage = schemaTypes.length > 0 ? "present" : "missing";

  return {
    schemaTypes,
    schemaTypeCount: schemaTypes.length,
    schemaErrors,
    schemaCoverage,
  };
}

function analyzeSecurity(crawlData, sitemapData) {
  const httpsStatus = crawlData.some((p) => p.httpsIssue)
    ? "mixed"
    : crawlData.some((p) => String(p.url).startsWith("http://"))
      ? "insecure"
      : "secure";

  const mobileFriendly = crawlData.length === 0 || crawlData.every((p) => p.mobileFriendly !== false);
  const sitemapPresent = sitemapData.present !== false && sitemapData.url !== undefined
    ? true
    : Boolean(sitemapData.present);

  const securityScore = (httpsStatus === "secure" ? 50 : 0) + (mobileFriendly ? 50 : 0);

  return {
    httpsStatus,
    mobileFriendly,
    sitemapPresent,
    securityScore,
  };
}

function analyzeBrokenLinks(crawlData) {
  const brokenInternalLinks = crawlData.filter((p) => p.broken === true && p.internal !== false).length;
  const brokenExternalLinks = crawlData.filter((p) => p.broken === true && p.internal === false).length;

  return {
    brokenInternalLinks,
    brokenExternalLinks,
  };
}

function classifyIssues(dimensions) {
  const critical = [];
  const warning = [];
  const info = [];

  if (dimensions.coreWebVitals.hasAnyPoor) {
    critical.push("core_web_vitals_poor");
  }
  if (dimensions.crawlability.crawlabilityScore < 60) {
    critical.push("crawlability_blocked");
  }
  if (dimensions.indexation.canonicalIssueCount > 2) {
    critical.push("canonical_issues");
  }
  if (dimensions.brokenLinks.brokenInternalLinks > 5) {
    critical.push("broken_internal_links");
  }
  if (dimensions.redirects.redirect404Count > 0) {
    critical.push("redirect_404s");
  }
  if (dimensions.security.httpsStatus !== "secure") {
    warning.push("https_not_fully_secure");
  }
  if (dimensions.redirects.redirectChainCount > 0) {
    warning.push("redirect_chains");
  }
  if (dimensions.schema.schemaCoverage === "missing") {
    warning.push("schema_markup_missing");
  }
  if (!dimensions.security.mobileFriendly) {
    warning.push("not_mobile_friendly");
  }
  if (dimensions.brokenLinks.brokenExternalLinks > 0) {
    info.push("broken_external_links");
  }
  if (!dimensions.security.sitemapPresent) {
    info.push("sitemap_missing");
  }

  return { critical, warning, info };
}

function computeOverallHealthScore(dimensions) {
  const scores = [
    { score: dimensions.coreWebVitals.vitalScore, weight: 0.25 },
    { score: dimensions.crawlability.crawlabilityScore, weight: 0.20 },
    { score: dimensions.indexation.indexationScore, weight: 0.20 },
    { score: dimensions.redirects.redirectScore, weight: 0.15 },
    { score: dimensions.security.securityScore, weight: 0.20 },
  ];

  return Math.round(
    scores.reduce((total, item) => total + item.score * item.weight, 0),
  );
}

function analyzeTechnicalSeo(normalizedInput) {
  const { crawlData, pageSpeedData, robotsData, sitemapData, schemaData } = normalizedInput;

  const dimensions = {
    coreWebVitals: analyzeCoreWebVitals(pageSpeedData),
    crawlability: analyzeCrawlability(robotsData, crawlData),
    indexation: analyzeIndexation(crawlData),
    redirects: analyzeRedirects(crawlData),
    schema: analyzeSchema(schemaData),
    security: analyzeSecurity(crawlData, sitemapData),
    brokenLinks: analyzeBrokenLinks(crawlData),
  };

  const issuesBySeverity = classifyIssues(dimensions);
  const overallHealthScore = computeOverallHealthScore(dimensions);
  const healthBand = overallHealthScore >= 80 ? "healthy"
    : overallHealthScore >= 50 ? "needs_work"
    : "critical";

  return {
    normalizedInput,
    dimensions,
    issuesBySeverity,
    overallHealthScore,
    healthBand,
    totalCriticalIssues: issuesBySeverity.critical.length,
    totalWarnings: issuesBySeverity.warning.length,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeTechnicalSeo,
  normalizeAuditInput,
};
