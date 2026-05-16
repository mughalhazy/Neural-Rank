import 'package:flutter/material.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';

class OptimizationScreen extends StatelessWidget {
  const OptimizationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Optimization')),
      body: const EmptyState(
        title: 'Coming Soon',
        subtitle: 'Automated optimization suggestions and execution guidance will be available in the next update. This module is already built into the architecture.',
        icon: Icons.build_outlined,
      ),
    );
  }
}
