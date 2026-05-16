import 'package:flutter/material.dart';

enum ModuleAvailability { active, locked }

class MetricData {
  const MetricData({
    required this.label,
    required this.value,
    required this.delta,
    required this.tone,
    this.caption,
    this.meaning = '',
    this.action = '',
  });

  final String label;
  final String value;
  final String delta;
  final Color tone;
  final String? caption;
  final String meaning;
  final String action;
}

class PriorityActionData {
  const PriorityActionData({
    required this.title,
    required this.summary,
    required this.priority,
    required this.timeEstimate,
    required this.tone,
  });

  final String title;
  final String summary;
  final String priority;
  final String timeEstimate;
  final Color tone;
}

class InsightData {
  const InsightData({
    required this.title,
    required this.summary,
    required this.evidence,
    required this.tone,
    this.impact = '',
    this.action = '',
    this.nextStep,
  });

  final String title;
  final String summary;
  final List<String> evidence;
  final Color tone;
  final String impact;
  final String action;
  final String? nextStep;
}

class FeatureEvidenceData {
  const FeatureEvidenceData({
    required this.label,
    required this.value,
    required this.interpretation,
  });

  final String label;
  final String value;
  final String interpretation;
}

class ModuleFeatureData {
  const ModuleFeatureData({
    required this.module,
    required this.feature,
    required this.commercialJob,
    required this.decisionSupported,
    required this.valueCreated,
    required this.primaryAction,
    required this.actionType,
    required this.tone,
    required this.evidence,
    required this.backendActionTypes,
  });

  final String module;
  final String feature;
  final String commercialJob;
  final String decisionSupported;
  final String valueCreated;
  final String primaryAction;
  final String actionType;
  final Color tone;
  final List<FeatureEvidenceData> evidence;
  final List<String> backendActionTypes;
}

class CommercialFeatureData {
  const CommercialFeatureData({
    required this.name,
    required this.description,
    required this.iconKey,
  });

  final String name;
  final String description;
  final String iconKey;
}

class TrendRowData {
  const TrendRowData({
    required this.label,
    required this.primaryValue,
    required this.secondaryValue,
    required this.delta,
    required this.isPositive,
    required this.flag,
    this.explanation = '',
    this.action = '',
  });

  final String label;
  final String primaryValue;
  final String secondaryValue;
  final String delta;
  final bool isPositive;
  final String flag;
  final String explanation;
  final String action;
}

class ModulePreviewData {
  const ModulePreviewData({
    required this.title,
    required this.summary,
    required this.badge,
    required this.availability,
    required this.metrics,
  });

  final String title;
  final String summary;
  final String badge;
  final ModuleAvailability availability;
  final List<String> metrics;
}

class ReviewClusterData {
  const ReviewClusterData({
    required this.title,
    required this.mentionCount,
    required this.sentimentLabel,
    required this.summary,
    required this.examples,
    required this.tone,
  });

  final String title;
  final int mentionCount;
  final String sentimentLabel;
  final String summary;
  final List<String> examples;
  final Color tone;
}

class CompetitorComparisonData {
  const CompetitorComparisonData({
    required this.name,
    required this.visibility,
    required this.reviewTrust,
    required this.messaging,
    required this.advantage,
    required this.tone,
  });

  final String name;
  final String visibility;
  final String reviewTrust;
  final String messaging;
  final String advantage;
  final Color tone;
}
