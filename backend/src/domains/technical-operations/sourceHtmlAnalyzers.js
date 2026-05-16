const { createGovernanceService } = require("../governance/service");
const { createTechnicalFinding } = require("./analyzerContract");

const governanceService = createGovernanceService();

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function stripTags(html = "") {
  return normalizeText(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function extractTitle(html = "") {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return normalizeText(match?.[1] || "");
}

function extractMetaContent(html = "", name) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i");
  const reversePattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`, "i");
  const match = html.match(pattern) || html.match(reversePattern);
  return normalizeText(match?.[1] || "");
}

function extractCanonical(html = "") {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i)
    || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["'][^>]*>/i);
  return normalizeText(match?.[1] || "");
}

function extractHeadings(html = "") {
  const matches = Array.from(html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi));
  return matches.map((match) => ({
    level: match[1].toLowerCase(),
    text: stripTags(match[2]),
  }));
}

function extractMetaRobots(html = "") {
  return extractMetaContent(html, "robots");
}

function extractRobotsDirectives(robotsTxt = "") {
  return normalizeText(robotsTxt).toLowerCase();
}

function extractSitemapEntries(sitemapXml = "") {
  const locMatches = Array.from(sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi));
  return locMatches.map((match) => normalizeText(match[1])).filter(Boolean);
}

function extractAnchors(html = "") {
  const matches = Array.from(html.matchAll(/<a[^>]+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi));
  return matches.map((match) => ({
    href: normalizeText(match[1]),
    text: stripTags(match[2]),
  }));
}

function extractAssetReferences(html = "") {
  const srcMatches = Array.from(html.matchAll(/<(img|script)[^>]+src=["']([^"']*)["'][^>]*>/gi));
  return srcMatches.map((match) => ({
    tag: match[1].toLowerCase(),
    src: normalizeText(match[2]),
  }));
}

function buildGovernanceRisk(recommendedAction) {
  return governanceService.evaluateActionGovernance(recommendedAction);
}

function resolveOrigin(url) {
  try {
    return url ? new URL(url).origin : null;
  } catch (error) {
    return null;
  }
}

function buildFinding(input) {
  return createTechnicalFinding({
    ...input,
    governanceRisk: buildGovernanceRisk(input.recommendedAction),
  });
}

function analyzeMetadata(context = {}) {
  const findings = [];
  const title = extractTitle(context.html);
  const metaDescription = extractMetaContent(context.html, "description");

  if (!title) {
    findings.push(buildFinding({
      analyzerKey: "metadata",
      findingKey: "missing_title",
      severity: "high",
      evidence: {
        url: context.url || null,
        titlePresent: false,
      },
      recommendedAction: {
        title: "Add a descriptive page title",
        summary: "Create a unique, people-first title that describes the page topic clearly.",
        actionType: "metadata_update",
        payload: {
          field: "title",
          scope: "single_page",
        },
      },
      confidence: 0.95,
    }));
  }

  if (!metaDescription) {
    findings.push(buildFinding({
      analyzerKey: "metadata",
      findingKey: "missing_meta_description",
      severity: "medium",
      evidence: {
        url: context.url || null,
        metaDescriptionPresent: false,
      },
      recommendedAction: {
        title: "Add a page meta description",
        summary: "Write a concise page-level meta description instead of leaving the snippet uncontrolled.",
        actionType: "metadata_update",
        payload: {
          field: "meta_description",
          scope: "single_page",
        },
      },
      confidence: 0.9,
    }));
  }

  return findings;
}

function analyzeHeadings(context = {}) {
  const findings = [];
  const headings = extractHeadings(context.html);
  const h1Count = headings.filter((heading) => heading.level === "h1").length;

  if (h1Count === 0) {
    findings.push(buildFinding({
      analyzerKey: "headings",
      findingKey: "missing_h1",
      severity: "high",
      evidence: {
        url: context.url || null,
        headingCount: headings.length,
        h1Count,
      },
      recommendedAction: {
        title: "Add one clear H1 heading",
        summary: "Introduce a single descriptive H1 that matches the page purpose.",
        actionType: "heading_update",
        payload: {
          field: "h1",
          scope: "single_page",
        },
      },
      confidence: 0.95,
    }));
  }

  if (h1Count > 1) {
    findings.push(buildFinding({
      analyzerKey: "headings",
      findingKey: "multiple_h1",
      severity: "medium",
      evidence: {
        url: context.url || null,
        h1Count,
      },
      recommendedAction: {
        title: "Reduce multiple H1 headings",
        summary: "Keep one primary H1 and demote the remaining headings to preserve clearer structure.",
        actionType: "heading_update",
        payload: {
          field: "h1",
          scope: "single_page",
        },
      },
      confidence: 0.85,
    }));
  }

  return findings;
}

function analyzeCanonical(context = {}) {
  const findings = [];
  const canonical = extractCanonical(context.html);

  if (!canonical) {
    findings.push(buildFinding({
      analyzerKey: "canonical",
      findingKey: "missing_canonical",
      severity: "medium",
      evidence: {
        url: context.url || null,
        canonicalPresent: false,
      },
      recommendedAction: {
        title: "Set a canonical URL",
        summary: "Add a canonical link that reflects the preferred page URL.",
        actionType: "canonical_update",
        payload: {
          scope: "single_page",
        },
      },
      confidence: 0.85,
    }));
  }

  if (canonical && context.url && canonical !== context.url) {
    findings.push(buildFinding({
      analyzerKey: "canonical",
      findingKey: "canonical_mismatch",
      severity: "high",
      evidence: {
        url: context.url,
        canonical,
      },
      recommendedAction: {
        title: "Review canonical mismatch",
        summary: "Confirm the canonical target is intentional and does not deindex the wrong page.",
        actionType: "canonical_review",
        payload: {
          scope: "single_page",
          canonical,
        },
      },
      confidence: 0.75,
    }));
  }

  return findings;
}

function analyzeRobots(context = {}) {
  const findings = [];
  const metaRobots = extractMetaRobots(context.html).toLowerCase();
  const robotsTxt = extractRobotsDirectives(context.robotsTxt || "");

  if (metaRobots.includes("noindex")) {
    findings.push(buildFinding({
      analyzerKey: "robots",
      findingKey: "meta_noindex_present",
      severity: "high",
      evidence: {
        url: context.url || null,
        metaRobots,
      },
      recommendedAction: {
        title: "Review page noindex directive",
        summary: "Confirm the noindex directive is intentional before keeping the page out of search.",
        actionType: "robots_review",
        payload: {
          directive: metaRobots,
          scope: "single_page",
        },
      },
      confidence: 0.95,
    }));
  }

  if (robotsTxt && !robotsTxt.includes("sitemap:")) {
    findings.push(buildFinding({
      analyzerKey: "robots",
      findingKey: "robots_missing_sitemap_reference",
      severity: "low",
      evidence: {
        robotsTxt,
      },
      recommendedAction: {
        title: "Add sitemap reference to robots.txt",
        summary: "Reference the XML sitemap in robots.txt to improve discoverability.",
        actionType: "robots_update",
        payload: {
          scope: "sitewide",
        },
      },
      confidence: 0.7,
    }));
  }

  return findings;
}

function analyzeSitemap(context = {}) {
  const findings = [];
  const entries = extractSitemapEntries(context.sitemapXml || "");

  if (!context.sitemapXml) {
    findings.push(buildFinding({
      analyzerKey: "sitemap",
      findingKey: "sitemap_unavailable",
      severity: "medium",
      evidence: {
        sitemapAvailable: false,
      },
      recommendedAction: {
        title: "Provide sitemap source for audit",
        summary: "Connect sitemap XML input before relying on sitemap health checks.",
        actionType: "sitemap_enablement",
        payload: {
          scope: "sitewide",
        },
      },
      confidence: 0.9,
    }));
    return findings;
  }

  if (entries.length === 0) {
    findings.push(buildFinding({
      analyzerKey: "sitemap",
      findingKey: "empty_sitemap",
      severity: "high",
      evidence: {
        sitemapEntryCount: 0,
      },
      recommendedAction: {
        title: "Fix empty sitemap content",
        summary: "Populate the sitemap with valid page entries before using it as a discovery signal.",
        actionType: "sitemap_update",
        payload: {
          scope: "sitewide",
        },
      },
      confidence: 0.95,
    }));
  }

  return findings;
}

function analyzeIndexability(context = {}) {
  const findings = [];
  const metaRobots = extractMetaRobots(context.html).toLowerCase();

  if (!context.html && context.url) {
    findings.push(buildFinding({
      analyzerKey: "indexability",
      findingKey: "source_html_unavailable",
      severity: "medium",
      evidence: {
        url: context.url,
        sourceHtmlAvailable: false,
      },
      recommendedAction: {
        title: "Provide source HTML for indexability audit",
        summary: "Indexability findings need source HTML or crawl responses instead of URL-only input.",
        actionType: "audit_input_enablement",
        payload: {
          scope: "single_page",
        },
      },
      confidence: 0.95,
    }));
  }

  if (metaRobots.includes("nofollow")) {
    findings.push(buildFinding({
      analyzerKey: "indexability",
      findingKey: "nofollow_present",
      severity: "medium",
      evidence: {
        metaRobots,
      },
      recommendedAction: {
        title: "Review nofollow directive",
        summary: "Confirm that the nofollow directive is intentional for this page.",
        actionType: "indexability_review",
        payload: {
          scope: "single_page",
        },
      },
      confidence: 0.85,
    }));
  }

  return findings;
}

function analyzeInternalLinks(context = {}) {
  const findings = [];
  const anchors = extractAnchors(context.html);
  const origin = resolveOrigin(context.url);
  const internalLinks = anchors.filter(
    (anchor) => anchor.href.startsWith("/") || (origin && anchor.href.startsWith(origin)),
  );

  if (internalLinks.length === 0) {
    findings.push(buildFinding({
      analyzerKey: "internal_links",
      findingKey: "missing_internal_links",
      severity: "medium",
      evidence: {
        internalLinkCount: 0,
      },
      recommendedAction: {
        title: "Add relevant internal links",
        summary: "Add a small number of relevant internal links to connect this page to nearby topical pages.",
        actionType: "internal_link_update",
        payload: {
          scope: "single_page",
        },
      },
      confidence: 0.8,
    }));
  }

  return findings;
}

function analyzeDuplicateRisk(context = {}) {
  const findings = [];
  const text = stripTags(context.html);
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  if (wordCount > 0 && wordCount < 80) {
    findings.push(buildFinding({
      analyzerKey: "duplicate_risk",
      findingKey: "thin_content_risk",
      severity: "medium",
      evidence: {
        wordCount,
      },
      recommendedAction: {
        title: "Expand thin source content carefully",
        summary: "Add useful original detail before publishing more near-duplicate content around the same topic.",
        actionType: "content_quality_update",
        payload: {
          scope: "single_page",
        },
      },
      confidence: 0.75,
    }));
  }

  return findings;
}

function analyzeRedirectChain(context = {}) {
  const findings = [];
  const redirectChain = Array.isArray(context.redirectChain) ? context.redirectChain : [];

  if (redirectChain.length >= 3) {
    findings.push(buildFinding({
      analyzerKey: "redirect_chain",
      findingKey: "redirect_chain_detected",
      severity: "high",
      evidence: {
        redirectChain,
        chainLength: redirectChain.length,
      },
      recommendedAction: {
        title: "Shorten redirect chain",
        summary: "Reduce the redirect chain to the final canonical destination to lower crawl and user friction.",
        actionType: "redirect_update",
        payload: {
          scope: "single_page",
          redirectChain,
        },
      },
      confidence: 0.95,
    }));
  }

  return findings;
}

function analyzeBrokenLinksAssets(context = {}) {
  const findings = [];
  const anchors = extractAnchors(context.html);
  const assets = extractAssetReferences(context.html);
  const suspiciousLinks = anchors.filter((anchor) => anchor.href === "#" || anchor.href.toLowerCase().startsWith("javascript:"));
  const suspiciousAssets = assets.filter((asset) => !asset.src || asset.src === "#");

  if (suspiciousLinks.length > 0) {
    findings.push(buildFinding({
      analyzerKey: "broken_links_assets",
      findingKey: "suspicious_link_targets",
      severity: "medium",
      evidence: {
        linkCount: suspiciousLinks.length,
        sampleLinks: suspiciousLinks.slice(0, 3),
      },
      recommendedAction: {
        title: "Replace broken or placeholder links",
        summary: "Replace placeholder anchor targets with valid destinations before treating the page as healthy.",
        actionType: "link_fix",
        payload: {
          scope: "single_page",
        },
      },
      confidence: 0.85,
    }));
  }

  if (suspiciousAssets.length > 0) {
    findings.push(buildFinding({
      analyzerKey: "broken_links_assets",
      findingKey: "suspicious_asset_sources",
      severity: "medium",
      evidence: {
        assetCount: suspiciousAssets.length,
        sampleAssets: suspiciousAssets.slice(0, 3),
      },
      recommendedAction: {
        title: "Fix broken asset references",
        summary: "Replace placeholder or empty asset sources with valid files.",
        actionType: "asset_fix",
        payload: {
          scope: "single_page",
        },
      },
      confidence: 0.8,
    }));
  }

  return findings;
}

function buildRenderedDomPlaceholder() {
  // Rendered DOM analysis requires a headless browser (e.g. Playwright).
  // To enable: set RENDERER_ENDPOINT=http://localhost:3001 and run a
  // compatible renderer service that accepts POST /render with { url }
  // and returns { html, statusCode }. The renderer contract is defined
  // in domains/technical-operations/contract.js (rendererContract).
  const rendererEndpoint = process.env.RENDERER_ENDPOINT || null;
  return {
    analyzerKey: "rendered_dom",
    status: rendererEndpoint ? "renderer_configured_not_called" : "renderer_not_configured",
    source: "rendered_dom",
    requiresRenderer: true,
    rendererEndpoint: rendererEndpoint || null,
    configurationInstructions: rendererEndpoint
      ? null
      : "Set RENDERER_ENDPOINT env var to a running renderer service URL to enable rendered DOM analysis.",
    findings: [],
  };
}

function runSourceHtmlAnalyzers(input = {}) {
  const context = {
    url: normalizeText(input.url) || null,
    html: normalizeText(input.html || input.sourceHtml || ""),
    robotsTxt: normalizeText(input.robotsTxt || ""),
    sitemapXml: normalizeText(input.sitemapXml || ""),
    redirectChain: Array.isArray(input.redirectChain) ? input.redirectChain : [],
  };

  const findings = [
    ...analyzeMetadata(context),
    ...analyzeHeadings(context),
    ...analyzeCanonical(context),
    ...analyzeRobots(context),
    ...analyzeSitemap(context),
    ...analyzeIndexability(context),
    ...analyzeInternalLinks(context),
    ...analyzeDuplicateRisk(context),
    ...analyzeRedirectChain(context),
    ...analyzeBrokenLinksAssets(context),
  ];

  return {
    source: "source_html",
    inputType: context.html ? "html_payload" : context.url ? "url_only" : "empty",
    url: context.url,
    findings,
  };
}

module.exports = {
  buildRenderedDomPlaceholder,
  runSourceHtmlAnalyzers,
};
