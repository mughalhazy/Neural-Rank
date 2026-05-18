import 'package:flutter/material.dart';

import '../../core/models/module_registry.dart';
import '../../core/theme/app_theme.dart';
import '../components/primitives.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key, required this.modules});

  final List<FrontendModuleDefinition> modules;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final items = widget.modules
        .map(
          (module) => AppNavDestination(
            icon: module.icon,
            label: module.label,
          ).toNavigationDestination(),
        )
        .toList(growable: false);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(color: AppColors.canvas),
        child: IndexedStack(
          index: currentIndex,
          children: widget.modules.map((module) => module.screen).toList(),
        ),
      ),
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.line.withValues(alpha: 0.8)),
          ),
          color: AppColors.panel.withValues(alpha: 0.96),
        ),
        child: NavigationBar(
          height: 74,
          selectedIndex: currentIndex,
          destinations: items,
          onDestinationSelected: (value) {
            setState(() {
              currentIndex = value;
            });
          },
        ),
      ),
    );
  }
}
