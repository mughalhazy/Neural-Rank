import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:neural_rank/core/theme/app_theme.dart';
import 'package:neural_rank/presentation/blocs/dashboard/dashboard_bloc.dart';
import 'package:neural_rank/presentation/widgets/shared/empty_state.dart';
import 'package:neural_rank/presentation/widgets/shared/insight_card.dart';
import 'package:neural_rank/presentation/widgets/shared/loading_state.dart';

class CreativeScreen extends StatefulWidget {
  const CreativeScreen({super.key});

  @override
  State<CreativeScreen> createState() => _CreativeScreenState();
}

class _CreativeScreenState extends State<CreativeScreen> {
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
      appBar: AppBar(title: const Text('Creative / Messaging')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ModuleHeader(
              title: 'Fix the message before users see it.',
              description: 'Identify screenshot copy that mismatches user intent, find headline clarity issues, and get specific rewrites before testing new creative variants.',
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Capabilities', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            const _FeatureRow(feature: _Feature('Improve screenshot message', 'Shows which screenshot copy is unclear', Icons.photo_outlined)),
            const _FeatureRow(feature: _Feature('Fix weak headline clarity', 'Detects headline messages that miss user intent', Icons.title_outlined)),
            const _FeatureRow(feature: _Feature('Match user intent', 'Checks whether messaging aligns with search intent', Icons.lightbulb_outline)),
            const _FeatureRow(feature: _Feature('Improve call to action', 'Finds missing or weak CTAs', Icons.ads_click_outlined)),
            const _FeatureRow(feature: _Feature('Creative rewrite tasks', 'Turns message issues into actionable rewrites', Icons.edit_outlined)),
            const SizedBox(height: AppSpacing.lg),
            Text('Insights', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            BlocBuilder<DashboardBloc, DashboardState>(
              builder: (context, state) {
                if (state is DashboardLoading) return const LoadingState();
                if (state is DashboardLoaded) {
                  final insights = state.insights.where((i) => i.module == 'Creative / Messaging').toList();
                  if (insights.isEmpty) {
                    return const EmptyState(
                      title: 'No creative insights yet',
                      subtitle: 'Creative insights will appear here once analysis runs.',
                      icon: Icons.photo_outlined,
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
                  title: 'No creative insights yet',
                  subtitle: 'Creative insights will appear here once analysis runs.',
                  icon: Icons.photo_outlined,
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
