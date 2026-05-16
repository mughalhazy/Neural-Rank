function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function inferTargetType(input = {}) {
  const explicitType = normalizeText(input.targetType);
  if (explicitType) {
    return explicitType;
  }

  if (
    normalizeText(input.appUrl) ||
    normalizeText(input.appStoreUrl) ||
    normalizeText(input.playStoreUrl) ||
    normalizeText(input.appId)
  ) {
    return "app_target";
  }

  return "product_target";
}

function normalizeProductTarget(input = {}) {
  return {
    targetRef:
      normalizeText(input.targetRef) ||
      normalizeText(input.websiteUrl) ||
      normalizeText(input.appUrl) ||
      normalizeText(input.appStoreUrl) ||
      normalizeText(input.playStoreUrl) ||
      normalizeText(input.appId) ||
      "unknown_target",
    targetType: inferTargetType(input),
    websiteUrl: normalizeText(input.websiteUrl) || null,
    appId: normalizeText(input.appId) || null,
    appStoreUrl:
      normalizeText(input.appUrl) ||
      normalizeText(input.appStoreUrl) ||
      null,
    playStoreUrl: normalizeText(input.playStoreUrl) || null,
  };
}

module.exports = {
  inferTargetType,
  normalizeProductTarget,
  normalizeText,
};
