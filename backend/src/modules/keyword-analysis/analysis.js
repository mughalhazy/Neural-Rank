const MODULE_KEY = "keyword_analysis";

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
    productTarget: {
      targetRef:
        normalizeText(inputPayload.targetRef) ||
        normalizeText(inputPayload.websiteUrl) ||
        normalizeText(inputPayload.appUrl) ||
        normalizeText(inputPayload.appId) ||
        "unknown_target",
      targetType:
        normalizeText(inputPayload.targetType) ||
        (normalizeText(inputPayload.appUrl) || normalizeText(inputPayload.appId)
          ? "app_target"
          : "product_target"),
      websiteUrl: normalizeText(inputPayload.websiteUrl) || null,
      appId: normalizeText(inputPayload.appId) || null,
      appStoreUrl: normalizeText(inputPayload.appUrl) || normalizeText(inputPayload.appStoreUrl) || null,
      playStoreUrl: normalizeText(inputPayload.playStoreUrl) || null,
    },
    keywords: normalizedKeywords,
  };
}

function extractKeywordTokens(keyword) {
  return keyword.split(/\s+/).filter(Boolean);
}

function buildKeywordSuggestions(keywords) {
  const suggestions = new Map();

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

    suggestions.set(keywordEntry.keyword, {
      keyword: keywordEntry.keyword,
      source: "direct_input",
      opportunityScore: rankFactor + difficultyFactor + volumeFactor,
      basedOn: keywordEntry,
    });

    if (tokens.length === 1) {
      for (const expansion of ["insights", "analysis", "tool"]) {
        const expandedKeyword = `${keywordEntry.keyword} ${expansion}`;
        suggestions.set(expandedKeyword, {
          keyword: expandedKeyword,
          source: "expansion",
          opportunityScore: rankFactor + difficultyFactor + Math.max(volumeFactor - 1, 1),
          basedOn: keywordEntry,
        });
      }
    } else {
      const longTailKeyword = `${keywordEntry.keyword} strategy`;
      suggestions.set(longTailKeyword, {
        keyword: longTailKeyword,
        source: "long_tail",
        opportunityScore: rankFactor + difficultyFactor,
        basedOn: keywordEntry,
      });
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
    basedOn: suggestion.basedOn,
  }));
}

function summarize(keywordEntries, opportunities) {
  return {
    keywordCount: keywordEntries.length,
    highOpportunityCount: opportunities.filter((item) => item.opportunityBand === "high").length,
    mediumOpportunityCount: opportunities.filter((item) => item.opportunityBand === "medium").length,
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
