function severityScore(level) {
  return level === "high" ? 3 : level === "medium" ? 2 : 1;
}

function buildInsight(type, summary, severity, evidence = {}) {
  return {
    type,
    summary,
    severity,
    severityScore: severityScore(severity),
    evidenceCount: Object.values(evidence).filter(Boolean).length,
    evidence,
  };
}

function generateOnPageInsights(analysisResult) {
  const insights = [];
  const {
    pageResults,
    siteAverageScore,
    siteScoreBand,
    criticalPageCount,
    pagesNeedingWorkCount,
    topIssues,
    totalPages,
  } = analysisResult;

  if (criticalPageCount > 0) {
    const criticalPages = pageResults.filter((p) => p.pageScore < 40);
    insights.push(buildInsight(
      "critical_pages_detected",
      `${criticalPageCount} page(s) scored below 40/100 — severely under-optimised and unlikely to rank competitively.`,
      "high",
      { criticalPages: true, urls: criticalPages.map((p) => p.url).filter(Boolean) },
    ));
  }

  const titleIssuePages = pageResults.filter(
    (p) => p.issues.some((i) => i.startsWith("title_")),
  ).length;
  if (totalPages > 0 && titleIssuePages / totalPages > 0.3) {
    insights.push(buildInsight(
      "widespread_title_tag_issues",
      `${titleIssuePages} of ${totalPages} page(s) have title tag issues — affecting keyword signal strength and SERP CTR.`,
      "high",
      { titleIssues: true },
    ));
  }

  const missingMetaPages = pageResults.filter(
    (p) => p.issues.includes("meta_description_missing"),
  ).length;
  if (totalPages > 0 && missingMetaPages / totalPages > 0.4) {
    insights.push(buildInsight(
      "missing_meta_descriptions",
      `${missingMetaPages} of ${totalPages} page(s) are missing meta descriptions — Google may auto-generate poor substitutes reducing CTR.`,
      "medium",
      { missingMeta: true },
    ));
  }

  const missingH1Pages = pageResults.filter(
    (p) => p.issues.includes("h1_missing"),
  ).length;
  if (missingH1Pages > 0) {
    insights.push(buildInsight(
      "missing_h1_tags",
      `${missingH1Pages} page(s) are missing H1 tags — H1 is a primary on-page keyword signal and its absence directly harms ranking potential.`,
      missingH1Pages / totalPages > 0.2 ? "high" : "medium",
      { missingH1: true },
    ));
  }

  const thinContentPages = pageResults.filter(
    (p) => p.issues.includes("content_too_thin"),
  ).length;
  if (thinContentPages > 0) {
    insights.push(buildInsight(
      "thin_content_pages",
      `${thinContentPages} page(s) have insufficient content depth (under 400 words) — thin content is a direct ranking disadvantage.`,
      thinContentPages > 2 ? "high" : "medium",
      { thinContent: true },
    ));
  }

  if (topIssues.length > 0) {
    const topIssue = topIssues[0];
    insights.push(buildInsight(
      "most_common_on_page_issue",
      `The most widespread issue across pages is "${topIssue.issue}" affecting ${topIssue.affectedPages} page(s).`,
      "medium",
      { topIssue: topIssue.issue, affectedCount: topIssue.affectedPages },
    ));
  }

  insights.push(buildInsight(
    "on_page_score_summary",
    `Site-wide on-page SEO average: ${siteAverageScore}/100 (${siteScoreBand}). ${pagesNeedingWorkCount} page(s) need improvement.`,
    siteScoreBand === "poor" ? "high" : siteScoreBand === "needs_work" ? "medium" : "low",
    { averageScore: siteAverageScore, pagesNeedingWork: pagesNeedingWorkCount > 0 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateOnPageInsights };
