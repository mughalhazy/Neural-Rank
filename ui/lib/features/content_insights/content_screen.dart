import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/components/pattern_blocks.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class ContentScreen extends StatelessWidget {
  const ContentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: ScreenStateHost(
        state: contentState,
        loadingIcon: AppIconSymbol.content,
        emptyIcon: AppIconSymbol.content,
        errorIcon: AppIconSymbol.alert,
        success: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CommandHeader(
              eyebrow: 'Content / listing insights',
              title: 'Find listing copy to fix first.',
              subtitle:
                  'Turn weak copy, missing keywords, and screenshot gaps into rewrite tasks.',
              actionLabel: 'Review copy fixes',
              symbol: AppIconSymbol.content,
              tone: AppColors.accent2,
            ),
            SizedBox(height: AppSpacing.lg),
            CommercialFeatureList(
              moduleLabel: 'Content / Listing Insights',
              features: contentCommercialFeatures,
              tone: AppColors.accent2,
            ),
          ],
        ),
      ),
    );
  }
}
