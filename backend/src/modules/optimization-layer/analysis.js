const MODULE_KEY = "optimization_layer";
const { normalizeProductTarget } = require("../../core/targeting");
const { readabilityTier, estimateAvgSentenceLength, keywordDensity } = require("../../core/seoScorer");

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return normalizeText(value) ? [normalizeText(value)] : [];
}

function normalizeSections(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .map((section, index) => ({
      sectionRef:
        normalizeText(section?.sectionRef) ||
        normalizeText(section?.name) ||
        `section_${index + 1}`,
      title: normalizeText(section?.title),
      content: normalizeText(section?.content),
      keywords: normalizeArray(section?.keywords),
      metadata: {
        description: normalizeText(section?.metadata?.description),
        title: normalizeText(section?.metadata?.title),
      },
      relatedTerms: normalizeArray(section?.relatedTerms || section?.lsiTerms || []),
      lastModified: section?.lastModified ?? section?.last_modified ?? null,
    }))
    .filter((section) => section.title || section.content || section.keywords.length > 0);
}

function normalizeInput(moduleInput = {}, adapterResult = {}) {
  const directSections = normalizeSections(moduleInput.sections);
  const adaptedSections = normalizeSections(adapterResult.sections);
  const sections = directSections.length > 0 ? directSections : adaptedSections;

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(moduleInput),
    targetKeywords: normalizeArray(moduleInput.targetKeywords || adapterResult.targetKeywords),
    sections,
  };
}

function scoreSection(section, targetKeywords) {
  const contentLower = `${section.title} ${section.content}`.toLowerCase();
  const matchedKeywords = targetKeywords.filter((keyword) =>
    contentLower.includes(keyword.toLowerCase()),
  );

  const metadataCoverage =
    (section.metadata.title ? 1 : 0) + (section.metadata.description ? 1 : 0);
  const contentLength = section.content.length;

  const issues = [];
  if (matchedKeywords.length === 0 && targetKeywords.length > 0) {
    issues.push("keyword_coverage_missing");
  }
  if (metadataCoverage < 2) {
    issues.push("metadata_incomplete");
  }
  if (contentLength < 80) {
    issues.push("content_thin");
  }

  const avgSentenceLength = estimateAvgSentenceLength(section.content);
  const readabilityLevel = readabilityTier(avgSentenceLength);
  if (readabilityLevel === "complex") {
    issues.push("readability_complex");
  }

  const primaryKeyword = targetKeywords[0] || "";
  const density = primaryKeyword ? keywordDensity(section.content, primaryKeyword) : 0;
  if (density > 3) {
    issues.push("keyword_overstuffed");
  } else if (density === 0 && primaryKeyword && contentLength > 80) {
    issues.push("keyword_density_too_low");
  }

  const relatedTerms = section.relatedTerms || [];
  const matchedRelatedTerms = relatedTerms.filter((term) =>
    contentLower.includes(term.toLowerCase()),
  );
  const semanticRichness = relatedTerms.length > 0
    ? Math.round((matchedRelatedTerms.length / relatedTerms.length) * 100)
    : null;
  if (semanticRichness !== null && semanticRichness < 30) {
    issues.push("low_semantic_richness");
  }

  const now = Date.now();
  const twelveMonthsMs = 365 * 24 * 60 * 60 * 1000;
  const lastModifiedTs = section.lastModified ? new Date(section.lastModified).getTime() : null;
  const freshnessSignal = lastModifiedTs && !isNaN(lastModifiedTs)
    ? now - lastModifiedTs > twelveMonthsMs ? "stale_candidate" : "fresh"
    : "unknown";
  if (freshnessSignal === "stale_candidate") {
    issues.push("content_stale");
  }

  return {
    sectionRef: section.sectionRef,
    title: section.title || section.sectionRef,
    matchedKeywords,
    missingKeywordCount: Math.max(targetKeywords.length - matchedKeywords.length, 0),
    metadataCoverage,
    contentLength,
    readabilityLevel,
    keywordDensity: density,
    semanticRichness,
    freshnessSignal,
    issues,
    optimizationScore:
      matchedKeywords.length * 10 + metadataCoverage * 10 + Math.min(contentLength / 20, 20),
  };
}

function analyzeOptimizationLayer(moduleInput = {}, adapterResult = {}) {
  const normalizedInput = normalizeInput(moduleInput, adapterResult);
  const sectionFindings = normalizedInput.sections.map((section) =>
    scoreSection(section, normalizedInput.targetKeywords),
  );

  const sectionsNeedingOptimization = sectionFindings.filter(
    (finding) => finding.issues.length > 0,
  );
  const highestGapSection =
    [...sectionsNeedingOptimization].sort(
      (left, right) => right.issues.length - left.issues.length,
    )[0] || null;

  return {
    normalizedInput,
    sectionFindings,
    summary: {
      sectionCount: normalizedInput.sections.length,
      sectionsNeedingOptimization: sectionsNeedingOptimization.length,
      targetKeywordCount: normalizedInput.targetKeywords.length,
      highestGapSectionRef: highestGapSection?.sectionRef || null,
    },
  };
}

module.exports = {
  MODULE_KEY,
  analyzeOptimizationLayer,
};
