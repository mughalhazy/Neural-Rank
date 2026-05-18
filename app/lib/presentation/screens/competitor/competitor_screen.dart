import 'package:flutter/material.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';

class CompetitorScreen extends StatelessWidget {
  const CompetitorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Competitor Analysis')),
      body: const EmptyState(
        title: 'Coming Soon',
        subtitle: 'Competitor tracking and gap analysis will be available in the next update. This module is already built into the architecture.',
        icon: Icons.people_outline,
      ),
    );
  }
}
