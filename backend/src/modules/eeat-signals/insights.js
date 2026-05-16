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

function generateEeatInsights(analysisResult) {
  const insights = [];
  const { experience, expertise, authoritativeness, trustworthiness, overallEeatScore, eeatTier, ymylRiskLevel } = analysisResult;

  if (trustworthiness.trustScore < 50) {
    insights.push(buildInsight(
      "trust_signals_weak",
      `Trust score is ${trustworthiness.trustScore}/100 — missing critical trust elements. ${!trustworthiness.aboutPagePresent ? "About page missing. " : ""}${!trustworthiness.contactPagePresent ? "Contact page missing." : ""}`.trim(),
      "high",
      {
        missingAbout: !trustworthiness.aboutPagePresent,
        missingContact: !trustworthiness.contactPagePresent,
        missingPrivacy: !trustworthiness.signalTypes.includes("privacy_policy"),
        missingTerms: !trustworthiness.signalTypes.includes("terms_of_service"),
      },
    ));
  }

  if (experience.authorBioRatio < 0.5) {
    insights.push(buildInsight(
      "author_credibility_weak",
      `Only ${Math.round(experience.authorBioRatio * 100)}% of pages have linked author bios — Google increasingly uses author credibility as a quality signal.`,
      "high",
      { lowBioRatio: true, lowBylineRatio: experience.bylineRatio < 0.3 },
    ));
  }

  if (ymylRiskLevel === "high_scrutiny" && overallEeatScore < 60) {
    insights.push(buildInsight(
      "ymyl_eeat_gap",
      `This site operates in a YMYL niche (${analysisResult.normalizedInput.niche}) with an E-E-A-T score of ${overallEeatScore}/100 — Google applies higher quality standards here and weak signals risk ranking suppression.`,
      "high",
      { ymyl: true, lowScore: true },
    ));
  }

  if (authoritativeness.externalCitationCount < 5) {
    insights.push(buildInsight(
      "low_external_authority",
      `Only ${authoritativeness.externalCitationCount} external citation(s) detected. Being cited by credible external sources is a core authoritativeness signal.`,
      "medium",
      { fewCitations: true, noHighDACitations: authoritativeness.highDACitations === 0 },
    ));
  }

  if (expertise.authorCredentialCount === 0) {
    insights.push(buildInsight(
      "no_documented_expertise",
      "No author credentials detected across pages — expertise documentation is essential for ranking in competitive or specialist niches.",
      "medium",
      { noCredentials: true },
    ));
  }

  insights.push(buildInsight(
    "eeat_summary",
    `Overall E-E-A-T score: ${overallEeatScore}/100 (${eeatTier}). Experience: ${experience.experienceScore} | Expertise: ${expertise.expertiseScore} | Authority: ${authoritativeness.authorityScore} | Trust: ${trustworthiness.trustScore}.`,
    eeatTier === "weak" ? "high" : eeatTier === "moderate" ? "medium" : "low",
    { lowScore: overallEeatScore < 40, ymyl: ymylRiskLevel === "high_scrutiny" },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateEeatInsights };
