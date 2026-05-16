const MODULE_KEY = "content_listing_insights";
const { normalizeProductTarget } = require("../../core/targeting");
const { readabilityTier, estimateAvgSentenceLength } = require("../../core/seoScorer");

const EEAT_EXPERIENCE_MARKERS = [
  "i found", "in my experience", "i tested", "we tested", "i tried", "our team",
  "our research", "i recommend", "based on my", "from my experience", "we discovered",
];

const EEAT_CITATION_MARKERS = [
  "according to", "study shows", "research shows", "data shows", "published in",
  "cited by", "source:", "references:", "per ", "experts say",
];

const STRUCTURED_CONTENT_PATTERNS = [
  /\n[-*]\s/,
  /\n\d+\.\s/,
  /\|.*\|/,
  /<table/i,
  /#{1,3}\s/,
];

function detectStructuredContent(text) {
  return STRUCTURED_CONTENT_PATTERNS.some((pattern) => pattern.test(text));
}

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeKeywordInput(keywordInput) {
  if (Array.isArray(keywordInput)) {
    return keywordInput
      .map((item) => normalizeText(item).toLowerCase())
      .filter(Boolean);
  }

  const text = normalizeText(keywordInput);
  if (!text) {
    return [];
  }

  return text
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeText(item)).filter(Boolean);
}

function buildWebsiteContent(inputPayload = {}) {
  const nestedContent = inputPayload.content || {};
  const flatTitle = normalizeText(inputPayload.pageTitle);
  const flatSummary = normalizeText(inputPayload.metaDescription);
  const flatBody = [normalizeText(inputPayload.bodyText), ...normalizeStringArray(inputPayload.headings)]
    .filter(Boolean)
    .join(" ")
    .trim();

  const title = normalizeText(nestedContent.title) || flatTitle;
  const summary = normalizeText(nestedContent.summary) || flatSummary;
  const body = normalizeText(nestedContent.body) || flatBody;
  const keywords = normalizeKeywordInput(
    nestedContent.keywords || inputPayload.keywords || inputPayload.targetKeywords,
  );
  const combinedText = [title, summary, body].filter(Boolean).join(" ").trim();

  return {
    title,
    summary,
    body,
    keywords,
    combinedText,
  };
}

function buildListingContent(inputPayload = {}) {
  const nestedListing = inputPayload.listing || {};
  const title = normalizeText(nestedListing.title) || normalizeText(inputPayload.listingTitle);
  const shortDescription =
    normalizeText(nestedListing.shortDescription) ||
    normalizeText(inputPayload.shortDescription);
  const description =
    normalizeText(nestedListing.description) ||
    normalizeText(inputPayload.description) ||
    normalizeText(inputPayload.longDescription);
  const keywords = normalizeKeywordInput(
    nestedListing.keywords || inputPayload.listingKeywords || inputPayload.targetKeywords,
  );
  const combinedText = [title, shortDescription, description].filter(Boolean).join(" ").trim();

  return {
    title,
    shortDescription,
    description,
    keywords,
    combinedText,
  };
}

function normalizeContentInput(inputPayload = {}) {
  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    content: buildWebsiteContent(inputPayload),
    listing: buildListingContent(inputPayload),
    competitorWordCounts: Array.isArray(inputPayload.competitorWordCounts)
      ? inputPayload.competitorWordCounts.map(Number).filter((n) => Number.isFinite(n))
      : [],
  };
}

function computeKeywordCoverage(text, keywords) {
  if (!text || keywords.length === 0) {
    return {
      coverageRatio: 0,
      matchedKeywords: [],
      missingKeywords: [],
    };
  }

  const lowerText = text.toLowerCase();
  const matchedKeywords = keywords.filter((keyword) => lowerText.includes(keyword));
  const missingKeywords = keywords.filter((keyword) => !matchedKeywords.includes(keyword));

  return {
    coverageRatio: matchedKeywords.length / keywords.length,
    matchedKeywords,
    missingKeywords,
  };
}

function analyzeWebsiteContent(content) {
  const keywordCoverage = computeKeywordCoverage(content.combinedText, content.keywords);
  const observations = [];

  if (!content.title) {
    observations.push("Website content is missing a title block.");
  }

  if (!content.summary) {
    observations.push("Website content is missing a summary block.");
  }

  if (!content.body) {
    observations.push("Website content is missing a body block.");
  }

  if (content.keywords.length > 0 && keywordCoverage.coverageRatio < 0.5) {
    observations.push("Website content has weak keyword coverage against the provided keyword set.");
  }

  if (content.body && content.body.length < 120) {
    observations.push("Website content body is too thin to carry strong listing insight value.");
  }

  const bodyText = content.body || "";
  const avgSentenceLength = estimateAvgSentenceLength(bodyText);
  const contentReadabilityTier = readabilityTier(avgSentenceLength);

  const lowerBody = bodyText.toLowerCase();
  const eeAtExperienceSignals = EEAT_EXPERIENCE_MARKERS.filter((m) => lowerBody.includes(m)).length;
  const eeAtCitationSignals = EEAT_CITATION_MARKERS.filter((m) => lowerBody.includes(m)).length;
  const hasStructuredContent = detectStructuredContent(bodyText);

  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  return {
    surface: "website_content",
    present: Boolean(content.title || content.summary || content.body),
    observations,
    keywordCoverage,
    readabilityTier: contentReadabilityTier,
    eeAtSignals: {
      experienceMarkers: eeAtExperienceSignals,
      citationMarkers: eeAtCitationSignals,
      hasFirstHandContent: eeAtExperienceSignals > 0,
      hasCitations: eeAtCitationSignals > 0,
    },
    hasStructuredContent,
    wordCount,
  };
}

function analyzeListingContent(listing) {
  const keywordCoverage = computeKeywordCoverage(listing.combinedText, listing.keywords);
  const observations = [];

  if (!listing.title) {
    observations.push("App listing is missing a title.");
  }

  if (!listing.shortDescription) {
    observations.push("App listing is missing a short description.");
  }

  if (!listing.description) {
    observations.push("App listing is missing a long description.");
  }

  if (listing.keywords.length > 0 && keywordCoverage.coverageRatio < 0.5) {
    observations.push("App listing has weak keyword coverage against the provided keyword set.");
  }

  if (listing.description && listing.description.length < 120) {
    observations.push("App listing description is too thin to support strong store positioning.");
  }

  const descText = listing.description || "";
  const listingWordCount = descText.split(/\s+/).filter(Boolean).length;
  const listingReadabilityTier = readabilityTier(estimateAvgSentenceLength(descText));
  const hasStructuredListing = detectStructuredContent(descText);

  return {
    surface: "app_listing",
    present: Boolean(listing.title || listing.shortDescription || listing.description),
    observations,
    keywordCoverage,
    readabilityTier: listingReadabilityTier,
    hasStructuredContent: hasStructuredListing,
    wordCount: listingWordCount,
  };
}

function summarize(contentAnalysis, listingAnalysis) {
  return {
    hasWebsiteContent: contentAnalysis.present,
    hasListingContent: listingAnalysis.present,
    websiteObservationCount: contentAnalysis.observations.length,
    listingObservationCount: listingAnalysis.observations.length,
  };
}

function analyzeCompetitorDepth(targetWordCount, competitorWordCounts) {
  if (competitorWordCounts.length === 0) return null;
  const avgCompetitorWordCount = Math.round(
    competitorWordCounts.reduce((s, c) => s + c, 0) / competitorWordCounts.length,
  );
  const isBelowAverage = targetWordCount < avgCompetitorWordCount;
  const gap = Math.max(0, avgCompetitorWordCount - targetWordCount);
  return { avgCompetitorWordCount, targetWordCount, isBelowAverage, gap };
}

function analyzeContentListingInput(normalizedInput) {
  const contentAnalysis = analyzeWebsiteContent(normalizedInput.content);
  const listingAnalysis = analyzeListingContent(normalizedInput.listing);
  const competitorDepthComparison = analyzeCompetitorDepth(
    contentAnalysis.wordCount,
    normalizedInput.competitorWordCounts,
  );

  return {
    normalizedInput,
    contentAnalysis,
    listingAnalysis,
    competitorDepthComparison,
    summary: summarize(contentAnalysis, listingAnalysis),
  };
}

module.exports = {
  MODULE_KEY,
  analyzeContentListingInput,
  normalizeContentInput,
};
