import 'package:flutter/material.dart';

import '../core/models/module_registry.dart';
import '../core/theme/app_theme.dart';
import '../shared/widgets/app_shell.dart';

class NeuralRankApp extends StatelessWidget {
  const NeuralRankApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Neural Rank',
      theme: AppTheme.build(),
      home: AppShell(modules: getActiveNavigationModules()),
    );
  }
}
