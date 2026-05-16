import 'package:seosync/data/models/insight.dart';
import 'package:seosync/data/models/keyword.dart';
import 'package:seosync/data/models/rank_data.dart';
import 'package:seosync/data/models/review.dart';
import 'package:seosync/data/models/content_analysis.dart';
import 'package:seosync/data/models/user.dart';

/// Abstract repository contract — domain-driven, backend-agnostic
abstract class SEORepository {
  // Auth
  Future<User?> getCurrentUser();
  Future<User> signIn(String email, String password);
  Future<void> signOut();

  // Dashboard
  Future<List<Insight>> getDashboardInsights();
  Future<Map<String, dynamic>> getDashboardSummary();

  // Keyword Analysis
  Future<List<Keyword>> analyzeKeywords(String query);
  Future<List<Keyword>> getSavedKeywords();

  // Rank Tracking
  Future<List<RankData>> getRankData(String url);
  Future<List<RankData>> trackKeyword(String keyword, String url);

  // Content Insights
  Future<ContentAnalysis> analyzeContent(String url);

  // Review Analysis
  Future<List<Review>> analyzeReviews(String appUrl);
  Future<Map<String, dynamic>> getReviewSummary(String appUrl);

  // Settings
  Future<void> updateSettings(Map<String, dynamic> settings);
  Future<Map<String, dynamic>> getSettings();
}
