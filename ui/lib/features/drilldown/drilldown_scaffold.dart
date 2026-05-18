import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../shared/components/primitives.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class DrilldownScaffold extends StatelessWidget {
  const DrilldownScaffold({
    super.key,
    required this.title,
    required this.summary,
    required this.evidence,
  });

  final String title;
  final String summary;
  final List<String> evidence;

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommandHeader(
            eyebrow: 'Detail drilldown archetype',
            title: title,
            subtitle: summary,
            actionLabel: 'Review linked action',
          ),
          const SizedBox(height: AppSpacing.lg),
          const AppAlertStrip(
            title: 'Evidence cluster',
            message:
                'This scaffold exists to support deeper issue inspection before future module drilldowns are wired.',
            tone: AppColors.accent2,
          ),
          const SizedBox(height: AppSpacing.lg),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const AppIcon(
                        AppIconSymbol.insight,
                        color: AppColors.accent,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        'Supporting evidence',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ...evidence.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: Text(
                        item,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
