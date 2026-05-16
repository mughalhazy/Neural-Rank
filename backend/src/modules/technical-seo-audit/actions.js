function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "core_web_vitals_failing":
      return {
        type: "fix_core_web_vitals",
        title: "Fix failing Core Web Vitals",
        action: "Investigate and resolve poor LCP, CLS, or INP scores. Prioritise image optimisation, layout shift elimination, and interaction responsiveness.",
        priority: "high",
        affectedVitals: Object.entries(insight.evidence)
          .filter(([, v]) => v)
          .map(([k]) => k.toUpperCase()),
      };

    case "crawlability_blocked":
      return {
        type: "resolve_crawl_blocks",
        title: "Resolve crawl blocks",
        action: "Audit robots.txt for unintended disallow rules and review noindex meta tags across key pages.",
        priority: "high",
      };

    case "canonical_issues_detected":
      return {
        type: "fix_canonical_issues",
        title: "Fix canonical tag issues",
        action: "Review and correct self-referencing, missing, or conflicting canonical tags. Consolidate duplicate URL variants (www/non-www, trailing slash).",
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "broken_internal_links":
      return {
        type: "fix_broken_internal_links",
        title: "Fix broken internal links",
        action: "Crawl the site, identify all 404-returning internal links, and update or redirect them to preserve crawl equity.",
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "redirect_issues":
      return {
        type: "collapse_redirect_chains",
        title: "Collapse redirect chains and fix broken redirects",
        action: "Update redirect chains to point directly to the final destination URL. Fix or remove redirects pointing to 404 targets.",
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "schema_markup_missing":
      return {
        type: "implement_schema_markup",
        title: "Implement schema markup",
        action: "Add structured data (Article, FAQPage, BreadcrumbList, Product as relevant) to improve rich result eligibility and CTR.",
        priority: "medium",
      };

    case "security_signal_weak":
      return {
        type: "fix_https_security",
        title: "Resolve HTTPS security issues",
        action: "Ensure all page resources load over HTTPS. Update all internal links and canonical URLs to https://. Fix mixed-content warnings.",
        priority: "medium",
      };

    default:
      return {
        type: "schedule_technical_reaudit",
        title: "Schedule periodic technical reaudit",
        action: "Re-run the technical SEO audit after completing fixes to verify resolution and track score improvement.",
        priority: "low",
      };
  }
}

function prioritizeTechnicalSeoActions(insightsPayload) {
  const priorityRank = { high: 3, medium: 2, low: 1 };

  const seen = new Set();
  const actionsPayload = insightsPayload
    .map(createActionFromInsight)
    .filter((action) => {
      if (seen.has(action.type)) return false;
      seen.add(action.type);
      return true;
    })
    .sort(
      (a, b) =>
        priorityRank[b.priority] - priorityRank[a.priority] ||
        a.title.localeCompare(b.title),
    );

  if (!seen.has("schedule_technical_reaudit")) {
    actionsPayload.push({
      type: "schedule_technical_reaudit",
      title: "Schedule periodic technical reaudit",
      action: "Re-run the technical SEO audit after completing fixes to verify resolution and track score improvement.",
      priority: "low",
    });
  }

  const priorityPayload = actionsPayload.map((action) => ({
    type: action.type,
    priority: action.priority,
    title: action.title,
  }));

  return { priorityPayload, actionsPayload };
}

module.exports = { prioritizeTechnicalSeoActions };
