import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class CompetitorScreen extends StatelessWidget {
  const CompetitorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommandHeader(
            eyebrow: 'Competitor analysis',
            title: 'Find competitor gaps worth closing.',
            subtitle:
                'Preview where rivals are stronger and what response would matter.',
            actionLabel: 'Preview rival gaps',
            symbol: AppIconSymbol.competitor,
            tone: AppColors.warning,
          ),
          SizedBox(height: AppSpacing.lg),
          CommercialFeatureList(
            moduleLabel: 'Competitor Analysis',
            features: competitorCommercialFeatures,
            tone: AppColors.warning,
          ),
        ],
      ),
    );
  }
}
