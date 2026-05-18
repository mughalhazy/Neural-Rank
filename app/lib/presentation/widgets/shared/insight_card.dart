import 'package:flutter/material.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/data/models/insight.dart';
import 'package:seosync/presentation/widgets/shared/priority_badge.dart';

class InsightCard extends StatelessWidget {
  final Insight insight;
  final VoidCallback? onTap;
  const InsightCard({super.key, required this.insight, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          border: Border.all(
            color: insight.isRead
                ? (Theme.of(context).dividerTheme.color ?? AppColors.border)
                : AppColors.primary.withOpacity(0.3),
            width: insight.isRead ? 1 : 1.5,
          ),
          boxShadow: [AppShadows.shadowSm],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                PriorityBadge(priority: insight.priority),
                const Spacer(),
                Text(
                  insight.module,
                  style: AppTypography.labelSmall.copyWith(color: AppColors.textTertiary),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              insight.title,
              style: AppTypography.headingSmall,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              insight.description,
              style: AppTypography.bodyMedium,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (insight.action != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Row(
                  children: [
                    Icon(Icons.arrow_forward, size: 14, color: AppColors.primary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        insight.action!,
                        style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
