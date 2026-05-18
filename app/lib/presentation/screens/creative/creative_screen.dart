import 'package:flutter/material.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';

class CreativeScreen extends StatelessWidget {
  const CreativeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Creative / Messaging')),
      body: const EmptyState(
        title: 'Coming Soon',
        subtitle: 'Screenshot critique, messaging suggestions, and conversion optimization will be available in the next update. This module is already built into the architecture.',
        icon: Icons.palette_outlined,
      ),
    );
  }
}
