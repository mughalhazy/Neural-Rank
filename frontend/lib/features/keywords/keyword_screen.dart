import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/components/pattern_blocks.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class KeywordScreen extends StatelessWidget {
  const KeywordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: ScreenStateHost(
        state: keywordState,
        loadingIcon: AppIconSymbol.keyword,
        emptyIcon: AppIconSymbol.search,
        errorIcon: AppIconSymbol.alert,
        success: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CommandHeader(
              eyebrow: 'Keyword analysis',
              title: 'Find keywords worth using.',
              subtitle:
                  'Choose the terms to target and where they should be placed.',
              actionLabel: 'View keyword tasks',
              symbol: AppIconSymbol.keyword,
              tone: AppColors.accent,
            ),
            SizedBox(height: AppSpacing.lg),
            CommercialFeatureList(
              moduleLabel: 'Keyword Analysis',
              features: keywordCommercialFeatures,
              tone: AppColors.accent,
            ),
          ],
        ),
      ),
    );
  }
}
