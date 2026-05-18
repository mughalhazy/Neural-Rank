import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/components/pattern_blocks.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class RankScreen extends StatelessWidget {
  const RankScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: ScreenStateHost(
        state: rankState,
        loadingIcon: AppIconSymbol.rank,
        emptyIcon: AppIconSymbol.rank,
        errorIcon: AppIconSymbol.alert,
        success: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CommandHeader(
              eyebrow: 'Rank tracking',
              title: 'See ranking changes that need action.',
              subtitle:
                  'Know what to recover, what to protect, and what to ignore.',
              actionLabel: 'View ranking tasks',
              symbol: AppIconSymbol.rank,
              tone: AppColors.warning,
            ),
            SizedBox(height: AppSpacing.lg),
            CommercialFeatureList(
              moduleLabel: 'Rank Tracking',
              features: rankCommercialFeatures,
              tone: AppColors.warning,
            ),
          ],
        ),
      ),
    );
  }
}
