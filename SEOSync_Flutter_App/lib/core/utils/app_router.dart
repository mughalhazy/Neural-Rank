import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:seosync/presentation/screens/dashboard/dashboard_screen.dart';
import 'package:seosync/presentation/screens/keyword/keyword_screen.dart';
import 'package:seosync/presentation/screens/rank/rank_screen.dart';
import 'package:seosync/presentation/screens/content_insight/content_insight_screen.dart';
import 'package:seosync/presentation/screens/review_insight/review_insight_screen.dart';
import 'package:seosync/presentation/screens/settings/settings_screen.dart';
import 'package:seosync/presentation/screens/competitor/competitor_screen.dart';
import 'package:seosync/presentation/screens/optimization/optimization_screen.dart';
import 'package:seosync/presentation/screens/creative/creative_screen.dart';
import 'package:seosync/presentation/screens/workflow/workflow_screen.dart';
import 'package:seosync/presentation/widgets/shared/app_shell.dart';

class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();

  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
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
