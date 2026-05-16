const { normalizeProductTarget } = require("../../core/targeting");
const {
  authorityTier,
  computeAuthorityScore,
  computeToxicityRisk,
  computeAnchorDistribution,
  anchorDiversityScore,
} = require("../../core/domainAuthorityScorer");

const MODULE_KEY = "backlink_intelligence";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeBacklink(raw) {
  return {
    sourceUrl: String(raw.sourceUrl ?? raw.source_url ?? raw.url ?? ""),
    sourceDomain: String(raw.sourceDomain ?? raw.source_domain ?? raw.domain ?? ""),
    domainAuthority: toNumber(raw.domainAuthority ?? raw.da ?? raw.domain_authority, 0),
    anchorText: String(raw.anchorText ?? raw.anchor_text ?? raw.anchor ?? ""),
    spamScore: toNumber(raw.spamScore ?? raw.spam_score, 0),
    linkType: raw.linkType ?? raw.link_type ?? (raw.nofollow ? "nofollow" : "dofollow"),
    firstSeen: raw.firstSeen ?? raw.first_seen ?? null,
  };
}

function normalizeReferringDomain(raw) {
  return {
    domain: String(raw.domain ?? raw.sourceDomain ?? ""),
    domainAuthority: toNumber(raw.domainAuthority ?? raw.da ?? 0, 0),
    linkCount: toNumber(raw.linkCount ?? raw.links ?? 1, 1),
  };
}

function normalizeBacklinkInput(inputPayload = {}) {
  const backlinks = Array.isArray(inputPayload.backlinks)
    ? inputPayload.backlinks.map(normalizeBacklink)
    : [];

  const referringDomains = Array.isArray(inputPayload.referringDomains)
    ? inputPayload.referringDomains.map(normalizeReferringDomain)
    : [];

  const competitorBacklinks = Array.isArray(inputPayload.competitorBacklinks)
    ? inputPayload.competitorBacklinks.map(normalizeReferringDomain)
    : [];

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    domain: String(inputPayload.domain ?? ""),
    targetDA: toNumber(inputPayload.targetDA ?? inputPayload.domainAuthority, 0),
    backlinks,
    referringDomains,
    competitorBacklinks,
  };
}

function analyzeProfileSummary(backlinks, referringDomains) {
  const total = backlinks.length;
  const dofollow = backlinks.filter((b) => b.linkType === "dofollow").length;
  const dofollowRatio = total > 0 ? Math.round((dofollow / total) * 100) / 100 : 0;
  const daValues = backlinks.map((b) => b.domainAuthority).filter((d) => d > 0);
  const averageDomainAuthority = daValues.length > 0
    ? Math.round(daValues.reduce((s, d) => s + d, 0) / daValues.length)
    : 0;

  return {
    totalBacklinks: total,
    uniqueReferringDomains: referringDomains.length || new Set(backlinks.map((b) => b.sourceDomain)).size,
    dofollowRatio,
    averageDomainAuthority,
  };
}

function analyzeAuthorityDistribution(backlinks) {
  let high = 0, medium = 0, low = 0;
  for (const link of backlinks) {
    const tier = authorityTier(link.domainAuthority);
    if (tier === "high") high++;
    else if (tier === "medium") medium++;
    else low++;
  }
  const authorityScore = computeAuthorityScore(backlinks);
  return { high, medium, low, authorityScore };
}

function analyzeLinkVelocity(backlinks) {
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const recentLinks = backlinks.filter((b) => {
    if (!b.firstSeen) return false;
    const ts = new Date(b.firstSeen).getTime();
    return !isNaN(ts) && now - ts <= thirtyDaysMs;
  }).length;

  const historicalLinks = backlinks.length - recentLinks;
  let velocityTrend = "stable";
  if (backlinks.length > 0) {
    const recentRatio = recentLinks / backlinks.length;
    if (recentRatio >= 0.2) velocityTrend = "growing";
    else if (recentRatio < 0.05 && backlinks.length > 10) velocityTrend = "declining";
  }

  return { recentLinks, historicalLinks, velocityTrend };
}

function analyzeCompetitorLinkGap(referringDomains, competitorBacklinks) {
  const targetDomainSet = new Set(referringDomains.map((d) => d.domain).filter(Boolean));
  const competitorOnlyDomains = competitorBacklinks
    .filter((c) => c.domain && !targetDomainSet.has(c.domain))
    .sort((a, b) => b.domainAuthority - a.domainAuthority);

  return {
    opportunityCount: competitorOnlyDomains.length,
    topOpportunities: competitorOnlyDomains.slice(0, 10),
    competitorOnlyDomains,
  };
}

function analyzeBacklinks(normalizedInput) {
  const { backlinks, referringDomains, competitorBacklinks } = normalizedInput;

  const profileSummary = analyzeProfileSummary(backlinks, referringDomains);
  const authorityDistribution = analyzeAuthorityDistribution(backlinks);
  const toxicityAnalysis = computeToxicityRisk(backlinks);
  const anchorDistribution = computeAnchorDistribution(backlinks);
  const diversityScore = anchorDiversityScore(anchorDistribution, backlinks.length);
  const linkVelocity = analyzeLinkVelocity(backlinks);
  const competitorLinkGap = analyzeCompetitorLinkGap(referringDomains, competitorBacklinks);

  const overallAuthorityScore = Math.round(
    authorityDistribution.authorityScore * 0.4 +
    (1 - toxicityAnalysis.toxicRatio) * 100 * 0.3 +
    diversityScore * 0.3,
  );

  return {
    normalizedInput,
    profileSummary,
    authorityDistribution,
    toxicityAnalysis,
    anchorDistribution,
    diversityScore,
    linkVelocity,
    competitorLinkGap,
    overallAuthorityScore,
    authorityTier: authorityTier(normalizedInput.targetDA || profileSummary.averageDomainAuthority),
  };
}

module.exports = {
  MODULE_KEY,
  analyzeBacklinks,
  normalizeBacklinkInput,
};
