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

function generateLocalSeoInsights(analysisResult) {
  const insights = [];
  const { gbpAnalysis, napAnalysis, visibilityAnalysis, reviewAnalysis, overallLocalScore, scoreBand } = analysisResult;

  if (gbpAnalysis.gbpScore < 25) {
    insights.push(buildInsight(
      "gbp_incomplete",
      `Google Business Profile score is ${gbpAnalysis.gbpScore}/40 — critical fields missing: ${gbpAnalysis.issues.join(", ")}. An incomplete GBP directly reduces local pack eligibility.`,
      gbpAnalysis.gbpScore < 15 ? "high" : "medium",
      {
        missingCategory: gbpAnalysis.issues.includes("gbp_missing_category"),
        incompleteHours: gbpAnalysis.issues.includes("gbp_hours_incomplete"),
        lowPhotos: gbpAnalysis.issues.includes("gbp_insufficient_photos"),
        missingDescription: gbpAnalysis.issues.includes("gbp_missing_description"),
      },
    ));
  }

  if (napAnalysis.napConsistencyRatio < 0.8 && napAnalysis.citationCount > 0) {
    insights.push(buildInsight(
      "nap_inconsistency",
      `NAP consistency is ${Math.round(napAnalysis.napConsistencyRatio * 100)}% across ${napAnalysis.citationCount} citation(s) — inconsistent Name, Address, Phone across directories confuses Google and reduces local authority.`,
      napAnalysis.napConsistencyRatio < 0.6 ? "high" : "medium",
      { hasInconsistency: true, lowConsistency: napAnalysis.napConsistencyRatio < 0.6 },
    ));
  }

  if (visibilityAnalysis.totalLocalKeywords > 0 && visibilityAnalysis.localPackCount === 0) {
    insights.push(buildInsight(
      "not_in_local_pack",
      `None of the ${visibilityAnalysis.totalLocalKeywords} tracked local keyword(s) currently appear in the local pack — the 3-pack receives the majority of local search clicks.`,
      "high",
      { zeroPackPresence: true },
    ));
  } else if (visibilityAnalysis.localPackCount > 0 && visibilityAnalysis.localPackCount < visibilityAnalysis.totalLocalKeywords) {
    insights.push(buildInsight(
      "partial_local_pack_presence",
      `${visibilityAnalysis.localPackCount} of ${visibilityAnalysis.totalLocalKeywords} local keyword(s) appear in the local pack — expand pack presence by strengthening GBP signals and local citations.`,
      "medium",
      { partialPack: true },
    ));
  }

  if (reviewAnalysis.reviewAnalysis?.reviewSignals?.monthlyVelocity < 2) {
    insights.push(buildInsight(
      "slow_review_velocity",
      `Monthly review velocity is below 2 reviews/month — Google factors review quantity and recency into local pack rankings. A consistent review acquisition strategy is needed.`,
      "medium",
      { lowVelocity: true, lowRating: reviewAnalysis.reviewAnalysis?.reviewSignals?.averageRating < 4.0 },
    ));
  }

  insights.push(buildInsight(
    "local_seo_summary",
    `Overall local SEO score: ${overallLocalScore}/100 (${scoreBand}). GBP: ${gbpAnalysis.gbpScore}/40, NAP: ${napAnalysis.napScore}/20, Visibility: ${visibilityAnalysis.visibilityScore}/25, Reviews: ${reviewAnalysis.reviewScore}/15.`,
    scoreBand === "weak" ? "high" : scoreBand === "moderate" ? "medium" : "low",
    { lowScore: overallLocalScore < 40 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateLocalSeoInsights };
