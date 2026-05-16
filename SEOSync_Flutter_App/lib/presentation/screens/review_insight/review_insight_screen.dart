import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/data/models/review.dart';
import 'package:seosync/presentation/blocs/review/review_bloc.dart';
import 'package:seosync/presentation/widgets/shared/loading_state.dart';
import 'package:seosync/presentation/widgets/shared/empty_state.dart';
import 'package:seosync/presentation/widgets/shared/error_state.dart';
import 'package:seosync/presentation/widgets/shared/section_header.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ReviewInsightScreen extends StatefulWidget {
  const ReviewInsightScreen({super.key});

  @override
  State<ReviewInsightScreen> createState() => _ReviewInsightScreenState();
}

class _ReviewInsightScreenState extends State<ReviewInsightScreen> {
  final _urlController = TextEditingController(text: 'com.example.app');

  void _analyze() {
    if (_urlController.text.isNotEmpty) {
      context.read<ReviewBloc>().add(AnalyzeReviews(_urlController.text));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Review Analysis')),
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
                      hintText: 'Enter app package or URL...',
                      prefixIcon: Icon(Icons.apps),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                ElevatedButton(
                  onPressed: _analyze,
                  child: const Text('Analyze'),
                ),
              ],
            ),
          ),
          Expanded(
            child: BlocBuilder<ReviewBloc, ReviewState>(
              builder: (context, state) {
                if (state is ReviewLoading) {
                  return const LoadingState();
                }
                if (state is ReviewError) {
                  return ErrorState(
                    message: state.message,
                    onRetry: _analyze,
                  );
                }
                if (state is ReviewLoaded) {
                  return _ReviewResults(reviews: state.reviews, summary: state.summary);
                }
                return const EmptyState(
                  title: 'Analyze Reviews',
                  subtitle: 'Enter an app to discover insights from user feedback and ratings',
                  icon: Icons.reviews_outlined,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewResults extends StatelessWidget {
  final List<Review> reviews;
  final Map<String, dynamic> summary;
  const _ReviewResults({required this.reviews, required this.summary});

  @override
  Widget build(BuildContext context) {
    final sentiment = summary['sentimentBreakdown'] as Map<String, dynamic>? ?? {};
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                _SummaryStat(
                  label: 'Avg Rating',
                  value: '${summary['avgRating']}',
                  icon: Icons.star,
                  color: AppColors.warning,
                ),
                const SizedBox(width: AppSpacing.md),
                _SummaryStat(
                  label: 'Total Reviews',
                  value: '${summary['totalReviews']}',
                  icon: Icons.people,
                  color: AppColors.primary,
                ),
              ],
            ),
          ),
        ),
        if (sentiment.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardTheme.color,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                  border: Border.all(color: Theme.of(context).dividerTheme.color ?? AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Sentiment Breakdown', style: AppTypography.headingSmall),
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      children: [
                        _SentimentBar(label: 'Positive', value: (sentiment['positive'] as num?)?.toDouble() ?? 0, color: AppColors.accent),
                        const SizedBox(width: AppSpacing.sm),
                        _SentimentBar(label: 'Neutral', value: (sentiment['neutral'] as num?)?.toDouble() ?? 0, color: AppColors.warning),
                        const SizedBox(width: AppSpacing.sm),
                        _SentimentBar(label: 'Negative', value: (sentiment['negative'] as num?)?.toDouble() ?? 0, color: AppColors.error),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),
        const SliverToBoxAdapter(
          child: SectionHeader(title: 'Review Insights'),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) => _ReviewCard(review: reviews[index])
                  .animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.1, end: 0),
              childCount: reviews.length,
            ),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
      ],
    );
  }
}

class _SummaryStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _SummaryStat({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          border: Border.all(color: Theme.of(context).dividerTheme.color ?? AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: AppSpacing.xs),
            Text(value, style: AppTypography.headingLarge.copyWith(fontSize: 22)),
            Text(label, style: AppTypography.labelSmall),
          ],
        ),
      ),
    );
  }
}

class _SentimentBar extends StatelessWidget {
  final String label;
  final double value;
  final Color color;
  const _SentimentBar({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Container(
            height: 8,
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
            ),
            child: FractionallySizedBox(
              widthFactor: value / 100,
              alignment: Alignment.centerLeft,
              child: Container(
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text('$value%', style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600)),
          Text(label, style: AppTypography.labelSmall.copyWith(color: AppColors.textTertiary)),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final Review review;
  const _ReviewCard({required this.review});

  Color get _sentimentColor {
    switch (review.sentiment.toLowerCase()) {
      case 'positive': return AppColors.accent;
      case 'negative': return AppColors.error;
      case 'mixed': return AppColors.warning;
      default: return AppColors.textTertiary;
    }
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
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.primary.withOpacity(0.1),
                child: Text(
                  review.author[0].toUpperCase(),
                  style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(review.author, style: AppTypography.labelLarge),
                    Row(
                      children: [
                        Icon(Icons.star, size: 12, color: AppColors.warning),
                        const SizedBox(width: 2),
                        Text('${review.rating}', style: AppTypography.labelSmall),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _sentimentColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Text(
                  review.sentiment,
                  style: AppTypography.labelSmall.copyWith(
                    color: _sentimentColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(review.content, style: AppTypography.bodyMedium),
          if (review.topics.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.xs,
              children: review.topics.map((t) => Chip(
                label: Text(t, style: AppTypography.labelSmall),
                padding: EdgeInsets.zero,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              )).toList(),
            ),
          ],
          if (review.insight != null) ...[
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
                      review.insight!,
                      style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (review.action != null) ...[
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
                      review.action!,
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
