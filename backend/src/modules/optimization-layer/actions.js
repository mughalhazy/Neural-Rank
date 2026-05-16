function toPriority(issueCount) {
  if (issueCount >= 3) {
    return "high";
  }

  if (issueCount >= 2) {
    return "medium";
  }

  return "low";
}

function buildImprovementAction(finding) {
  const issueTypes = new Set(finding.issues);

  if (issueTypes.has("keyword_overstuffed")) {
    return {
      type: "fix_keyword_overstuffing",
      priority: toPriority(finding.issues.length),
      sectionRef: finding.sectionRef,
      action: "Reduce keyword density below 3% — rewrite over-optimised sentences using natural language and synonym variation.",
      evidence: { issues: finding.issues, keywordDensity: finding.keywordDensity },
    };
  }

  if (issueTypes.has("low_semantic_richness")) {
    return {
      type: "improve_semantic_richness",
      priority: toPriority(finding.issues.length),
      sectionRef: finding.sectionRef,
      action: "Enrich content with related terms and LSI keywords to improve semantic depth and topical relevance signals.",
      evidence: { issues: finding.issues, semanticRichness: finding.semanticRichness },
    };
  }

  if (issueTypes.has("content_stale")) {
    return {
      type: "refresh_stale_content",
      priority: toPriority(finding.issues.length),
      sectionRef: finding.sectionRef,
      action: "Refresh stale content with updated information, new examples, and a revised publish date to recover freshness signals.",
      evidence: { issues: finding.issues, freshnessSignal: finding.freshnessSignal },
    };
  }

  if (issueTypes.has("readability_complex")) {
    return {
      type: "simplify_complex_readability",
      priority: toPriority(finding.issues.length),
      sectionRef: finding.sectionRef,
      action: "Simplify sentence structure — aim for an average sentence length under 20 words. Break complex paragraphs into shorter, scannable blocks.",
      evidence: { issues: finding.issues },
    };
  }

  if (issueTypes.has("keyword_coverage_missing")) {
    return {
      type: "expand_keyword_coverage",
      priority: toPriority(finding.issues.length),
      sectionRef: finding.sectionRef,
      action: "Expand section keyword coverage using the tracked target terms.",
      evidence: { issues: finding.issues, missingKeywordCount: finding.missingKeywordCount },
    };
  }

  if (issueTypes.has("metadata_incomplete")) {
    return {
      type: "complete_section_metadata",
      priority: toPriority(finding.issues.length),
      sectionRef: finding.sectionRef,
      action: "Complete the missing metadata for the section before further optimization work.",
      evidence: { issues: finding.issues },
    };
  }

  if (issueTypes.has("content_thin")) {
    return {
      type: "expand_thin_content",
      priority: toPriority(finding.issues.length),
      sectionRef: finding.sectionRef,
      action: "Expand thin section content so the section carries clearer optimization value.",
      evidence: { issues: finding.issues, contentLength: finding.contentLength },
    };
  }

  return {
    type: "optimization_improvement_action",
    priority: toPriority(finding.issues.length),
    sectionRef: finding.sectionRef,
    action: "Refine the section to improve optimization quality.",
    evidence: { issues: finding.issues, missingKeywordCount: finding.missingKeywordCount },
  };
}

function buildBaselineAction(summary) {
  return {
    type: "optimization_monitoring_action",
    priority: summary.sectionsNeedingOptimization > 0 ? "medium" : "low",
    action:
      summary.sectionsNeedingOptimization > 0
        ? "Re-run optimization analysis after content and metadata changes to confirm gap reduction."
        : "Preserve optimization baselines so future regressions can be detected.",
    evidence: summary,
  };
}

function generateOptimizationActions(analysisResult) {
  const actions = analysisResult.sectionFindings
    .filter((finding) => finding.issues.length > 0)
    .sort((left, right) => right.issues.length - left.issues.length)
    .slice(0, 3)
    .map(buildImprovementAction);

  actions.push(buildBaselineAction(analysisResult.summary));
  return actions;
}

module.exports = {
  generateOptimizationActions,
};
