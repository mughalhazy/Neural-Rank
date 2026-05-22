import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:neural_rank/core/theme/app_theme.dart';
import 'package:neural_rank/presentation/blocs/dashboard/dashboard_bloc.dart';
import 'package:neural_rank/presentation/widgets/shared/empty_state.dart';
import 'package:neural_rank/presentation/widgets/shared/insight_card.dart';
import 'package:neural_rank/presentation/widgets/shared/loading_state.dart';

class CompetitorScreen extends StatefulWidget {
  const CompetitorScreen({super.key});

  @override
  State<CompetitorScreen> createState() => _CompetitorScreenState();
}

class _CompetitorScreenState extends State<CompetitorScreen> {
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
      appBar: AppBar(title: const Text('Competitor Analysis')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ModuleHeader(
              title: 'Find competitor gaps worth closing.',
              description: 'See where rivals are stronger, find their weak points, and build a response plan before the next ranking cycle.',
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Capabilities', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            const _FeatureRow(feature: _Feature('Find competitor advantages', 'Shows where rivals are stronger', Icons.people_outline)),
            const _FeatureRow(feature: _Feature('See your biggest gap', 'Identifies the main area to improve', Icons.warning_amber_outlined)),
            const _FeatureRow(feature: _Feature('Find trust openings', 'Spots competitor weaknesses you can use', Icons.lightbulb_outline)),
            const _FeatureRow(feature: _Feature('Plan competitor response', 'Turns rival pressure into actions', Icons.assignment_outlined)),
            const SizedBox(height: AppSpacing.lg),
            Text('Insights', style: AppTypography.headingSmall),
            const SizedBox(height: AppSpacing.sm),
            BlocBuilder<DashboardBloc, DashboardState>(
              builder: (context, state) {
                if (state is DashboardLoading) return const LoadingState();
                if (state is DashboardLoaded) {
                  final insights = state.insights.where((i) => i.module == 'Competitor Analysis').toList();
                  if (insights.isEmpty) {
                    return const EmptyState(
                      title: 'No competitor insights yet',
                      subtitle: 'Competitor insights will appear here once analysis runs.',
                      icon: Icons.people_outline,
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
                  title: 'No competitor insights yet',
                  subtitle: 'Competitor insights will appear here once analysis runs.',
                  icon: Icons.people_outline,
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
