import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/data/models/keyword.dart';
import 'package:seosync/presentation/blocs/keyword/keyword_bloc.dart';
import 'package:seosync/presentation/widgets/shared/loading_state.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';
import 'package:seosync/presentation/widgets/shared/error_state.dart';
import 'package:seosync/presentation/widgets/shared/section_header.dart';
import 'package:flutter_animate/flutter_animate.dart';

class KeywordScreen extends StatefulWidget {
  const KeywordScreen({super.key});

  @override
  State<KeywordScreen> createState() => _KeywordScreenState();
}

class _KeywordScreenState extends State<KeywordScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Keyword Analysis')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Enter a keyword or topic...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
              ),
              onSubmitted: (value) {
                if (value.trim().isNotEmpty) {
                  context.read<KeywordBloc>().add(AnalyzeKeywords(value.trim()));
                }
              },
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: BlocBuilder<KeywordBloc, KeywordState>(
              builder: (context, state) {
                if (state is KeywordLoading) {
                  return const LoadingState();
                }
                if (state is KeywordError) {
                  return ErrorState(
                    message: state.message,
                    onRetry: () {
                      if (_searchController.text.isNotEmpty) {
                        context.read<KeywordBloc>().add(AnalyzeKeywords(_searchController.text));
                      }
                    },
                  );
                }
                if (state is KeywordLoaded) {
                  if (state.keywords.isEmpty) {
                    return const EmptyState(
                      title: 'No keywords found',
                      subtitle: 'Try a different search term',
                      icon: Icons.search_off,
                    );
                  }
                  return CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: SectionHeader(
                          title: 'Results for "${state.query ?? ''}"',
                          actionLabel: '${state.keywords.length} found',
                        ),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) => _KeywordCard(
                              keyword: state.keywords[index],
                            ).animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.1, end: 0),
                            childCount: state.keywords.length,
                          ),
                        ),
                      ),
                      const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
                    ],
                  );
                }
                return EmptyState(
                  title: 'Discover Keywords',
                  subtitle: 'Enter a topic to find high-value keyword opportunities with insights and actions',
                  icon: Icons.lightbulb_outline,
                  onAction: () {},
                  actionLabel: 'Try "SEO tools"',
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _KeywordCard extends StatelessWidget {
  final Keyword keyword;
  const _KeywordCard({required this.keyword});

  Color get _difficultyColor {
    if (keyword.difficulty < 0.3) return AppColors.accent;
    if (keyword.difficulty < 0.6) return AppColors.warning;
    return AppColors.error;
  }

  String get _difficultyLabel {
    if (keyword.difficulty < 0.3) return 'Easy';
    if (keyword.difficulty < 0.6) return 'Medium';
    return 'Hard';
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
              Expanded(
                child: Text(
                  keyword.term,
                  style: AppTypography.headingSmall,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _difficultyColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Text(
                  _difficultyLabel,
                  style: AppTypography.labelSmall.copyWith(
                    color: _difficultyColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              _MetricChip(
                icon: Icons.search,
                label: '${(keyword.searchVolume / 1000).toStringAsFixed(1)}K',
                tooltip: 'Monthly searches',
              ),
              const SizedBox(width: AppSpacing.sm),
              _MetricChip(
                icon: Icons.attach_money,
                label: '\$${keyword.cpc.toStringAsFixed(2)}',
                tooltip: 'Cost per click',
              ),
              const SizedBox(width: AppSpacing.sm),
              _MetricChip(
                icon: Icons.psychology,
                label: keyword.intent,
                tooltip: 'Search intent',
              ),
            ],
          ),
          if (keyword.insight != null) ...[
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
                      keyword.insight!,
                      style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (keyword.action != null) ...[
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
                      keyword.action!,
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

class _MetricChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String tooltip;
  const _MetricChip({required this.icon, required this.label, required this.tooltip});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: (Theme.of(context).dividerTheme.color ?? AppColors.border).withOpacity(0.3),
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: AppColors.textTertiary),
            const SizedBox(width: 4),
            Text(label, style: AppTypography.labelSmall),
          ],
        ),
      ),
    );
  }
}
