import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/core/constants/app_constants.dart';
import 'package:seosync/presentation/blocs/dashboard/dashboard_bloc.dart';
import 'package:seosync/presentation/widgets/shared/insight_card.dart';
import 'package:seosync/presentation/widgets/shared/loading_state.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';
import 'package:seosync/presentation/widgets/shared/error_state.dart';
import 'package:seosync/presentation/widgets/shared/score_ring.dart';
import 'package:seosync/presentation/widgets/shared/section_header.dart';
import 'package:flutter_animate/flutter_animate.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    context.read<DashboardBloc>().add(LoadDashboard());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SEOSync'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: BlocBuilder<DashboardBloc, DashboardState>(
        builder: (context, state) {
          if (state is DashboardLoading) {
            return const LoadingState();
          }
          if (state is DashboardError) {
            return ErrorState(
              message: state.message,
              onRetry: () => context.read<DashboardBloc>().add(LoadDashboard()),
            );
          }
          if (state is DashboardLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                context.read<DashboardBloc>().add(RefreshDashboard());
              },
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: _SummaryCards(summary: state.summary),
                  ),
                  const SliverToBoxAdapter(
                    child: SizedBox(height: AppSpacing.md),
                  ),
                  SliverToBoxAdapter(
                    child: SectionHeader(
                      title: 'Priority Insights',
                      actionLabel: 'View All',
                      onAction: () {},
                    ),
                  ),
                  if (state.insights.isEmpty)
                    const SliverToBoxAdapter(
                      child: EmptyState(
                        title: 'No insights yet',
                        subtitle: 'Add a project to start getting insights',
                        icon: Icons.lightbulb_outline,
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) => InsightCard(
                            insight: state.insights[index],
                            onTap: () {
                              context.read<DashboardBloc>().add(
                                MarkInsightRead(state.insights[index].id),
                              );
                            },
                          ).animate().fadeIn(delay: (index * 100).ms).slideY(begin: 0.1, end: 0),
                          childCount: state.insights.length,
                        ),
                      ),
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _SummaryCards extends StatelessWidget {
  final Map<String, dynamic> summary;
  const _SummaryCards({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  label: 'SEO Score',
                  child: ScoreRing(score: (summary['seoScore'] as num).toDouble()),
                  change: summary['scoreChange'] as int,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: _MetricCard(
                  label: 'Avg Position',
                  value: '${summary['avgPosition']}',
                  change: (summary['positionChange'] as num).toDouble(),
                  isNegativeGood: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  label: 'Keywords',
                  value: '${summary['totalKeywords']}',
                  subtitle: 'tracked',
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: _MetricCard(
                  label: 'New Insights',
                  value: '${summary['newInsights']}',
                  subtitle: 'today',
                  highlight: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String? value;
  final Widget? child;
  final dynamic change;
  final String? subtitle;
  final bool isNegativeGood;
  final bool highlight;

  const _MetricCard({
    required this.label,
    this.value,
    this.child,
    this.change,
    this.subtitle,
    this.isNegativeGood = false,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = highlight
        ? AppColors.primary.withOpacity(0.08)
        : (Theme.of(context).cardTheme.color ?? AppColors.surface);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(
          color: highlight ? AppColors.primary.withOpacity(0.2) : (Theme.of(context).dividerTheme.color ?? AppColors.border),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.labelMedium),
          const SizedBox(height: AppSpacing.sm),
          if (child != null)
            child!
          else if (value != null)
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  value!,
                  style: AppTypography.displayMedium.copyWith(fontSize: 28),
                ),
                if (subtitle != null) ...[
                  const SizedBox(width: 4),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(subtitle!, style: AppTypography.bodySmall),
                  ),
                ],
              ],
            ),
          if (change != null) ...[
            const SizedBox(height: AppSpacing.xs),
            _ChangeIndicator(change: change, isNegativeGood: isNegativeGood),
          ],
        ],
      ),
    );
  }
}

class _ChangeIndicator extends StatelessWidget {
  final dynamic change;
  final bool isNegativeGood;
  const _ChangeIndicator({required this.change, this.isNegativeGood = false});

  @override
  Widget build(BuildContext context) {
    final numVal = change is num ? change as num : 0;
    final isPositive = numVal > 0;
    final isGood = isNegativeGood ? !isPositive : isPositive;
    final color = isGood ? AppColors.accent : AppColors.error;
    final icon = isPositive ? Icons.arrow_upward : Icons.arrow_downward;

    return Row(
      children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 2),
        Text(
          '${numVal.abs()}',
          style: AppTypography.labelSmall.copyWith(color: color, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
