const MODULE_KEY = "optimization_layer";

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
    }))
    .filter((section) => section.title || section.content || section.keywords.length > 0);
}

function normalizeInput(moduleInput = {}, adapterResult = {}) {
  const directSections = normalizeSections(moduleInput.sections);
  const adaptedSections = normalizeSections(adapterResult.sections);
  const sections = directSections.length > 0 ? directSections : adaptedSections;

  return {
    moduleKey: MODULE_KEY,
    productTarget: {
      targetRef:
        moduleInput?.targetRef ||
        moduleInput?.websiteUrl ||
        moduleInput?.appId ||
        moduleInput?.appStoreUrl ||
        moduleInput?.playStoreUrl ||
        "unknown_target",
      targetType: moduleInput?.targetType || "product_target",
      websiteUrl: moduleInput?.websiteUrl || null,
      appId: moduleInput?.appId || null,
      appStoreUrl: moduleInput?.appStoreUrl || null,
      playStoreUrl: moduleInput?.playStoreUrl || null,
    },
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

  return {
    sectionRef: section.sectionRef,
    title: section.title || section.sectionRef,
    matchedKeywords,
    missingKeywordCount: Math.max(targetKeywords.length - matchedKeywords.length, 0),
    metadataCoverage,
    contentLength,
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
