const { normalizeProductTarget } = require("../../core/targeting");
const { batchClassifyIntents, CONTENT_FORMAT_MAP } = require("../../core/intentClassifier");

const MODULE_KEY = "search_intent_classifier";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeKeywordEntry(raw) {
  if (typeof raw === "string") {
    return { keyword: raw.trim().toLowerCase(), existingContentType: null, url: null };
  }
  if (!raw || typeof raw !== "object") return null;
  const keyword = normalizeText(raw.keyword ?? raw.term ?? raw.query).toLowerCase();
  if (!keyword) return null;
  return {
    keyword,
    existingContentType: raw.existingContentType ?? raw.existing_content_type ?? null,
    url: normalizeText(raw.url ?? ""),
  };
}

function normalizeSearchIntentInput(inputPayload = {}) {
  const rawKeywords = Array.isArray(inputPayload.keywords) ? inputPayload.keywords : [];
  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    keywords: rawKeywords.map(normalizeKeywordEntry).filter(Boolean),
  };
}

function checkAlignment(existingContentType, recommendedFormats) {
  if (!existingContentType) return { aligned: null, reason: "no_existing_content" };
  const existing = existingContentType.toLowerCase().trim();
  const aligned = recommendedFormats.some(
    (fmt) => existing.includes(fmt.toLowerCase()) || fmt.toLowerCase().includes(existing),
  );
  return { aligned, reason: aligned ? "format_match" : "format_mismatch" };
}

function analyzeSearchIntent(normalizedInput) {
  const { keywords } = normalizedInput;
  if (keywords.length === 0) {
    return {
      normalizedInput,
      classifiedKeywords: [],
      intentDistribution: { informational: 0, navigational: 0, transactional: 0, commercial: 0 },
      misalignedKeywords: [],
      alignedKeywords: [],
      highValueMisaligned: [],
      alignmentScore: 100,
      totalKeywords: 0,
    };
  }

  const classified = batchClassifyIntents(keywords);

  const intentDistribution = { informational: 0, navigational: 0, transactional: 0, commercial: 0 };
  const misalignedKeywords = [];
  const alignedKeywords = [];

  const classifiedKeywords = classified.map((item, idx) => {
    const original = keywords[idx];
    intentDistribution[item.primaryIntent] = (intentDistribution[item.primaryIntent] || 0) + 1;

    const alignment = checkAlignment(original.existingContentType, item.recommendedFormats);
    const entry = {
      keyword: item.keyword,
      url: original.url || null,
      existingContentType: original.existingContentType,
      primaryIntent: item.primaryIntent,
      confidence: item.confidence,
      recommendedFormats: item.recommendedFormats,
      alignmentStatus: alignment.aligned === null
        ? "unknown"
        : alignment.aligned ? "aligned" : "misaligned",
      alignmentReason: alignment.reason,
    };

    if (alignment.aligned === false) {
      misalignedKeywords.push(entry);
    } else if (alignment.aligned === true) {
      alignedKeywords.push(entry);
    }

    return entry;
  });

  const keywordsWithKnownAlignment = misalignedKeywords.length + alignedKeywords.length;
  const alignmentScore = keywordsWithKnownAlignment > 0
    ? Math.round((alignedKeywords.length / keywordsWithKnownAlignment) * 100)
    : 100;

  const highValueMisaligned = misalignedKeywords.filter(
    (k) => k.primaryIntent === "commercial" || k.primaryIntent === "transactional",
  );

  return {
    normalizedInput,
    classifiedKeywords,
    intentDistribution,
    misalignedKeywords,
    alignedKeywords,
    highValueMisaligned,
    alignmentScore,
    totalKeywords: keywords.length,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeSearchIntent,
  normalizeSearchIntentInput,
};
