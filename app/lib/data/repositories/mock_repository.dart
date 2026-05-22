import 'dart:math';
import 'package:neural_rank/data/models/insight.dart';
import 'package:neural_rank/data/models/keyword.dart';
import 'package:neural_rank/data/models/rank_data.dart';
import 'package:neural_rank/data/models/review.dart';
import 'package:neural_rank/data/models/content_analysis.dart';
import 'package:neural_rank/data/models/user.dart';
import 'package:neural_rank/data/repositories/seo_repository.dart';

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
        evidence: ['seo tools: pos 8 → 11', 'keyword tracker: pos 5 → 8', 'rank checker: pos 12 → 15'],
        explanation: 'Content freshness signals dropped after 47 days without updates. '
            'Google\'s Freshness algorithm penalises articles covering rapidly-evolving '
            'topics when competitors publish newer content.',
        nextStep: 'Create recommendation to refresh content',
      ),
      Insight(
        id: 'ins_002',
        title: 'New keyword opportunity detected',
        description: 'High-volume low-competition keyword "mobile seo optimization" identified with 12K monthly searches.',
        module: 'Keyword Analysis',
        priority: 'High Impact',
        action: 'Create content targeting this keyword',
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
        evidence: ['12,400 monthly searches', '0.31 difficulty', '\$1.90 avg CPC', 'Informational intent'],
        explanation: 'Low difficulty combined with high search volume signals an underserved query. '
            'Three first-page results are over 2 years old with no structured data — a clear content gap.',
        nextStep: 'Create content brief for this keyword',
      ),
      Insight(
        id: 'ins_003',
        title: 'Review sentiment declining',
        description: 'Recent reviews show 23% increase in "slow loading" complaints. Page speed may need attention.',
        module: 'Review Analysis',
        priority: 'Medium Impact',
        action: 'Audit page speed and optimize core web vitals',
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
        evidence: ['23% more "slow loading" mentions', '18 reviews in last 30 days', 'Avg rating 3.4 (was 4.1)'],
        explanation: 'The spike in performance complaints correlates with a CSS bundle size increase '
            'in the last deployment. Affected pages show LCP above 4.2s on mobile.',
        nextStep: 'Run Core Web Vitals audit',
      ),
      Insight(
        id: 'ins_004',
        title: 'Meta description too short',
        description: '12 pages have meta descriptions under 120 characters. Longer descriptions improve CTR.',
        module: 'Content Insights',
        priority: 'Low Impact',
        action: 'Expand meta descriptions to 150-160 characters',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        evidence: ['12 pages affected', 'Avg 94 chars (target 150–160)', 'CTR 1.8% below site average'],
        explanation: 'Short meta descriptions are often replaced by Google with auto-generated snippets, '
            'which typically have lower CTR than a description targeting the searcher\'s intent.',
        nextStep: 'Expand 12 meta descriptions',
      ),
      Insight(
        id: 'ins_005',
        title: 'Rival A is winning through clearer exam-prep messaging',
        description: 'Competitor pressure is messaging-led. Response should focus on creative clarity before keyword expansion.',
        module: 'Competitor Analysis',
        priority: 'High Impact',
        action: 'Compare screenshot promise with Rival A',
        createdAt: DateTime.now().subtract(const Duration(hours: 10)),
        evidence: ['+14 SOV vs Rival A', 'Messaging-led gap', 'Head terms affected'],
        explanation: 'Rival A wins through clearer promise, not volume alone. Their headline directly addresses exam prep anxiety while yours leads with features.',
        nextStep: 'Open competitor gap map',
      ),
      Insight(
        id: 'ins_006',
        title: 'Rewrite work should start with listing opening',
        description: 'The opening copy affects both high-intent discovery and conversion — it outranks lower-value metadata cleanup.',
        module: 'Optimization Layer',
        priority: 'High Impact',
        action: 'Prepare opening copy rewrite',
        createdAt: DateTime.now().subtract(const Duration(hours: 12)),
        evidence: ['Exam-prep intent gap', 'High-volume terms affected', 'Action-ready'],
        explanation: 'The first 180 characters of your description are scanned on high-intent queries. Feature-led copy reduces relevance signals compared to outcome-led copy.',
        nextStep: 'Create content rewrite task',
      ),
      Insight(
        id: 'ins_007',
        title: 'Screenshot promise does not match strongest user intent',
        description: 'Users see the creative promise before deeper listing copy — message mismatch suppresses conversion.',
        module: 'Creative / Messaging',
        priority: 'Medium Impact',
        action: 'Rewrite screenshot headline around offline study',
        createdAt: DateTime.now().subtract(const Duration(hours: 14)),
        evidence: ['Offline study intent gap', 'Weak headline clarity', 'Rival contrast present'],
        explanation: 'Hero screenshot headline leads with app features rather than the user outcome. Offline study intent is your strongest ranking signal but is absent from the creative.',
        nextStep: 'Review creative brief',
      ),
      Insight(
        id: 'ins_008',
        title: 'Sync trust and listing intent should move as one workflow',
        description: 'Review repair and content rewrite affect the same conversion path — handle them as a single workflow task.',
        module: 'Unified Workflow Layer',
        priority: 'High Impact',
        action: 'Bundle into single workflow queue',
        createdAt: DateTime.now().subtract(const Duration(hours: 16)),
        evidence: ['Review risk present', 'Copy gap confirmed', 'Shared conversion impact'],
        explanation: 'Cross-module analysis shows the sync complaint cluster and the listing intent gap both reduce conversion on the same traffic. Fixing them separately is less efficient than one coordinated workflow.',
        nextStep: 'Open unified workflow queue',
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
