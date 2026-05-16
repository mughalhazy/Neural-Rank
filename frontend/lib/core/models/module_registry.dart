import 'package:flutter/widgets.dart';

import '../constants/module_constants.dart';
import '../../features/creative_messaging/creative_screen.dart';
import '../../features/competitor_analysis/competitor_screen.dart';
import '../../features/content_insights/content_screen.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/drilldown/drilldown_scaffold.dart';
import '../../features/keywords/keyword_screen.dart';
import '../../features/optimization_layer/optimization_screen.dart';
import '../../features/rank_tracking/rank_screen.dart';
import '../../features/review_analysis/review_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/unified_workflow/workflow_screen.dart';
import '../../shared/icons/app_icon.dart';

enum FrontendModuleStatus { mvpActive, gated }

class FrontendModuleDefinition {
  const FrontendModuleDefinition({
    required this.moduleKey,
    required this.label,
    required this.status,
    required this.icon,
    required this.screen,
    required this.archetype,
    required this.navigationVisible,
  });

  final String moduleKey;
  final String label;
  final FrontendModuleStatus status;
  final AppIconSymbol icon;
  final Widget screen;
  final String archetype;
  final bool navigationVisible;

  bool get isActive => mvpActiveModuleKeys.contains(moduleKey);
}

const frontendModuleRegistry = [
  FrontendModuleDefinition(
    moduleKey: 'dashboard',
    label: 'Home',
    status: FrontendModuleStatus.mvpActive,
    icon: AppIconSymbol.dashboard,
    screen: DashboardScreen(),
    archetype: 'dashboard',
    navigationVisible: true,
  ),
  FrontendModuleDefinition(
    moduleKey: 'keyword_analysis',
    label: 'Keywords',
    status: FrontendModuleStatus.mvpActive,
    icon: AppIconSymbol.keyword,
    screen: KeywordScreen(),
    archetype: 'table_trend',
    navigationVisible: true,
  ),
  FrontendModuleDefinition(
    moduleKey: 'rank_tracking',
    label: 'Ranks',
    status: FrontendModuleStatus.mvpActive,
    icon: AppIconSymbol.rank,
    screen: RankScreen(),
    archetype: 'table_trend',
    navigationVisible: true,
  ),
  FrontendModuleDefinition(
    moduleKey: 'content_listing_insights',
    label: 'Content',
    status: FrontendModuleStatus.mvpActive,
    icon: AppIconSymbol.content,
    screen: ContentScreen(),
    archetype: 'analysis_feed',
    navigationVisible: true,
  ),
  FrontendModuleDefinition(
    moduleKey: 'review_analysis',
    label: 'Reviews',
    status: FrontendModuleStatus.mvpActive,
    icon: AppIconSymbol.review,
    screen: ReviewScreen(),
    archetype: 'analysis_feed',
    navigationVisible: true,
  ),
  FrontendModuleDefinition(
    moduleKey: 'settings',
    label: 'Settings',
    status: FrontendModuleStatus.mvpActive,
    icon: AppIconSymbol.settings,
    screen: SettingsScreen(),
    archetype: 'configuration',
    navigationVisible: true,
  ),
  FrontendModuleDefinition(
    moduleKey: 'competitor_analysis',
    label: 'Competitor Analysis',
    status: FrontendModuleStatus.gated,
    icon: AppIconSymbol.competitor,
    screen: CompetitorScreen(),
    archetype: 'gated_expansion',
    navigationVisible: false,
  ),
  FrontendModuleDefinition(
    moduleKey: 'optimization_layer',
    label: 'Optimization Layer',
    status: FrontendModuleStatus.gated,
    icon: AppIconSymbol.check,
    screen: OptimizationScreen(),
    archetype: 'gated_expansion',
    navigationVisible: false,
  ),
  FrontendModuleDefinition(
    moduleKey: 'creative_messaging_layer',
    label: 'Creative / Messaging',
    status: FrontendModuleStatus.gated,
    icon: AppIconSymbol.content,
    screen: CreativeScreen(),
    archetype: 'gated_expansion',
    navigationVisible: false,
  ),
  FrontendModuleDefinition(
    moduleKey: 'unified_workflow_layer',
    label: 'Workflow',
    status: FrontendModuleStatus.gated,
    icon: AppIconSymbol.workflow,
    screen: WorkflowScreen(),
    archetype: 'gated_expansion',
    navigationVisible: false,
  ),
  FrontendModuleDefinition(
    moduleKey: 'detail_drilldown',
    label: 'Drilldown',
    status: FrontendModuleStatus.gated,
    icon: AppIconSymbol.insight,
    screen: DrilldownScaffold(
      title: 'Drill into one decision surface',
      summary:
          'This archetype scaffold exists so detail inspection is part of the architecture before later feature expansion.',
      evidence: [
        'Issue evidence can be listed here',
        'Priority context can be listed here',
        'Action linkage can be listed here',
      ],
    ),
    archetype: 'detail_drilldown',
    navigationVisible: false,
  ),
];

List<FrontendModuleDefinition> getActiveNavigationModules() {
  return frontendModuleRegistry
      .where((module) => module.navigationVisible && module.isActive)
      .toList(growable: false);
}

List<FrontendModuleDefinition> getGatedModules() {
  return frontendModuleRegistry
      .where((module) => module.status == FrontendModuleStatus.gated)
      .toList(growable: false);
}
