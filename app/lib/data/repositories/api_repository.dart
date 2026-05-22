import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:neural_rank/core/errors/api_exception.dart';
import 'package:neural_rank/core/network/neural_rank_client.dart';
import 'package:neural_rank/data/models/content_analysis.dart';
import 'package:neural_rank/data/models/insight.dart';
import 'package:neural_rank/data/models/keyword.dart';
import 'package:neural_rank/data/models/rank_data.dart';
import 'package:neural_rank/data/models/review.dart';
import 'package:neural_rank/data/models/user.dart';
import 'package:neural_rank/data/repositories/seo_repository.dart';

/// Production repository — talks to the Neural Rank backend via NeuralRankClient.
/// Auth is handled by Supabase Flutter; the JWT is stored in FlutterSecureStorage
/// and attached to every request by the Bearer interceptor in NeuralRankClient.
class ApiRepository implements SEORepository {
  final NeuralRankClient _client;

  /// The target website URL injected into module run requests.
  /// Defaults to a placeholder; replaced when the user configures their project.
  final String websiteUrl;

  ApiRepository({
    NeuralRankClient? client,
    this.websiteUrl = 'https://example.com',
  }) : _client = client ?? NeuralRankClient();

  // ── Cached run/default result (5-min TTL) ─────────────────────────────────

  Map<String, dynamic>? _cachedResults;
  DateTime? _cacheTime;
  static const _cacheTtl = Duration(minutes: 5);

  Future<Map<String, dynamic>> _runDefault() async {
    if (_cachedResults != null &&
        _cacheTime != null &&
        DateTime.now().difference(_cacheTime!) < _cacheTtl) {
      return _cachedResults!;
    }
    final data = await _client.post('/run/default', {
      'moduleInputs': {
        'review_analysis': {
          'websiteUrl': websiteUrl,
          'reviews': [],
        },
      },
    });
    _cachedResults = data['results'] as Map<String, dynamic>? ?? {};
    _cacheTime = DateTime.now();
    return _cachedResults!;
  }

  void _invalidateCache() {
    _cachedResults = null;
    _cacheTime = null;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  @override
  Future<User?> getCurrentUser() async {
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) return null;
    final sUser = Supabase.instance.client.auth.currentUser;
    if (sUser == null) return null;
    return User(
      id: sUser.id,
      email: sUser.email ?? '',
      displayName: sUser.userMetadata?['full_name'] as String? ??
          sUser.userMetadata?['name'] as String?,
      createdAt: DateTime.parse(sUser.createdAt),
      activeModules: const [],
    );
  }

  @override
  Future<User> signIn(String email, String password) async {
    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      final session = response.session;
      if (session == null) {
        throw const ApiException(code: 'auth_failed', message: 'Sign in failed. Please try again.');
      }
      await _client.saveToken(session.accessToken);
      final sUser = response.user!;
      return User(
        id: sUser.id,
        email: sUser.email ?? email,
        displayName: sUser.userMetadata?['full_name'] as String? ??
            sUser.userMetadata?['name'] as String?,
        createdAt: DateTime.parse(sUser.createdAt),
        activeModules: const [],
      );
    } on AuthException catch (e) {
      throw ApiException(
        code: 'auth_error',
        message: e.message,
        statusCode: int.tryParse(e.statusCode ?? ''),
      );
    }
  }

  @override
  Future<void> signOut() async {
    await Supabase.instance.client.auth.signOut();
    await _client.clearToken();
    _invalidateCache();
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  @override
  Future<List<Insight>> getDashboardInsights() async {
    final results = await _runDefault();
    final insights = <Insight>[];
    var idx = 0;
    for (final entry in results.entries) {
      final moduleData = entry.value as Map<String, dynamic>?;
      if (moduleData == null) continue;
      final flow = moduleData['flow'] as Map<String, dynamic>? ?? {};
      final rawList = (flow['insight'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      for (final raw in rawList) {
        insights.add(_mapInsight(raw, entry.key, idx++));
      }
    }
    return insights;
  }

  @override
  Future<Map<String, dynamic>> getDashboardSummary() async {
    final results = await _runDefault();
    var totalInsights = 0;
    var avgPositionSum = 0.0;
    var avgPositionCount = 0;
    var seoScore = 0;
    var seoScoreCount = 0;

    for (final entry in results.entries) {
      final moduleData = entry.value as Map<String, dynamic>?;
      if (moduleData == null) continue;
      final flow = moduleData['flow'] as Map<String, dynamic>? ?? {};
      totalInsights += ((flow['insight'] as List?)?.length ?? 0);

      // Extract position from rank_tracking module
      if (entry.key == 'rank_tracking') {
        final positions = (flow['analysis']?['rankings'] as List?)
            ?.cast<Map<String, dynamic>>() ?? [];
        for (final r in positions) {
          final pos = (r['currentPosition'] as num?)?.toDouble();
          if (pos != null) {
            avgPositionSum += pos;
            avgPositionCount++;
          }
        }
      }

      // Extract SEO score from on_page_seo_scorer
      if (entry.key == 'on_page_seo_scorer') {
        final score = flow['analysis']?['overallScore'] as num?;
        if (score != null) {
          seoScore += score.toInt();
          seoScoreCount++;
        }
      }
    }

    return {
      'totalKeywords': 0,
      'avgPosition': avgPositionCount > 0 ? (avgPositionSum / avgPositionCount) : 0.0,
      'positionChange': 0.0,
      'seoScore': seoScoreCount > 0 ? (seoScore ~/ seoScoreCount) : 0,
      'scoreChange': 0,
      'insightsCount': totalInsights,
      'newInsights': totalInsights,
      'topPriority': 'High Impact',
    };
  }

  // ── Keywords ──────────────────────────────────────────────────────────────

  @override
  Future<List<Keyword>> analyzeKeywords(String query) async {
    final data = await _client.post('/modules/keyword_analysis/run', {
      'moduleInput': {
        'websiteUrl': websiteUrl,
        'keywords': [
          {'keyword': query, 'position': 50, 'difficulty': 40, 'volume': 1000},
        ],
      },
    });
    final flow = data['flow'] as Map<String, dynamic>? ?? {};
    final actions = (flow['action'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return actions.asMap().entries.map((e) {
      final a = e.value;
      final payload = a['payload'] as Map<String, dynamic>? ?? {};
      return Keyword(
        id: 'kw_api_${e.key}',
        term: payload['keyword'] as String? ?? a['title'] as String? ?? query,
        searchVolume: (payload['volume'] as num?)?.toInt() ?? 0,
        difficulty: (payload['difficulty'] as num?)?.toDouble() ?? 0.0,
        cpc: (payload['cpc'] as num?)?.toDouble() ?? 0.0,
        intent: payload['intent'] as String? ?? 'Unknown',
        relatedTerms: const [],
        insight: a['title'] as String?,
        action: a['description'] as String?,
      );
    }).toList();
  }

  @override
  Future<List<Keyword>> getSavedKeywords() => analyzeKeywords('seo');

  // ── Rank Tracking ─────────────────────────────────────────────────────────

  @override
  Future<List<RankData>> getRankData(String url) async {
    final data = await _client.post('/modules/rank_tracking/run', {
      'moduleInput': {
        'websiteUrl': url,
        'keywords': [],
      },
    });
    final flow = data['flow'] as Map<String, dynamic>? ?? {};
    final actions = (flow['action'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return actions.asMap().entries.map((e) {
      final a = e.value;
      final payload = a['payload'] as Map<String, dynamic>? ?? {};
      return RankData(
        id: 'rank_api_${e.key}',
        keyword: payload['keyword'] as String? ?? a['title'] as String? ?? 'keyword_${e.key}',
        url: url,
        currentPosition: (payload['currentPosition'] as num?)?.toInt() ?? 0,
        previousPosition: (payload['previousPosition'] as num?)?.toInt() ?? 0,
        trackedAt: DateTime.now(),
        insight: a['title'] as String?,
        action: a['description'] as String?,
      );
    }).toList();
  }

  @override
  Future<List<RankData>> trackKeyword(String keyword, String url) => getRankData(url);

  // ── Content Analysis ──────────────────────────────────────────────────────

  @override
  Future<ContentAnalysis> analyzeContent(String url) async {
    final data = await _client.post('/modules/on_page_seo_scorer/run', {
      'moduleInput': {'websiteUrl': url},
    });
    final flow = data['flow'] as Map<String, dynamic>? ?? {};
    final actions = (flow['action'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final insights = (flow['insight'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    final issues = actions
        .where((a) => (a['type'] as String? ?? '').contains('fix'))
        .toList()
        .asMap()
        .entries
        .map((e) => ContentIssue(
              id: 'ci_api_${e.key}',
              title: e.value['title'] as String? ?? 'Issue ${e.key + 1}',
              description: e.value['description'] as String? ?? '',
              severity: e.value['payload']?['severity'] as String? ?? 'Medium',
              fixAction: e.value['description'] as String? ?? '',
            ))
        .toList();

    final opportunities = actions
        .where((a) => !(a['type'] as String? ?? '').contains('fix'))
        .toList()
        .asMap()
        .entries
        .map((e) => ContentOpportunity(
              id: 'co_api_${e.key}',
              title: e.value['title'] as String? ?? 'Opportunity ${e.key + 1}',
              description: e.value['description'] as String? ?? '',
              impact: e.value['payload']?['impact'] as String? ?? 'Medium',
              action: e.value['description'] as String? ?? '',
            ))
        .toList();

    final topInsight = insights.isNotEmpty
        ? insights.first['description'] as String? ?? ''
        : 'SEO analysis complete';
    final topAction = actions.isNotEmpty
        ? actions.first['description'] as String? ?? ''
        : 'Review recommendations above';

    final score = (flow['analysis']?['overallScore'] as num?)?.toInt() ?? 0;

    return ContentAnalysis(
      id: 'ca_api_${url.hashCode}',
      url: url,
      seoScore: score,
      issues: issues,
      opportunities: opportunities,
      topInsight: topInsight,
      topAction: topAction,
    );
  }

  // ── Review Analysis ───────────────────────────────────────────────────────

  @override
  Future<List<Review>> analyzeReviews(String appUrl) async {
    final data = await _client.post('/modules/review_analysis/run', {
      'moduleInput': {
        'websiteUrl': appUrl,
        'reviews': [],
      },
    });
    final flow = data['flow'] as Map<String, dynamic>? ?? {};
    final actions = (flow['action'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return actions.asMap().entries.map((e) {
      final a = e.value;
      final payload = a['payload'] as Map<String, dynamic>? ?? {};
      return Review(
        id: 'rev_api_${e.key}',
        author: payload['source'] as String? ?? 'Anonymous',
        content: a['description'] as String? ?? '',
        rating: (payload['avgRating'] as num?)?.toDouble() ?? 3.0,
        date: DateTime.now(),
        sentiment: payload['sentiment'] as String? ?? 'Neutral',
        topics: (payload['topics'] as List?)?.cast<String>() ?? [],
        insight: a['title'] as String?,
        action: a['description'] as String?,
      );
    }).toList();
  }

  @override
  Future<Map<String, dynamic>> getReviewSummary(String appUrl) async {
    final data = await _client.post('/modules/review_analysis/run', {
      'moduleInput': {
        'websiteUrl': appUrl,
        'reviews': [],
      },
    });
    final flow = data['flow'] as Map<String, dynamic>? ?? {};
    final analysis = flow['analysis'] as Map<String, dynamic>? ?? {};
    return {
      'totalReviews': analysis['totalReviews'] ?? 0,
      'avgRating': (analysis['avgRating'] as num?)?.toDouble() ?? 0.0,
      'ratingChange': 0.0,
      'sentimentBreakdown': analysis['sentimentBreakdown'] ?? {'positive': 0, 'neutral': 0, 'negative': 0},
      'topTopics': (analysis['topTopics'] as List?)?.cast<String>() ?? [],
      'trendingIssues': (analysis['trendingIssues'] as List?)?.cast<String>() ?? [],
    };
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  @override
  Future<void> updateSettings(Map<String, dynamic> settings) async {
    // Settings are stored locally — no backend endpoint for this yet
  }

  @override
  Future<Map<String, dynamic>> getSettings() async {
    return {
      'notifications': true,
      'darkMode': 'system',
      'language': 'en',
      'dataRefresh': 'daily',
      'defaultProject': websiteUrl,
    };
  }

  // ── Mapping helpers ───────────────────────────────────────────────────────

  static Insight _mapInsight(Map<String, dynamic> raw, String moduleKey, int idx) {
    final priorityRaw = raw['impact'] ?? raw['priority'] ?? 'medium';
    return Insight(
      id: '${moduleKey}_ins_$idx',
      title: raw['title'] as String? ?? 'Insight from $moduleKey',
      description: raw['description'] as String? ?? raw['summary'] as String? ?? '',
      module: _moduleDisplayName(moduleKey),
      priority: _mapPriority(priorityRaw),
      action: raw['action'] as String?,
      createdAt: DateTime.now(),
      evidence: (raw['evidence'] as List?)?.cast<String>(),
      explanation: raw['explanation'] as String?,
      nextStep: raw['nextStep'] as String?,
    );
  }

  static String _mapPriority(dynamic raw) {
    final s = raw?.toString().toLowerCase() ?? '';
    if (s.contains('high') || s.contains('critical')) return 'High Impact';
    if (s.contains('medium') || s.contains('mod')) return 'Medium Impact';
    return 'Low Impact';
  }

  static String _moduleDisplayName(String key) {
    return key
        .split('_')
        .map((w) => w.isEmpty ? '' : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }
}
