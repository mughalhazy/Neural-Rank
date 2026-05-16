import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/components/pattern_blocks.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class ReviewScreen extends StatelessWidget {
  const ReviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: ScreenStateHost(
        state: reviewState,
        loadingIcon: AppIconSymbol.review,
        emptyIcon: AppIconSymbol.review,
        errorIcon: AppIconSymbol.alert,
        success: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CommandHeader(
              eyebrow: 'Review analysis',
              title: 'Find review issues that can hurt trust.',
              subtitle:
                  'Turn repeated complaints and user requests into clear actions.',
              actionLabel: 'Review trust issues',
              symbol: AppIconSymbol.review,
              tone: AppColors.danger,
            ),
            SizedBox(height: AppSpacing.lg),
            CommercialFeatureList(
              moduleLabel: 'Review Analysis',
              features: reviewCommercialFeatures,
              tone: AppColors.danger,
            ),
          ],
        ),
      ),
    );
  }
}
