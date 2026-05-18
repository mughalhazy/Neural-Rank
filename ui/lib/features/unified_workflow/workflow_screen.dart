import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../demo_data/app_demo_data.dart';
import '../../shared/icons/app_icon.dart';
import '../../shared/widgets/sections.dart';

class WorkflowScreen extends StatelessWidget {
  const WorkflowScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommandHeader(
            eyebrow: 'Unified workflow',
            title: 'See all work in one ordered queue.',
            subtitle:
                'Preview how review, content, keyword, and rank tasks combine.',
            actionLabel: 'Preview queue',
            symbol: AppIconSymbol.workflow,
            tone: AppColors.accent,
          ),
          SizedBox(height: AppSpacing.lg),
          CommercialFeatureList(
            moduleLabel: 'Unified Workflow',
            features: workflowCommercialFeatures,
            tone: AppColors.accent,
          ),
        ],
      ),
    );
  }
}
