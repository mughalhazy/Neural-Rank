const MODULE_KEY = "keyword_analysis";
const { normalizeProductTarget } = require("../../core/targeting");
const { classifyIntent } = require("../../core/intentClassifier");

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeKeywordEntry(keywordInput) {
  if (typeof keywordInput === "string") {
    const keyword = normalizeText(keywordInput).toLowerCase();
    return keyword
      ? {
          keyword,
          position: null,
          difficulty: null,
          volume: null,
        }
      : null;
  }

  if (!keywordInput || typeof keywordInput !== "object") {
    return null;
  }

  const keyword = normalizeText(
    keywordInput.keyword || keywordInput.term || keywordInput.query || "",
  ).toLowerCase();

  if (!keyword) {
    return null;
  }

  return {
    keyword,
    position: toNumber(keywordInput.position ?? keywordInput.rank, null),
    difficulty: toNumber(keywordInput.difficulty, null),
    volume: toNumber(keywordInput.volume, null),
    volumePrevious: toNumber(keywordInput.volumePrevious ?? keywordInput.volume_previous, null),
    serpFeaturePresent: Array.isArray(keywordInput.serpFeatures)
      ? keywordInput.serpFeatures.length > 0
      : Boolean(keywordInput.serpFeaturePresent),
  };
}

function normalizeKeywordInput(inputPayload = {}) {
  const directKeywords = Array.isArray(inputPayload.keywords)
    ? inputPayload.keywords
    : typeof inputPayload.keywords === "string"
      ? inputPayload.keywords.split(",")
      : [];

  const normalizedKeywords = directKeywords
    .map(normalizeKeywordEntry)
    .filter(Boolean);

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    keywords: normalizedKeywords,
  };
}

function extractKeywordTokens(keyword) {
  return keyword.split(/\s+/).filter(Boolean);
}

function buildSeedExpansions(keywords) {
  const highVolumeKeywords = [...keywords]
    .filter((k) => k.volume !== null)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 3);

  const seedTokens = new Set();
  for (const kw of highVolumeKeywords) {
    for (const token of extractKeywordTokens(kw.keyword)) {
      if (token.length > 3) seedTokens.add(token);
    }
  }

  const expansions = ["guide", "tips", "tool", "software", "platform", "strategy", "best practices"];
  return [...seedTokens].slice(0, 3).flatMap((token) =>
    expansions.slice(0, 2).map((exp) => `${token} ${exp}`),
  );
}

function computeTrendDirection(volumePrevious, volume) {
  if (volumePrevious === null || volume === null) return "stable";
  const delta = volume - volumePrevious;
  if (delta > volumePrevious * 0.1) return "rising";
  if (delta < -(volumePrevious * 0.1)) return "declining";
  return "stable";
}

function buildKeywordSuggestions(keywords) {
  const suggestions = new Map();
  const contextExpansions = buildSeedExpansions(keywords);

  for (const keywordEntry of keywords) {
    const tokens = extractKeywordTokens(keywordEntry.keyword);
    const rankFactor =
      keywordEntry.position === null
        ? 2
        : keywordEntry.position > 20
          ? 4
          : keywordEntry.position > 10
            ? 3
            : 1;
    const difficultyFactor =
      keywordEntry.difficulty === null
        ? 2
        : keywordEntry.difficulty <= 20
          ? 3
          : keywordEntry.difficulty <= 40
            ? 2
            : 1;
    const volumeFactor =
      keywordEntry.volume === null
        ? 1
        : keywordEntry.volume >= 1000
          ? 3
          : keywordEntry.volume >= 300
            ? 2
            : 1;

    const trendDirection = computeTrendDirection(keywordEntry.volumePrevious, keywordEntry.volume);
    const trendBonus = trendDirection === "rising" ? 1 : 0;

    const isQuickWin = keywordEntry.position !== null &&
      keywordEntry.position >= 11 && keywordEntry.position <= 20;

    const intentResult = classifyIntent(keywordEntry.keyword);

    suggestions.set(keywordEntry.keyword, {
      keyword: keywordEntry.keyword,
      source: "direct_input",
      opportunityScore: rankFactor + difficultyFactor + volumeFactor + trendBonus,
      opportunityTier: isQuickWin ? "quick_win" : null,
      trendDirection,
      intentSignal: intentResult.primaryIntent,
      intentConfidence: intentResult.confidence,
      serpFeaturePresent: keywordEntry.serpFeaturePresent,
      basedOn: keywordEntry,
    });

    if (tokens.length === 1) {
      for (const expansion of contextExpansions.slice(0, 2)) {
        const expandedKeyword = `${keywordEntry.keyword} ${expansion.split(" ").pop()}`;
        if (!suggestions.has(expandedKeyword)) {
          suggestions.set(expandedKeyword, {
            keyword: expandedKeyword,
            source: "expansion",
            opportunityScore: rankFactor + difficultyFactor + Math.max(volumeFactor - 1, 1),
            opportunityTier: null,
            trendDirection: "stable",
            intentSignal: intentResult.primaryIntent,
            intentConfidence: 0,
            serpFeaturePresent: false,
            basedOn: keywordEntry,
          });
        }
      }
    } else {
      const longTailKeyword = `${keywordEntry.keyword} strategy`;
      if (!suggestions.has(longTailKeyword)) {
        suggestions.set(longTailKeyword, {
          keyword: longTailKeyword,
          source: "long_tail",
          opportunityScore: rankFactor + difficultyFactor,
          opportunityTier: null,
          trendDirection: "stable",
          intentSignal: "informational",
          intentConfidence: 0,
          serpFeaturePresent: false,
          basedOn: keywordEntry,
        });
      }
    }
  }

  return Array.from(suggestions.values()).sort(
    (left, right) =>
      right.opportunityScore - left.opportunityScore ||
      left.keyword.localeCompare(right.keyword),
  );
}

function classifyOpportunities(suggestions) {
  return suggestions.map((suggestion) => ({
    keyword: suggestion.keyword,
    source: suggestion.source,
    opportunityBand:
      suggestion.opportunityScore >= 8
        ? "high"
        : suggestion.opportunityScore >= 5
          ? "medium"
          : "low",
    opportunityScore: suggestion.opportunityScore,
    opportunityTier: suggestion.opportunityTier,
    trendDirection: suggestion.trendDirection,
    intentSignal: suggestion.intentSignal,
    intentConfidence: suggestion.intentConfidence,
    serpFeaturePresent: suggestion.serpFeaturePresent,
    basedOn: suggestion.basedOn,
  }));
}

function summarize(keywordEntries, opportunities) {
  return {
    keywordCount: keywordEntries.length,
    highOpportunityCount: opportunities.filter((item) => item.opportunityBand === "high").length,
    mediumOpportunityCount: opportunities.filter((item) => item.opportunityBand === "medium").length,
    quickWinCount: opportunities.filter((item) => item.opportunityTier === "quick_win").length,
    risingCount: opportunities.filter((item) => item.trendDirection === "rising").length,
  };
}

function analyzeKeywordInput(normalizedInput) {
  const suggestions = buildKeywordSuggestions(normalizedInput.keywords);
  const opportunities = classifyOpportunities(suggestions);

  return {
    normalizedInput,
    keywordCount: normalizedInput.keywords.length,
    suggestions,
    opportunities,
    summary: summarize(normalizedInput.keywords, opportunities),
  };
}

module.exports = {
  MODULE_KEY,
  analyzeKeywordInput,
  normalizeKeywordInput,
};
