import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/data/models/rank_data.dart';
import 'package:seosync/presentation/blocs/rank/rank_bloc.dart';
import 'package:seosync/presentation/widgets/shared/loading_state.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';
import 'package:seosync/presentation/widgets/shared/error_state.dart';
import 'package:flutter_animate/flutter_animate.dart';

class RankScreen extends StatefulWidget {
  const RankScreen({super.key});

  @override
  State<RankScreen> createState() => _RankScreenState();
}

class _RankScreenState extends State<RankScreen> {
  final _urlController = TextEditingController(text: 'https://example.com');

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    if (_urlController.text.isNotEmpty) {
      context.read<RankBloc>().add(LoadRankData(_urlController.text));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rank Tracking')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _urlController,
                    decoration: const InputDecoration(
                      hintText: 'Enter website URL...',
                      prefixIcon: Icon(Icons.link),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                ElevatedButton(
                  onPressed: _loadData,
                  child: const Icon(Icons.refresh),
                ),
              ],
            ),
          ),
          Expanded(
            child: BlocBuilder<RankBloc, RankState>(
              builder: (context, state) {
                if (state is RankLoading) {
                  return const LoadingState();
                }
                if (state is RankError) {
                  return ErrorState(
                    message: state.message,
                    onRetry: _loadData,
                  );
                }
                if (state is RankLoaded) {
                  if (state.data.isEmpty) {
                    return const EmptyState(
                      title: 'No rank data',
                      subtitle: 'Add keywords to track their positions',
                      icon: Icons.trending_flat,
                    );
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                    itemCount: state.data.length,
                    itemBuilder: (context, index) => _RankCard(
                      data: state.data[index],
                    ).animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.1, end: 0),
                  );
                }
                return const EmptyState(
                  title: 'Track Rankings',
                  subtitle: 'Monitor how your keywords perform in search results',
                  icon: Icons.trending_up,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _RankCard extends StatelessWidget {
  final RankData data;
  const _RankCard({required this.data});

  Color get _positionColor {
    if (data.currentPosition <= 3) return AppColors.accent;
    if (data.currentPosition <= 10) return AppColors.warning;
    return AppColors.error;
  }

  Color get _changeColor {
    if (data.positionChange > 0) return AppColors.accent;
    if (data.positionChange < 0) return AppColors.error;
    return AppColors.textTertiary;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: Theme.of(context).dividerTheme.color ?? AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _positionColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Center(
                  child: Text(
                    '#${data.currentPosition}',
                    style: AppTypography.labelLarge.copyWith(
                      color: _positionColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(data.keyword, style: AppTypography.headingSmall),
                    Text(data.url, style: AppTypography.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              if (data.positionChange != 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _changeColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        data.isImproved ? Icons.arrow_upward : Icons.arrow_downward,
                        size: 12,
                        color: _changeColor,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        '${data.positionChange.abs()}',
                        style: AppTypography.labelSmall.copyWith(
                          color: _changeColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          if (data.insight != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Row(
                children: [
                  Icon(Icons.insights, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      data.insight!,
                      style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (data.action != null) ...[
            const SizedBox(height: AppSpacing.xs),
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.05),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Row(
                children: [
                  Icon(Icons.arrow_forward, size: 14, color: AppColors.accentDark),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      data.action!,
                      style: AppTypography.labelMedium.copyWith(color: AppColors.accentDark),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
