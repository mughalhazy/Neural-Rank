import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:neural_rank/core/theme/app_theme.dart';
import 'package:neural_rank/presentation/blocs/dashboard/dashboard_bloc.dart';
import 'package:neural_rank/presentation/widgets/shared/empty_state.dart';
import 'package:neural_rank/presentation/widgets/shared/insight_card.dart';
import 'package:neural_rank/presentation/widgets/shared/loading_state.dart';

class WorkflowScreen extends StatefulWidget {
  const WorkflowScreen({super.key});

  @override
  State<WorkflowScreen> createState() => _WorkflowScreenState();
}

class _WorkflowScreenState extends State<WorkflowScreen> {
  @override
  void initState() {
    super.initState();
    final bloc = context.read<DashboardBloc>();
    if (bloc.state is! DashboardLoaded) {
      bloc.add(LoadDashboard());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Unified Workflow')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ModuleHeader(
              title: 'One ordered queue across all modules.',
              description: 'Stop switching between tools. Get one prioritised work queue that combines actions from every active module into a sequence you can execute today.',
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Capabilities', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            const _FeatureRow(feature: _Feature('Everything in one queue', 'Combines all module actions into one view', Icons.view_list_outlined)),
            const _FeatureRow(feature: _Feature('Know what to do first', 'Orders tasks by impact across all modules', Icons.priority_high_outlined)),
            const _FeatureRow(feature: _Feature('Group related work', 'Bundles connected actions from different modules', Icons.account_tree_outlined)),
            const _FeatureRow(feature: _Feature('Track execution flow', 'Shows how tasks move from insight to outcome', Icons.timeline_outlined)),
            const SizedBox(height: AppSpacing.lg),
            Text('Insights', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            BlocBuilder<DashboardBloc, DashboardState>(
              builder: (context, state) {
                if (state is DashboardLoading) return const LoadingState();
                if (state is DashboardLoaded) {
                  final insights = state.insights.where((i) => i.module == 'Unified Workflow Layer').toList();
                  if (insights.isEmpty) {
                    return const EmptyState(
                      title: 'No workflow insights yet',
                      subtitle: 'Workflow insights will appear here once analysis runs.',
                      icon: Icons.account_tree_outlined,
                    );
                  }
                  return Column(
                    children: insights.map((insight) => InsightCard(
                      insight: insight,
                      onTap: () => context.read<DashboardBloc>().add(MarkInsightRead(insight.id)),
                      onNextStep: insight.nextStep != null
                          ? () => context.push('/drilldown', extra: insight)
                          : null,
                    )).toList(),
                  );
                }
                return const EmptyState(
                  title: 'No workflow insights yet',
                  subtitle: 'Workflow insights will appear here once analysis runs.',
                  icon: Icons.account_tree_outlined,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _Feature {
  final String title;
  final String subtitle;
  final IconData icon;
  const _Feature(this.title, this.subtitle, this.icon);
}

class _FeatureRow extends StatelessWidget {
  final _Feature feature;
  const _FeatureRow({required this.feature});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.08),
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: Icon(feature.icon, size: 18, color: AppColors.primary),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(feature.title, style: AppTypography.labelLarge),
                Text(feature.subtitle, style: AppTypography.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleHeader extends StatelessWidget {
  final String title;
  final String description;
  const _ModuleHeader({required this.title, required this.description});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.primary.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTypography.headingMedium),
          const SizedBox(height: AppSpacing.xs),
          Text(description, style: AppTypography.bodyMedium),
        ],
      ),
    );
  }
}
