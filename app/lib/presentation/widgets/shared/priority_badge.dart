import 'package:flutter/material.dart';
import 'package:seosync/core/theme/app_theme.dart';

class PriorityBadge extends StatelessWidget {
  final String priority;
  const PriorityBadge({super.key, required this.priority});

  Color get _color {
    switch (priority.toLowerCase()) {
      case 'high impact':
      case 'critical':
        return AppColors.priorityHigh;
      case 'medium impact':
        return AppColors.priorityMedium;
      case 'low impact':
        return AppColors.priorityLow;
      default:
        return AppColors.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Text(
        priority,
        style: AppTypography.labelSmall.copyWith(
          color: _color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
