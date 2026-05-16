import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../icons/app_icon.dart';

class FlowStageData {
  const FlowStageData({
    required this.label,
    required this.summary,
    required this.icon,
    this.isHighlighted = false,
  });

  final String label;
  final String summary;
  final AppIconSymbol icon;
  final bool isHighlighted;
}

class FlowPipelineCard extends StatelessWidget {
  const FlowPipelineCard({
    super.key,
    required this.title,
    required this.stages,
  });

  final String title;
  final List<FlowStageData> stages;

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
                const AppIcon(
                  AppIconSymbol.workflow,
                  size: AppSizes.iconSm,
                  color: AppColors.signal,
                ),
                const SizedBox(width: AppSpacing.xs),
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Input -> analysis -> insight -> priority -> action',
              style: Theme.of(
                context,
              ).textTheme.labelLarge?.copyWith(color: AppColors.muted),
            ),
            const SizedBox(height: AppSpacing.sm),
            for (var i = 0; i < stages.length; i++) ...[
              _FlowStageRow(stage: stages[i]),
              if (i != stages.length - 1)
                Divider(
                  color: AppColors.line.withValues(alpha: AppOpacity.border),
                  height: AppSpacing.md,
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FlowStageRow extends StatelessWidget {
  const _FlowStageRow({required this.stage});

  final FlowStageData stage;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      decoration: BoxDecoration(
        color: stage.isHighlighted
            ? AppColors.accent2.withValues(alpha: AppOpacity.surfaceLow)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadii.md),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppIcon(
            stage.icon,
            size: AppSizes.iconSm,
            color: stage.isHighlighted ? AppColors.accent2 : AppColors.muted,
          ),
          const SizedBox(width: AppSpacing.xs),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  stage.label,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppSpacing.xxs),
                Text(
                  stage.summary,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
