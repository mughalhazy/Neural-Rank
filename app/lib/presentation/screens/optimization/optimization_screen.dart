import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:neural_rank/core/theme/app_theme.dart';
import 'package:neural_rank/presentation/blocs/dashboard/dashboard_bloc.dart';
import 'package:neural_rank/presentation/widgets/shared/empty_state.dart';
import 'package:neural_rank/presentation/widgets/shared/insight_card.dart';
import 'package:neural_rank/presentation/widgets/shared/loading_state.dart';

class OptimizationScreen extends StatefulWidget {
  const OptimizationScreen({super.key});

  @override
  State<OptimizationScreen> createState() => _OptimizationScreenState();
}

class _OptimizationScreenState extends State<OptimizationScreen> {
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
      appBar: AppBar(title: const Text('Optimization')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ModuleHeader(
              title: 'Turn findings into a specific fix list.',
              description: 'Know exactly which section to rewrite, which metadata to complete, and what to skip — before spending time on the wrong edit.',
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Capabilities', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            const _FeatureRow(feature: _Feature('Get a prioritised fix list', 'Turns module findings into specific edits', Icons.checklist_outlined)),
            const _FeatureRow(feature: _Feature('Fix weak content sections', 'Shows which section needs improvement first', Icons.article_outlined)),
            const _FeatureRow(feature: _Feature('Repair keyword coverage', 'Finds where important search terms are missing', Icons.search_outlined)),
            const _FeatureRow(feature: _Feature('Complete missing metadata', 'Identifies incomplete metadata fields', Icons.edit_note_outlined)),
            const _FeatureRow(feature: _Feature('Execution-ready improvements', 'Each fix comes with a clear action step', Icons.build_outlined)),
            const SizedBox(height: AppSpacing.lg),
            Text('Insights', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            BlocBuilder<DashboardBloc, DashboardState>(
              builder: (context, state) {
                if (state is DashboardLoading) return const LoadingState();
                if (state is DashboardLoaded) {
                  final insights = state.insights.where((i) => i.module == 'Optimization Layer').toList();
                  if (insights.isEmpty) {
                    return const EmptyState(
                      title: 'No optimization insights yet',
                      subtitle: 'Optimization insights will appear here once analysis runs.',
                      icon: Icons.build_outlined,
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
                  title: 'No optimization insights yet',
                  subtitle: 'Optimization insights will appear here once analysis runs.',
                  icon: Icons.build_outlined,
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
