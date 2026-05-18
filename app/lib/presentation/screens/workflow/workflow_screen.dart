import 'package:flutter/material.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';

class WorkflowScreen extends StatelessWidget {
  const WorkflowScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Unified Workflow')),
      body: const EmptyState(
        title: 'Coming Soon',
        subtitle: 'The unified workflow layer combining all modules into one operating system will be available in the next update. This module is already built into the architecture.',
        icon: Icons.account_tree_outlined,
      ),
    );
  }
}
