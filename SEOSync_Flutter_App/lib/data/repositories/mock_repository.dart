import 'dart:math';
import 'package:seosync/data/models/insight.dart';
import 'package:seosync/data/models/keyword.dart';
import 'package:seosync/data/models/rank_data.dart';
import 'package:seosync/data/models/review.dart';
import 'package:seosync/data/models/content_analysis.dart';
import 'package:seosync/data/models/user.dart';
import 'package:seosync/data/repositories/seo_repository.dart';

/// Mock repository for MVP — simulates backend responses
/// Ready for Supabase swap with zero UI changes
class MockRepository implements SEORepository {
  final _random = Random();

  @override
  Future<User?> getCurrentUser() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return User(
      id: 'user_001',
      email: 'user@seosync.app',
      displayName: 'SEO Manager',
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      activeModules: ['review', 'content', 'keyword', 'rank'],
    );
  }

  @override
  Future<User> signIn(String email, String password) async {
    await Future.delayed(const Duration(milliseconds: 800));
    return User(
      id: 'user_001',
      email: email,
      displayName: 'SEO Manager',
      createdAt: DateTime.now(),
      activeModules: ['review', 'content', 'keyword', 'rank'],
    );
  }

  @override
  Future<void> signOut() async {
    await Future.delayed(const Duration(milliseconds: 300));
  }

  @override
  Future<List<Insight>> getDashboardInsights() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return [
      Insight(
        id: 'ins_001',
        title: '3 keywords dropped in ranking',
        description: 'Your top-performing keywords "seo tools" and "keyword tracker" lost 3 positions each. Consider refreshing content.',
        module: 'Rank Tracking',
        priority: 'High Impact',
        action: 'Review and update content for dropped keywords',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Insight(
        id: 'ins_002',
        title: 'New keyword opportunity detected',
        description: 'High-volume low-competition keyword "mobile seo optimization" identified with 12K monthly searches.',
        module: 'Keyword Analysis',
        priority: 'High Impact',
        action: 'Create content targeting this keyword',
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      Insight(
        id: 'ins_003',
        title: 'Review sentiment declining',
        description: 'Recent reviews show 23% increase in "slow loading" complaints. Page speed may need attention.',
        module: 'Review Analysis',
        priority: 'Medium Impact',
        action: 'Audit page speed and optimize core web vitals',
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
      ),
      Insight(
        id: 'ins_004',
        title: 'Meta description too short',
        description: '12 pages have meta descriptions under 120 characters. Longer descriptions improve CTR.',
        module: 'Content Insights',
        priority: 'Low Impact',
        action: 'Expand meta descriptions to 150-160 characters',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];
  }

  @override
  Future<Map<String, dynamic>> getDashboardSummary() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return {
      'totalKeywords': 247,
      'avgPosition': 12.4,
      'positionChange': -1.2,
      'seoScore': 78,
      'scoreChange': 3,
      'insightsCount': 12,
      'newInsights': 4,
      'topPriority': 'High Impact',
    };
  }

  @override
  Future<List<Keyword>> analyzeKeywords(String query) async {
    await Future.delayed(const Duration(milliseconds: 800));
    final seeds = [
      ('$query tools', 15400, 0.42, 2.50, 'Commercial'),
      ('$query optimization', 12100, 0.38, 3.20, 'Informational'),
      ('best $query', 8900, 0.55, 4.10, 'Commercial'),
      ('$query strategy', 7200, 0.33, 1.80, 'Informational'),
      ('$query checklist', 5400, 0.28, 1.50, 'Informational'),
      ('$query for beginners', 4300, 0.25, 2.00, 'Informational'),
      ('advanced $query', 3200, 0.48, 3.50, 'Informational'),
      ('$query software', 2800, 0.52, 5.00, 'Commercial'),
      ('$query agency', 2100, 0.45, 6.20, 'Commercial'),
      ('$query audit', 1900, 0.35, 2.80, 'Informational'),
    ];
    return seeds.asMap().entries.map((e) {
      final (term, vol, diff, cpc, intent) = e.value;
      return Keyword(
        id: 'kw_${e.key.toString().padLeft(3, '0')}',
        term: term,
        searchVolume: vol,
        difficulty: diff,
        cpc: cpc,
        intent: intent,
        relatedTerms: ['related_${e.key}a', 'related_${e.key}b'],
        insight: vol > 10000 ? 'High volume opportunity with manageable difficulty' : null,
        action: vol > 10000 ? 'Prioritize content creation for this keyword' : null,
      );
    }).toList();
  }

  @override
  Future<List<Keyword>> getSavedKeywords() async {
    return analyzeKeywords('seo');
  }

  @override
  Future<List<RankData>> getRankData(String url) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final keywords = ['seo tools', 'keyword tracker', 'rank checker', 'backlink analyzer', 'site audit'];
    return keywords.asMap().entries.map((e) {
      final pos = 5 + _random.nextInt(20);
      final prev = pos + _random.nextInt(6) - 3;
      return RankData(
        id: 'rank_${e.key.toString().padLeft(3, '0')}',
        keyword: e.value,
        url: url,
        currentPosition: pos,
        previousPosition: prev,
        trackedAt: DateTime.now().subtract(const Duration(days: 1)),
        insight: pos > 10 ? 'Outside top 10 — optimize content to improve visibility' : null,
        action: pos > 10 ? 'Add more depth and internal links' : null,
      );
    }).toList();
  }

  @override
  Future<List<RankData>> trackKeyword(String keyword, String url) async {
    return getRankData(url);
  }

  @override
  Future<ContentAnalysis> analyzeContent(String url) async {
    await Future.delayed(const Duration(milliseconds: 700));
    return ContentAnalysis(
      id: 'ca_001',
      url: url,
      seoScore: 78,
      issues: [
        ContentIssue(
          id: 'ci_001',
          title: 'Missing alt text on 4 images',
          description: 'Images without alt text reduce accessibility and SEO value.',
          severity: 'Medium',
          fixAction: 'Add descriptive alt text to all images',
        ),
        ContentIssue(
          id: 'ci_002',
          title: 'H1 tag missing',
          description: 'Page lacks a primary H1 heading.',
          severity: 'High',
          fixAction: 'Add a single H1 tag with primary keyword',
        ),
        ContentIssue(
          id: 'ci_003',
          title: 'Meta description too short',
          description: 'Current meta description is 89 characters.',
          severity: 'Low',
          fixAction: 'Expand to 150-160 characters',
        ),
      ],
      opportunities: [
        ContentOpportunity(
          id: 'co_001',
          title: 'Add FAQ schema markup',
          description: 'FAQ schema can increase SERP real estate and CTR.',
          impact: 'High',
          action: 'Implement structured data for FAQs',
        ),
        ContentOpportunity(
          id: 'co_002',
          title: 'Internal linking gap',
          description: 'Only 2 internal links found. Target: 5-8 per page.',
          impact: 'Medium',
          action: 'Add contextual internal links',
        ),
      ],
      topInsight: 'SEO score is good but 2 critical issues block top rankings',
      topAction: 'Fix H1 tag and add alt text for immediate improvement',
    );
  }

  @override
  Future<List<Review>> analyzeReviews(String appUrl) async {
    await Future.delayed(const Duration(milliseconds: 700));
    return [
      Review(
        id: 'rev_001',
        author: 'Alex M.',
        content: 'Great tool but loading times are getting slower. Please optimize.',
        rating: 3.5,
        date: DateTime.now().subtract(const Duration(days: 2)),
        sentiment: 'Mixed',
        topics: ['performance', 'loading'],
        insight: 'Performance complaints increasing',
        action: 'Run Core Web Vitals audit',
      ),
      Review(
        id: 'rev_002',
        author: 'Sarah K.',
        content: 'Love the keyword suggestions. Would like competitor tracking feature.',
        rating: 4.5,
        date: DateTime.now().subtract(const Duration(days: 3)),
        sentiment: 'Positive',
        topics: ['feature request', 'keywords'],
        insight: 'Users requesting competitor analysis',
        action: 'Consider competitor module activation',
      ),
      Review(
        id: 'rev_003',
        author: 'Mike R.',
        content: 'Data seems outdated sometimes. Not sure if rankings are real-time.',
        rating: 3.0,
        date: DateTime.now().subtract(const Duration(days: 5)),
        sentiment: 'Negative',
        topics: ['data freshness', 'trust'],
        insight: 'Trust issue around data freshness',
        action: 'Add "last updated" timestamps to all data',
      ),
      Review(
        id: 'rev_004',
        author: 'Lisa T.',
        content: 'The action recommendations are exactly what I needed. Saves hours.',
        rating: 5.0,
        date: DateTime.now().subtract(const Duration(days: 7)),
        sentiment: 'Positive',
        topics: ['actionability', 'time saving'],
        insight: 'Action-first approach resonating strongly',
        action: 'Double down on action layer in all modules',
      ),
    ];
  }

  @override
  Future<Map<String, dynamic>> getReviewSummary(String appUrl) async {
    return {
      'totalReviews': 1247,
      'avgRating': 4.2,
      'ratingChange': 0.1,
      'sentimentBreakdown': {'positive': 62, 'neutral': 23, 'negative': 15},
      'topTopics': ['performance', 'features', 'data freshness', 'UI/UX'],
      'trendingIssues': ['slow loading', 'outdated data'],
    };
  }

  @override
  Future<void> updateSettings(Map<String, dynamic> settings) async {
    await Future.delayed(const Duration(milliseconds: 300));
  }

  @override
  Future<Map<String, dynamic>> getSettings() async {
    return {
      'notifications': true,
      'darkMode': 'system',
      'language': 'en',
      'dataRefresh': 'daily',
      'defaultProject': 'main',
    };
  }
}
