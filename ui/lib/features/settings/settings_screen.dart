import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/components/pattern_blocks.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: ScreenStateHost(
        state: settingsState,
        loadingIcon: AppIconSymbol.settings,
        emptyIcon: AppIconSymbol.settings,
        errorIcon: AppIconSymbol.alert,
        success: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CommandHeader(
              eyebrow: 'Settings',
              title: 'Check whether your data is ready to use.',
              subtitle:
                  'Manage sources, targets, active tools, and workspace trust.',
              actionLabel: 'Connect data source',
              symbol: AppIconSymbol.settings,
              tone: AppColors.signal,
            ),
            SizedBox(height: AppSpacing.lg),
            CommercialFeatureList(
              moduleLabel: 'Settings',
              features: settingsCommercialFeatures,
              tone: AppColors.warning,
            ),
          ],
        ),
      ),
    );
  }
}
