const { normalizeProductTarget } = require("../../core/targeting");
const { keywordDensity } = require("../../core/seoScorer");

const MODULE_KEY = "on_page_seo_scorer";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePage(rawPage) {
  return {
    url: normalizeText(rawPage.url),
    title: normalizeText(rawPage.title),
    metaDescription: normalizeText(rawPage.metaDescription ?? rawPage.meta_description ?? ""),
    h1: normalizeText(rawPage.h1 ?? rawPage.h1Text ?? ""),
    h2s: Array.isArray(rawPage.h2s) ? rawPage.h2s.map(normalizeText) : [],
    h3s: Array.isArray(rawPage.h3s) ? rawPage.h3s.map(normalizeText) : [],
    bodyContent: normalizeText(rawPage.bodyContent ?? rawPage.body ?? rawPage.content ?? ""),
    internalLinks: Array.isArray(rawPage.internalLinks) ? rawPage.internalLinks : [],
    imageAlts: Array.isArray(rawPage.imageAlts) ? rawPage.imageAlts : [],
    totalImages: toNumber(rawPage.totalImages ?? rawPage.imageAlts?.length, 0),
    wordCount: toNumber(rawPage.wordCount, 0),
    targetKeywords: Array.isArray(rawPage.targetKeywords)
      ? rawPage.targetKeywords.map(normalizeText).filter(Boolean)
      : typeof rawPage.targetKeyword === "string" && rawPage.targetKeyword
        ? [rawPage.targetKeyword.trim()]
        : [],
    urlSlug: normalizeText(rawPage.urlSlug ?? rawPage.url ?? "").replace(/^https?:\/\/[^/]+/, ""),
  };
}

function normalizeOnPageInput(inputPayload = {}) {
  const rawPages = Array.isArray(inputPayload.pages)
    ? inputPayload.pages
    : inputPayload.page
      ? [inputPayload.page]
      : [];

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    pages: rawPages.map(normalizePage).filter((p) => p.url || p.title),
  };
}

function scoreTitleTag(page) {
  const issues = [];
  let score = 0;

  if (!page.title) {
    issues.push("title_missing");
    return { score, issues };
  }

  score += 10;
  const len = page.title.length;

  if (len >= 50 && len <= 60) {
    score += 8;
  } else if (len >= 40 && len <= 70) {
    score += 5;
  } else {
    issues.push(len < 40 ? "title_too_short" : "title_too_long");
  }

  const primaryKw = page.targetKeywords[0] || "";
  if (primaryKw && page.title.toLowerCase().includes(primaryKw.toLowerCase())) {
    score += 7;
  } else if (primaryKw) {
    issues.push("title_missing_primary_keyword");
  }

  return { score, issues };
}

function scoreMetaDescription(page) {
  const issues = [];
  let score = 0;

  if (!page.metaDescription) {
    issues.push("meta_description_missing");
    return { score, issues };
  }

  score += 5;
  const len = page.metaDescription.length;

  if (len >= 150 && len <= 160) {
    score += 5;
  } else if (len >= 100 && len <= 180) {
    score += 3;
  } else {
    issues.push(len < 100 ? "meta_too_short" : "meta_too_long");
  }

  const primaryKw = page.targetKeywords[0] || "";
  if (primaryKw && page.metaDescription.toLowerCase().includes(primaryKw.toLowerCase())) {
    score += 5;
  } else if (primaryKw) {
    issues.push("meta_missing_primary_keyword");
  }

  return { score, issues };
}

function scoreHeadingHierarchy(page) {
  const issues = [];
  let score = 0;

  if (!page.h1) {
    issues.push("h1_missing");
    return { score, issues };
  }

  score += 8;
  const primaryKw = page.targetKeywords[0] || "";

  if (primaryKw && page.h1.toLowerCase().includes(primaryKw.toLowerCase())) {
    score += 7;
  } else if (primaryKw) {
    issues.push("h1_missing_primary_keyword");
  }

  if (page.h2s.length >= 2) {
    score += 5;
  } else if (page.h2s.length === 1) {
    score += 2;
    issues.push("insufficient_h2s");
  } else {
    issues.push("no_h2s");
  }

  return { score, issues };
}

function scoreContentDepth(page) {
  const issues = [];
  let score = 0;
  const wc = page.wordCount || page.bodyContent.split(/\s+/).filter(Boolean).length;

  if (wc >= 1500) {
    score += 10;
  } else if (wc >= 800) {
    score += 7;
  } else if (wc >= 400) {
    score += 4;
  } else {
    issues.push("content_too_thin");
  }

  const primaryKw = page.targetKeywords[0] || "";
  if (primaryKw && page.bodyContent) {
    const first100Words = page.bodyContent.split(/\s+/).slice(0, 100).join(" ");
    if (first100Words.toLowerCase().includes(primaryKw.toLowerCase())) {
      score += 5;
    } else {
      issues.push("keyword_not_in_opening");
    }

    const density = keywordDensity(page.bodyContent, primaryKw);
    if (density >= 0.5 && density <= 2) {
      score += 5;
    } else if (density > 2) {
      issues.push("keyword_density_too_high");
    } else {
      issues.push("keyword_density_too_low");
    }
  }

  return { score, issues };
}

function scoreInternalLinks(page) {
  const issues = [];
  let score = 0;
  const count = page.internalLinks.length;

  if (count >= 3) {
    score += 5;
  } else if (count >= 1) {
    score += 3;
    issues.push("few_internal_links");
  } else {
    issues.push("no_internal_links");
  }

  const primaryKw = page.targetKeywords[0] || "";
  const hasKeywordAnchor = primaryKw && page.internalLinks.some(
    (link) => String(link?.anchorText ?? link?.text ?? link ?? "").toLowerCase().includes(primaryKw.toLowerCase()),
  );

  if (hasKeywordAnchor) {
    score += 5;
  } else if (primaryKw && count > 0) {
    issues.push("no_keyword_anchor_text");
  }

  return { score, issues };
}

function scoreImageOptimization(page) {
  const issues = [];
  let score = 0;
  const totalImages = page.totalImages || page.imageAlts.length;

  if (totalImages === 0) {
    return { score, issues };
  }

  const altsPresent = page.imageAlts.filter((alt) => typeof alt === "string" && alt.trim().length > 0).length;
  const coverage = altsPresent / totalImages;

  if (coverage >= 0.8) {
    score += 5;
  } else if (coverage >= 0.5) {
    score += 3;
    issues.push("incomplete_image_alt_text");
  } else {
    issues.push("poor_image_alt_text_coverage");
  }

  return { score, issues };
}

function scoreUrlStructure(page) {
  const issues = [];
  let score = 0;
  const slug = page.urlSlug;

  if (!slug) {
    return { score, issues };
  }

  if (slug.length <= 60) {
    score += 2;
  } else {
    issues.push("url_slug_too_long");
  }

  const primaryKw = page.targetKeywords[0] || "";
  if (primaryKw && slug.toLowerCase().includes(primaryKw.toLowerCase().replace(/\s+/, "-"))) {
    score += 2;
  } else if (primaryKw) {
    issues.push("url_missing_keyword");
  }

  if (!slug.includes("?")) {
    score += 1;
  } else {
    issues.push("url_has_query_params");
  }

  return { score, issues };
}

function scorePageOnPage(page) {
  const titleResult = scoreTitleTag(page);
  const metaResult = scoreMetaDescription(page);
  const headingResult = scoreHeadingHierarchy(page);
  const contentResult = scoreContentDepth(page);
  const linksResult = scoreInternalLinks(page);
  const imageResult = scoreImageOptimization(page);
  const urlResult = scoreUrlStructure(page);

  const pageScore = Math.min(
    100,
    titleResult.score +
      metaResult.score +
      headingResult.score +
      contentResult.score +
      linksResult.score +
      imageResult.score +
      urlResult.score,
  );

  const allIssues = [
    ...titleResult.issues,
    ...metaResult.issues,
    ...headingResult.issues,
    ...contentResult.issues,
    ...linksResult.issues,
    ...imageResult.issues,
    ...urlResult.issues,
  ];

  return {
    url: page.url,
    pageScore,
    scoreBand: pageScore >= 80 ? "good" : pageScore >= 60 ? "needs_work" : "poor",
    dimensions: {
      titleTag: titleResult.score,
      metaDescription: metaResult.score,
      headingHierarchy: headingResult.score,
      contentDepth: contentResult.score,
      internalLinks: linksResult.score,
      imageOptimization: imageResult.score,
      urlStructure: urlResult.score,
    },
    issues: allIssues,
  };
}

function analyzeOnPage(normalizedInput) {
  const pageResults = normalizedInput.pages.map(scorePageOnPage);
  const totalPages = pageResults.length;

  const siteAverageScore = totalPages > 0
    ? Math.round(pageResults.reduce((s, p) => s + p.pageScore, 0) / totalPages)
    : 0;

  const pagesNeedingWork = pageResults.filter((p) => p.pageScore < 60);
  const criticalPages = pageResults.filter((p) => p.pageScore < 40);

  const issueCounts = {};
  for (const page of pageResults) {
    for (const issue of page.issues) {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    }
  }

  const topIssues = Object.entries(issueCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, affectedPages: count }));

  const highestGapPage = pageResults.length > 0
    ? pageResults.reduce((lowest, p) => p.pageScore < lowest.pageScore ? p : lowest, pageResults[0])
    : null;

  return {
    normalizedInput,
    pageResults,
    totalPages,
    siteAverageScore,
    siteScoreBand: siteAverageScore >= 80 ? "good" : siteAverageScore >= 60 ? "needs_work" : "poor",
    pagesNeedingWorkCount: pagesNeedingWork.length,
    criticalPageCount: criticalPages.length,
    topIssues,
    highestGapPage,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeOnPage,
  normalizeOnPageInput,
};
