/// App-wide constants following systematic UI architecture

class AppConstants {
  static const String appName = 'Neural Rank';
  static const String backendBaseUrl = 'https://neural-rank-backend.onrender.com/v1';
  static const String appTagline = 'Insight to Action';
  static const String appVersion = '1.0.0';

  static const bool moduleReviewActive = true;
  static const bool moduleContentActive = true;
  static const bool moduleKeywordActive = true;
  static const bool moduleRankActive = true;

  static const bool moduleCompetitorActive = false;
  static const bool moduleOptimizationActive = false;
  static const bool moduleCreativeActive = false;
  static const bool moduleWorkflowActive = false;

  static const int navTimeoutMs = 300;
  static const int apiTimeoutSeconds = 30;
  static const int apiRetryCount = 3;
  static const Duration cacheDuration = Duration(hours: 1);
  static const int defaultPageSize = 20;
  static const Duration animationFast = Duration(milliseconds: 150);
  static const Duration animationMedium = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);
}

class ModuleNames {
  static const String review = 'Review Analysis';
  static const String content = 'Content Insights';
  static const String keyword = 'Keyword Analysis';
  static const String rank = 'Rank Tracking';
  static const String competitor = 'Competitor Analysis';
  static const String optimization = 'Optimization';
  static const String creative = 'Creative / Messaging';
  static const String workflow = 'Unified Workflow';
}

class PriorityLabels {
  static const String high = 'High Impact';
  static const String medium = 'Medium Impact';
  static const String low = 'Low Impact';
  static const String critical = 'Critical';
}
