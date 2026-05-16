import 'package:equatable/equatable.dart';

class ContentAnalysis extends Equatable {
  final String id;
  final String url;
  final double seoScore;
  final List<ContentIssue> issues;
  final List<ContentOpportunity> opportunities;
  final String? topInsight;
  final String? topAction;

  const ContentAnalysis({
    required this.id,
    required this.url,
    required this.seoScore,
    this.issues = const [],
    this.opportunities = const [],
    this.topInsight,
    this.topAction,
  });

  @override
  List<Object?> get props => [id, url, seoScore, issues, opportunities, topInsight, topAction];
}

class ContentIssue extends Equatable {
  final String id;
  final String title;
  final String description;
  final String severity;
  final String? fixAction;

  const ContentIssue({
    required this.id,
    required this.title,
    required this.description,
    required this.severity,
    this.fixAction,
  });

  @override
  List<Object?> get props => [id, title, description, severity, fixAction];
}

class ContentOpportunity extends Equatable {
  final String id;
  final String title;
  final String description;
  final String impact;
  final String? action;

  const ContentOpportunity({
    required this.id,
    required this.title,
    required this.description,
    required this.impact,
    this.action,
  });

  @override
  List<Object?> get props => [id, title, description, impact, action];
}
