import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/components/pattern_blocks.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: ScreenStateHost(
        state: dashboardState,
        loadingIcon: AppIconSymbol.workflow,
        emptyIcon: AppIconSymbol.dashboard,
        errorIcon: AppIconSymbol.alert,
        success: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CommandHeader(
              eyebrow: 'Home',
              title: 'Start with the most important growth task.',
              subtitle:
                  'A simple command page for the actions that matter most.',
              actionLabel: 'View top task',
              symbol: AppIconSymbol.dashboard,
              tone: AppColors.accent2,
            ),
            SizedBox(height: AppSpacing.lg),
            CommercialFeatureList(
              moduleLabel: 'Dashboard',
              features: dashboardCommercialFeatures,
              tone: AppColors.accent2,
            ),
          ],
        ),
      ),
    );
  }
}
