function buildPressureInsight(finding) {
  return {
    type: "competitor_pressure",
    competitorRef: finding.competitorRef,
    severity: finding.pressureScore >= 25 ? "high" : "medium",
    message: `${finding.competitorRef} is outpacing the target across ${finding.strongestGapDimension.dimension}.`,
    evidence: {
      strongestGapDimension: finding.strongestGapDimension.dimension,
      pressureScore: finding.pressureScore,
      keywordGap: finding.keywordGap,
      contentGap: finding.contentGap,
      rankGap: finding.rankGap,
      reviewGap: finding.reviewGap,
    },
  };
}

function buildCoverageInsight(summary) {
  return {
    type: "coverage_summary",
    severity: summary.pressuredCompetitorCount > 0 ? "medium" : "low",
    message:
      summary.pressuredCompetitorCount > 0
        ? `${summary.pressuredCompetitorCount} competitors currently show stronger external signals than the target.`
        : "No competitor currently exceeds the target across the tracked comparison signals.",
    evidence: summary,
  };
}

function buildDaGapInsight(finding) {
  return {
    type: "domain_authority_gap",
    competitorRef: finding.competitorRef,
    severity: finding.daSeverity === "critical" ? "high" : finding.daSeverity === "significant" ? "medium" : "low",
    message: `${finding.competitorRef} has a domain authority gap of ${finding.daGap} points — classified as ${finding.daSeverity}. Authority gaps directly limit ranking potential on competitive keywords.`,
    evidence: {
      daGap: finding.daGap,
      daSeverity: finding.daSeverity,
      serpOverlap: finding.serpOverlapScore,
    },
  };
}

function buildTopicalGapInsight(finding) {
  return {
    type: "topical_coverage_gap",
    competitorRef: finding.competitorRef,
    severity: finding.topicalGap >= 20 ? "high" : "medium",
    message: `${finding.competitorRef} covers ${finding.topicalGap} more topics than the target — broader topical authority increases their domain-wide ranking signal.`,
    evidence: {
      topicalGap: finding.topicalGap,
    },
  };
}

function generateCompetitorInsights(analysisResult) {
  const pressuredFindings = analysisResult.gapFindings
    .filter((finding) => finding.gapDetected)
    .sort((left, right) => right.pressureScore - left.pressureScore);

  const insights = [];

  if (pressuredFindings[0]) {
    insights.push(buildPressureInsight(pressuredFindings[0]));
  }

  if (pressuredFindings[1]) {
    insights.push(buildPressureInsight(pressuredFindings[1]));
  }

  const highDaGap = pressuredFindings.find((f) => f.daGap > 15 && f.daSeverity);
  if (highDaGap) {
    insights.push(buildDaGapInsight(highDaGap));
  }

  const highTopicalGap = pressuredFindings.find((f) => f.topicalGap > 10);
  if (highTopicalGap) {
    insights.push(buildTopicalGapInsight(highTopicalGap));
  }

  insights.push(buildCoverageInsight(analysisResult.summary));

  return insights;
}

module.exports = {
  generateCompetitorInsights,
};
