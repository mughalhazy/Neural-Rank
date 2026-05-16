import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class CreativeScreen extends StatelessWidget {
  const CreativeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommandHeader(
            eyebrow: 'Creative / messaging',
            title: 'Find screenshot messages to improve.',
            subtitle:
                'Preview which creative message is unclear and what to rewrite.',
            actionLabel: 'Preview message fix',
            symbol: AppIconSymbol.insight,
            tone: AppColors.signal,
          ),
          SizedBox(height: AppSpacing.lg),
          CommercialFeatureList(
            moduleLabel: 'Creative / Messaging',
            features: creativeCommercialFeatures,
            tone: AppColors.signal,
          ),
        ],
      ),
    );
  }
}
