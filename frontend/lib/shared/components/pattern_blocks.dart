import 'package:flutter/material.dart';

import '../../core/models/ui_models.dart';
import '../../core/models/view_state.dart';
import '../../core/theme/app_theme.dart';
import '../icons/app_icon.dart';
import 'primitives.dart';
import '../widgets/sections.dart';

class ScreenStateHost extends StatelessWidget {
  const ScreenStateHost({
    super.key,
    required this.state,
    required this.success,
    this.loadingIcon = AppIconSymbol.workflow,
    this.emptyIcon = AppIconSymbol.search,
    this.errorIcon = AppIconSymbol.alert,
  });

  final ScreenStateConfig state;
  final Widget success;
  final AppIconSymbol loadingIcon;
  final AppIconSymbol emptyIcon;
  final AppIconSymbol errorIcon;

  @override
  Widget build(BuildContext context) {
    switch (state.status) {
      case ViewStatus.loading:
        return AppStateView(
          icon: loadingIcon,
          title: state.loadingTitle,
          message: state.loadingMessage,
          tone: AppColors.info,
        );
      case ViewStatus.empty:
        return AppStateView(
          icon: emptyIcon,
          title: state.emptyTitle,
          message: state.emptyMessage,
          tone: AppColors.muted,
        );
      case ViewStatus.error:
        return AppStateView(
          icon: errorIcon,
          title: state.errorTitle,
          message: state.errorMessage,
          tone: AppColors.danger,
        );
      case ViewStatus.success:
        return success;
    }
  }
}

class ReviewClusterCard extends StatelessWidget {
  const ReviewClusterCard({super.key, required this.cluster});

  final ReviewClusterData cluster;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: AppInsets.cardCompact,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: cluster.tone,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    cluster.title,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                StatusChip(
                  label: '${cluster.mentionCount} mentions',
                  tone: cluster.tone,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(cluster.summary, style: Theme.of(context).textTheme.bodyLarge),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                StatusChip(label: cluster.sentimentLabel, tone: cluster.tone),
                ...cluster.examples.map(
                  (example) =>
                      StatusChip(label: example, tone: AppColors.panelAlt),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class CompetitorComparisonBlock extends StatelessWidget {
  const CompetitorComparisonBlock({super.key, required this.items});

  final List<CompetitorComparisonData> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: AppInsets.cardCompact,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Competitor comparison block',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'One governed pattern for visibility, trust, and messaging pressure.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.sm),
            ...items.map(
              (item) => Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: AppInsets.item,
                decoration: BoxDecoration(
                  color: AppColors.ink.withValues(alpha: AppOpacity.surface),
                  borderRadius: BorderRadius.circular(AppRadii.md),
                  border: Border.all(color: AppColors.line),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        AppIcon(AppIconSymbol.competitor, color: item.tone),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            item.name,
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ),
                        StatusChip(label: item.advantage, tone: item.tone),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Visibility: ${item.visibility}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    Text(
                      'Review trust: ${item.reviewTrust}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    Text(
                      'Messaging: ${item.messaging}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
