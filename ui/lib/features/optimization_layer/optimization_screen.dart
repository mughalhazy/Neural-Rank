import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class OptimizationScreen extends StatelessWidget {
  const OptimizationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommandHeader(
            eyebrow: 'Optimization layer',
            title: 'Turn findings into a fix list.',
            subtitle:
                'Preview the edits Neural Rank would prepare from active signals.',
            actionLabel: 'Preview fix list',
            symbol: AppIconSymbol.priority,
            tone: AppColors.accent2,
          ),
          SizedBox(height: AppSpacing.lg),
          CommercialFeatureList(
            moduleLabel: 'Optimization Layer',
            features: optimizationCommercialFeatures,
            tone: AppColors.accent2,
          ),
        ],
      ),
    );
  }
}
