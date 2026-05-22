import 'package:flutter/material.dart';
import 'package:neural_rank/core/theme/app_theme.dart';
import 'package:neural_rank/data/models/insight.dart';
import 'package:neural_rank/presentation/widgets/shared/priority_badge.dart';

class DrilldownScreen extends StatelessWidget {
  final Insight insight;
  const DrilldownScreen({super.key, required this.insight});

  @override
  Widget build(BuildContext context) {
    final hasEvidence = insight.evidence != null && insight.evidence!.isNotEmpty;
    final hasExplanation = insight.explanation != null;
    final hasAction = insight.action != null;
    final hasNextStep = insight.nextStep != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(insight.module),
        leading: const BackButton(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PriorityBadge(priority: insight.priority),
            const SizedBox(height: AppSpacing.sm),
            Text(insight.title, style: AppTypography.headingLarge),
            const SizedBox(height: AppSpacing.sm),
            Text(insight.description, style: AppTypography.bodyLarge),
            if (hasEvidence) ...[
              const SizedBox(height: AppSpacing.lg),
              Text(
                'Evidence',
                style: AppTypography.headingSmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.xs,
                runSpacing: AppSpacing.xs,
                children: insight.evidence!.map((e) => _EvidenceChip(label: e)).toList(),
              ),
            ],
            if (hasExplanation) ...[
              const SizedBox(height: AppSpacing.lg),
              Text(
                'Why this matters',
                style: AppTypography.headingSmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.info.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Text(
                  insight.explanation!,
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
            if (hasAction) ...[
              const SizedBox(height: AppSpacing.lg),
              Text(
                'Recommended action',
                style: AppTypography.headingSmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Row(
                  children: [
                    Icon(Icons.arrow_forward, size: 16, color: AppColors.primary),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        insight.action!,
                        style: AppTypography.labelMedium.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (hasNextStep) ...[
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.textInverse,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                  ),
                  child: Text(
                    insight.nextStep!,
                    style: AppTypography.labelLarge.copyWith(
                      color: AppColors.textInverse,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }
}

class _EvidenceChip extends StatelessWidget {
  final String label;
  const _EvidenceChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.borderLight,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: AppTypography.labelSmall.copyWith(color: AppColors.textSecondary),
      ),
    );
  }
}
