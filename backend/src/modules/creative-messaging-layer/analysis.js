const MODULE_KEY = "creative_messaging_layer";
const { normalizeProductTarget } = require("../../core/targeting");

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  const text = normalizeText(value);
  return text ? [text] : [];
}

function normalizeAssets(assets) {
  if (!Array.isArray(assets)) {
    return [];
  }

  return assets
    .map((asset, index) => ({
      assetRef:
        normalizeText(asset?.assetRef) ||
        normalizeText(asset?.name) ||
        `asset_${index + 1}`,
      headline: normalizeText(asset?.headline),
      body: normalizeText(asset?.body),
      callToAction: normalizeText(asset?.callToAction),
      audienceSignals: normalizeArray(asset?.audienceSignals),
    }))
    .filter(
      (asset) => asset.headline || asset.body || asset.callToAction || asset.audienceSignals.length > 0,
    );
}

function normalizeInput(moduleInput = {}, adapterResult = {}) {
  const directAssets = normalizeAssets(moduleInput.assets);
  const adaptedAssets = normalizeAssets(adapterResult.assets);
  const assets = directAssets.length > 0 ? directAssets : adaptedAssets;

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(moduleInput),
    targetThemes: normalizeArray(moduleInput.targetThemes || adapterResult.targetThemes),
    assets,
  };
}

function analyzeAsset(asset, targetThemes) {
  const combinedCopy = `${asset.headline} ${asset.body} ${asset.callToAction}`.toLowerCase();
  const matchedThemes = targetThemes.filter((theme) =>
    combinedCopy.includes(theme.toLowerCase()),
  );

  const issues = [];

  if (matchedThemes.length === 0 && targetThemes.length > 0) {
    issues.push("theme_alignment_missing");
  }

  if (!asset.callToAction) {
    issues.push("cta_missing");
  }

  if (asset.body.length < 60) {
    issues.push("message_depth_thin");
  }

  if (!asset.headline) {
    issues.push("headline_missing");
  }

  return {
    assetRef: asset.assetRef,
    headline: asset.headline || asset.assetRef,
    matchedThemes,
    issues,
    bodyLength: asset.body.length,
    audienceSignalCount: asset.audienceSignals.length,
    messageStrengthScore:
      matchedThemes.length * 10 +
      (asset.callToAction ? 10 : 0) +
      (asset.headline ? 10 : 0) +
      Math.min(asset.body.length / 15, 20),
  };
}

function analyzeCreativeMessagingLayer(moduleInput = {}, adapterResult = {}) {
  const normalizedInput = normalizeInput(moduleInput, adapterResult);
  const assetFindings = normalizedInput.assets.map((asset) =>
    analyzeAsset(asset, normalizedInput.targetThemes),
  );

  const assetsNeedingWork = assetFindings.filter((finding) => finding.issues.length > 0);
  const primaryGapAsset =
    [...assetsNeedingWork].sort((left, right) => right.issues.length - left.issues.length)[0] ||
    null;

  return {
    normalizedInput,
    assetFindings,
    summary: {
      assetCount: normalizedInput.assets.length,
      assetsNeedingWork: assetsNeedingWork.length,
      targetThemeCount: normalizedInput.targetThemes.length,
      primaryGapAssetRef: primaryGapAsset?.assetRef || null,
    },
  };
}

module.exports = {
  MODULE_KEY,
  analyzeCreativeMessagingLayer,
};
