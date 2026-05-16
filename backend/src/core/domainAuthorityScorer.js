const DA_TIERS = Object.freeze({
  high: 60,
  medium: 30,
});

const AUTHORITY_GAP_THRESHOLDS = Object.freeze({
  critical: 30,
  significant: 15,
});

const TOXICITY_THRESHOLD = 40;

function authorityTier(da) {
  const score = Math.max(0, Math.min(100, Number(da) || 0));
  if (score >= DA_TIERS.high) {
    return "high";
  }
  if (score >= DA_TIERS.medium) {
    return "medium";
  }
  return "low";
}

function authorityGapSeverity(targetDA, competitorDA) {
  const gap = Math.max(0, (Number(competitorDA) || 0) - (Number(targetDA) || 0));
  if (gap >= AUTHORITY_GAP_THRESHOLDS.critical) {
    return "critical";
  }
  if (gap >= AUTHORITY_GAP_THRESHOLDS.significant) {
    return "significant";
  }
  return "manageable";
}

function computeAuthorityScore(backlinks = []) {
  if (!Array.isArray(backlinks) || backlinks.length === 0) {
    return 0;
  }

  const total = backlinks.length;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const link of backlinks) {
    const da = Number(link?.domainAuthority ?? link?.da ?? 0);
    const tier = authorityTier(da);
    if (tier === "high") {
      high++;
    } else if (tier === "medium") {
      medium++;
    } else {
      low++;
    }
  }

  const weighted = high * 3 + medium * 2 + low * 1;
  const maxWeighted = total * 3;
  return Math.round((weighted / maxWeighted) * 100);
}

function computeToxicityRisk(backlinks = []) {
  if (!Array.isArray(backlinks) || backlinks.length === 0) {
    return { toxicCount: 0, toxicRatio: 0, riskLevel: "low" };
  }

  const toxicLinks = backlinks.filter(
    (link) => (Number(link?.spamScore ?? link?.spam_score ?? 0)) > TOXICITY_THRESHOLD,
  );

  const toxicRatio = toxicLinks.length / backlinks.length;
  let riskLevel = "low";
  if (toxicRatio > 0.15) {
    riskLevel = "high";
  } else if (toxicRatio > 0.05) {
    riskLevel = "medium";
  }

  return {
    toxicCount: toxicLinks.length,
    toxicRatio: Math.round(toxicRatio * 100) / 100,
    riskLevel,
    toxicLinks,
  };
}

function computeAnchorDistribution(backlinks = []) {
  if (!Array.isArray(backlinks) || backlinks.length === 0) {
    return { branded: 0, exactMatch: 0, partial: 0, generic: 0, naked: 0 };
  }

  const GENERIC_ANCHORS = new Set([
    "click here", "read more", "here", "this", "link", "website", "site", "page",
  ]);

  const counts = { branded: 0, exactMatch: 0, partial: 0, generic: 0, naked: 0 };

  for (const link of backlinks) {
    const anchor = String(link?.anchorText ?? link?.anchor ?? "").toLowerCase().trim();
    const anchorType = link?.anchorType ?? null;

    if (!anchor || anchor.startsWith("http")) {
      counts.naked++;
    } else if (anchorType) {
      counts[anchorType] = (counts[anchorType] || 0) + 1;
    } else if (GENERIC_ANCHORS.has(anchor)) {
      counts.generic++;
    } else {
      counts.partial++;
    }
  }

  return counts;
}

function anchorDiversityScore(anchorDistribution, total) {
  if (!total || total === 0) {
    return 0;
  }
  const exactMatchRatio = (anchorDistribution.exactMatch || 0) / total;
  const penalty = exactMatchRatio > 0.3 ? Math.round((exactMatchRatio - 0.3) * 100) : 0;
  return Math.max(0, 100 - penalty * 2);
}

module.exports = {
  DA_TIERS,
  TOXICITY_THRESHOLD,
  anchorDiversityScore,
  authorityGapSeverity,
  authorityTier,
  computeAnchorDistribution,
  computeAuthorityScore,
  computeToxicityRisk,
};
