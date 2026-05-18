const { normalizeProductTarget } = require("../../core/targeting");

const MODULE_KEY = "site_architecture";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePage(raw) {
  if (!raw || typeof raw !== "object") return null;
  const url = normalizeText(raw.url);
  if (!url) return null;
  return {
    url,
    depth: toNumber(raw.depth ?? raw.crawlDepth ?? raw.crawl_depth, 1),
    inboundInternalLinks: toNumber(raw.inboundInternalLinks ?? raw.inbound_links ?? raw.inboundLinks, 0),
    outboundInternalLinks: toNumber(raw.outboundInternalLinks ?? raw.outbound_links ?? raw.outboundLinks, 0),
    wordCount: toNumber(raw.wordCount ?? raw.word_count, 0),
    lastModified: raw.lastModified ?? raw.last_modified ?? null,
    isRedirect: Boolean(raw.isRedirect ?? raw.is_redirect),
    redirectDepth: toNumber(raw.redirectDepth ?? raw.redirect_depth, 0),
  };
}

function normalizeLinkEdge(raw) {
  if (!raw || typeof raw !== "object") return null;
  const sourceUrl = normalizeText(raw.sourceUrl ?? raw.source ?? "");
  const targetUrl = normalizeText(raw.targetUrl ?? raw.target ?? "");
  if (!sourceUrl || !targetUrl) return null;
  return {
    sourceUrl,
    targetUrl,
    anchorText: normalizeText(raw.anchorText ?? raw.anchor ?? ""),
  };
}

function normalizeArchitectureInput(inputPayload = {}) {
  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    pages: Array.isArray(inputPayload.pages)
      ? inputPayload.pages.map(normalizePage).filter(Boolean)
      : [],
    internalLinkGraph: Array.isArray(inputPayload.internalLinkGraph)
      ? inputPayload.internalLinkGraph.map(normalizeLinkEdge).filter(Boolean)
      : [],
  };
}

function analyzeCrawlDepth(pages) {
  const buckets = { depth1: 0, depth2: 0, depth3: 0, depth4plus: 0 };
  for (const page of pages) {
    if (page.depth <= 1) buckets.depth1++;
    else if (page.depth === 2) buckets.depth2++;
    else if (page.depth === 3) buckets.depth3++;
    else buckets.depth4plus++;
  }
  const total = pages.length;
  const deepPageRatio = total > 0 ? Math.round((buckets.depth4plus / total) * 100) / 100 : 0;
  const depthScore = Math.round(Math.max(0, 100 - deepPageRatio * 100));
  return { buckets, deepPageRatio, depthScore, totalPages: total };
}

function analyzeOrphanPages(pages) {
  const orphanPages = pages.filter((p) => p.inboundInternalLinks === 0);
  const orphanRatio = pages.length > 0
    ? Math.round((orphanPages.length / pages.length) * 100) / 100
    : 0;
  return {
    orphanCount: orphanPages.length,
    orphanRatio,
    orphanSeverity: orphanRatio > 0.1 ? "high" : orphanRatio > 0.05 ? "medium" : "low",
    orphanUrls: orphanPages.map((p) => p.url).slice(0, 20),
  };
}

function computeGiniCoefficient(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((s, v) => s + v, 0);
  if (sum === 0) return 0;
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sorted[i];
  }
  return Math.round(Math.abs(numerator / (n * sum)) * 100) / 100;
}

function analyzeLinkEquity(pages) {
  const sorted = [...pages].sort((a, b) => b.inboundInternalLinks - a.inboundInternalLinks);
  const topLinkedPages = sorted.slice(0, 10).map((p) => ({
    url: p.url,
    inboundLinks: p.inboundInternalLinks,
  }));
  const bottomLinkedPages = sorted
    .filter((p) => p.inboundInternalLinks > 0 && p.inboundInternalLinks <= 2)
    .slice(-10)
    .map((p) => ({ url: p.url, inboundLinks: p.inboundInternalLinks }));

  const linkCounts = pages.map((p) => p.inboundInternalLinks);
  const equityGiniCoefficient = computeGiniCoefficient(linkCounts);

  return { topLinkedPages, bottomLinkedPages, equityGiniCoefficient };
}

function analyzeTopicSilos(pages, internalLinkGraph) {
  const pathSegments = new Map();
  for (const page of pages) {
    try {
      const path = new URL(page.url.startsWith("http") ? page.url : `https://example.com${page.url}`).pathname;
      const segment = path.split("/").filter(Boolean)[0] || "root";
      if (!pathSegments.has(segment)) pathSegments.set(segment, []);
      pathSegments.get(segment).push(page.url);
    } catch {
      pathSegments.set("root", (pathSegments.get("root") || []).concat(page.url));
    }
  }

  let crossLinkedClusters = 0;
  const clusters = [];

  for (const [segment, urls] of pathSegments.entries()) {
    const hasCrossLink = urls.some((url) =>
      internalLinkGraph.some((l) => l.sourceUrl === url || l.targetUrl === url),
    );
    if (hasCrossLink) crossLinkedClusters++;
    clusters.push({ segment, pageCount: urls.length, hasCrossLink });
  }

  const totalClusters = pathSegments.size;
  const siloScore = totalClusters > 0
    ? Math.round((crossLinkedClusters / totalClusters) * 100)
    : 100;

  return { clusters, totalClusters, crossLinkedClusters, siloScore };
}

function analyzeRedirectChains(pages) {
  const chains = pages.filter((p) => p.isRedirect && p.redirectDepth >= 2);
  return {
    chainCount: chains.length,
    chainUrls: chains.map((p) => p.url).slice(0, 10),
    maxChainDepth: chains.length > 0
      ? Math.max(...chains.map((p) => p.redirectDepth))
      : 0,
  };
}

function analyzeSiteArchitecture(normalizedInput) {
  const { pages, internalLinkGraph } = normalizedInput;

  const crawlDepth = analyzeCrawlDepth(pages);
  const orphanAnalysis = analyzeOrphanPages(pages);
  const linkEquity = analyzeLinkEquity(pages);
  const siloAnalysis = analyzeTopicSilos(pages, internalLinkGraph);
  const redirectAnalysis = analyzeRedirectChains(pages);

  const overallArchitectureScore = pages.length > 0
    ? Math.round(
        (crawlDepth.depthScore * 0.35) +
        ((1 - orphanAnalysis.orphanRatio) * 100 * 0.30) +
        (siloAnalysis.siloScore * 0.35),
      )
    : 50;

  const architectureBand = overallArchitectureScore >= 75 ? "healthy"
    : overallArchitectureScore >= 50 ? "needs_work"
    : "poor";

  return {
    normalizedInput,
    crawlDepth,
    orphanAnalysis,
    linkEquity,
    siloAnalysis,
    redirectAnalysis,
    overallArchitectureScore,
    architectureBand,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeSiteArchitecture,
  normalizeArchitectureInput,
};
