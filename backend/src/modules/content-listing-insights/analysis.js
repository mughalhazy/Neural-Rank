const MODULE_KEY = "content_listing_insights";

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

function resolveProductTarget(inputPayload = {}) {
  return {
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
  };
}

function normalizeContentInput(inputPayload = {}) {
  return {
    moduleKey: MODULE_KEY,
    productTarget: resolveProductTarget(inputPayload),
    content: buildWebsiteContent(inputPayload),
    listing: buildListingContent(inputPayload),
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

  return {
    surface: "website_content",
    present: Boolean(content.title || content.summary || content.body),
    observations,
    keywordCoverage,
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

  return {
    surface: "app_listing",
    present: Boolean(listing.title || listing.shortDescription || listing.description),
    observations,
    keywordCoverage,
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

function analyzeContentListingInput(normalizedInput) {
  const contentAnalysis = analyzeWebsiteContent(normalizedInput.content);
  const listingAnalysis = analyzeListingContent(normalizedInput.listing);

  return {
    normalizedInput,
    contentAnalysis,
    listingAnalysis,
    summary: summarize(contentAnalysis, listingAnalysis),
  };
}

module.exports = {
  MODULE_KEY,
  analyzeContentListingInput,
  normalizeContentInput,
};
