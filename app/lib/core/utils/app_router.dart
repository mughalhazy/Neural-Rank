import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:neural_rank/data/models/insight.dart';
import 'package:neural_rank/presentation/screens/auth/sign_in_screen.dart';
import 'package:neural_rank/presentation/screens/dashboard/dashboard_screen.dart';
import 'package:neural_rank/presentation/screens/drilldown/drilldown_screen.dart';
import 'package:neural_rank/presentation/screens/keyword/keyword_screen.dart';
import 'package:neural_rank/presentation/screens/rank/rank_screen.dart';
import 'package:neural_rank/presentation/screens/content_insight/content_insight_screen.dart';
import 'package:neural_rank/presentation/screens/review_insight/review_insight_screen.dart';
import 'package:neural_rank/presentation/screens/settings/settings_screen.dart';
import 'package:neural_rank/presentation/screens/competitor/competitor_screen.dart';
import 'package:neural_rank/presentation/screens/optimization/optimization_screen.dart';
import 'package:neural_rank/presentation/screens/creative/creative_screen.dart';
import 'package:neural_rank/presentation/screens/workflow/workflow_screen.dart';
import 'package:neural_rank/presentation/widgets/shared/app_shell.dart';

class AppRouter {
  /// Debug router: no auth redirect, all routes accessible immediately.
  static GoRouter createDebugRouter() {
    return GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/drilldown',
          builder: (context, state) {
            final insight = state.extra as Insight?;
            return insight != null
                ? DrilldownScreen(insight: insight)
                : const DashboardScreen();
          },
        ),
        ShellRoute(
          builder: (context, state, child) => AppShell(child: child),
          routes: [
            GoRoute(path: '/', builder: (context, state) => const DashboardScreen()),
            GoRoute(path: '/keyword', builder: (context, state) => const KeywordScreen()),
            GoRoute(path: '/rank', builder: (context, state) => const RankScreen()),
            GoRoute(path: '/content', builder: (context, state) => const ContentInsightScreen()),
            GoRoute(path: '/review', builder: (context, state) => const ReviewInsightScreen()),
            GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
            GoRoute(path: '/competitor', builder: (context, state) => const CompetitorScreen()),
            GoRoute(path: '/optimization', builder: (context, state) => const OptimizationScreen()),
            GoRoute(path: '/creative', builder: (context, state) => const CreativeScreen()),
            GoRoute(path: '/workflow', builder: (context, state) => const WorkflowScreen()),
          ],
        ),
      ],
    );
  }

  /// Call once after Supabase.initialize() completes.
  static GoRouter createRouter() {
    return GoRouter(
      initialLocation: '/',
      refreshListenable: _AuthChangeNotifier(),
      redirect: (context, state) {
        final loggedIn = Supabase.instance.client.auth.currentSession != null;
        final onLogin = state.matchedLocation == '/login';
        if (!loggedIn && !onLogin) return '/login';
        if (loggedIn && onLogin) return '/';
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const SignInScreen(),
        ),
        GoRoute(
          path: '/drilldown',
          builder: (context, state) {
            final insight = state.extra as Insight?;
            return insight != null
                ? DrilldownScreen(insight: insight)
                : const DashboardScreen();
          },
        ),
        ShellRoute(
          builder: (context, state, child) => AppShell(child: child),
          routes: [
            GoRoute(path: '/', builder: (context, state) => const DashboardScreen()),
            GoRoute(path: '/keyword', builder: (context, state) => const KeywordScreen()),
            GoRoute(path: '/rank', builder: (context, state) => const RankScreen()),
            GoRoute(path: '/content', builder: (context, state) => const ContentInsightScreen()),
            GoRoute(path: '/review', builder: (context, state) => const ReviewInsightScreen()),
            GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
            GoRoute(path: '/competitor', builder: (context, state) => const CompetitorScreen()),
            GoRoute(path: '/optimization', builder: (context, state) => const OptimizationScreen()),
            GoRoute(path: '/creative', builder: (context, state) => const CreativeScreen()),
            GoRoute(path: '/workflow', builder: (context, state) => const WorkflowScreen()),
          ],
        ),
      ],
    );
  }
}

/// Notifies GoRouter to re-evaluate the redirect on every Supabase auth change.
class _AuthChangeNotifier extends ChangeNotifier {
  late final StreamSubscription<AuthState> _sub;

  _AuthChangeNotifier() {
    _sub = Supabase.instance.client.auth.onAuthStateChange
        .listen((_) => notifyListeners());
  }

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}
