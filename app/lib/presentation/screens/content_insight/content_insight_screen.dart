import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:neural_rank/core/theme/app_theme.dart';
import 'package:neural_rank/data/models/content_analysis.dart';
import 'package:neural_rank/presentation/blocs/content/content_bloc.dart';
import 'package:neural_rank/presentation/widgets/shared/loading_state.dart';
import 'package:neural_rank/presentation/widgets/shared/empty_state.dart';
import 'package:neural_rank/presentation/widgets/shared/error_state.dart';
import 'package:neural_rank/presentation/widgets/shared/score_ring.dart';
import 'package:neural_rank/presentation/widgets/shared/section_header.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ContentInsightScreen extends StatefulWidget {
  const ContentInsightScreen({super.key});

  @override
  State<ContentInsightScreen> createState() => _ContentInsightScreenState();
}

class _ContentInsightScreenState extends State<ContentInsightScreen> {
  final _urlController = TextEditingController(text: 'https://example.com');

  void _analyze() {
    if (_urlController.text.isNotEmpty) {
      context.read<ContentBloc>().add(AnalyzeContent(_urlController.text));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Content Insights')),
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
                      hintText: 'Enter page URL to analyze...',
                      prefixIcon: Icon(Icons.link),
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
            child: BlocBuilder<ContentBloc, ContentState>(
              builder: (context, state) {
                if (state is ContentLoading) {
                  return const LoadingState();
                }
                if (state is ContentError) {
                  return ErrorState(
                    message: state.message,
                    onRetry: _analyze,
                  );
                }
                if (state is ContentLoaded) {
                  return _ContentResults(analysis: state.analysis);
                }
                return const EmptyState(
                  title: 'Analyze Your Content',
                  subtitle: 'Enter a URL to get SEO insights, issues, and actionable fixes',
                  icon: Icons.article_outlined,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ContentResults extends StatelessWidget {
  final ContentAnalysis analysis;
  const _ContentResults({required this.analysis});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                ScoreRing(score: analysis.seoScore, size: 80),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('SEO Score', style: AppTypography.headingSmall),
                      if (analysis.topInsight != null) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          analysis.topInsight!,
                          style: AppTypography.bodyMedium,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        if (analysis.topAction != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                  border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.priority_high, color: AppColors.primary),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Top Priority Action', style: AppTypography.labelLarge.copyWith(color: AppColors.primary)),
                          const SizedBox(height: 2),
                          Text(analysis.topAction!, style: AppTypography.bodyMedium),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        if (analysis.issues.isNotEmpty) ...[
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),
          const SliverToBoxAdapter(
            child: SectionHeader(title: 'Issues Found'),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _IssueCard(issue: analysis.issues[index])
                    .animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.1, end: 0),
                childCount: analysis.issues.length,
              ),
            ),
          ),
        ],
        if (analysis.opportunities.isNotEmpty) ...[
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),
          const SliverToBoxAdapter(
            child: SectionHeader(title: 'Opportunities'),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _OpportunityCard(opportunity: analysis.opportunities[index])
                    .animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.1, end: 0),
                childCount: analysis.opportunities.length,
              ),
            ),
          ),
        ],
        const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
      ],
    );
  }
}

class _IssueCard extends StatelessWidget {
  final ContentIssue issue;
  const _IssueCard({required this.issue});

  Color get _severityColor {
    switch (issue.severity.toLowerCase()) {
      case 'high': return AppColors.priorityHigh;
      case 'medium': return AppColors.priorityMedium;
      case 'low': return AppColors.priorityLow;
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _severityColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Text(
                  issue.severity,
                  style: AppTypography.labelSmall.copyWith(
                    color: _severityColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(issue.title, style: AppTypography.headingSmall),
          const SizedBox(height: AppSpacing.xs),
          Text(issue.description, style: AppTypography.bodyMedium),
          if (issue.fixAction != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.05),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Row(
                children: [
                  Icon(Icons.build, size: 14, color: AppColors.accentDark),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      issue.fixAction!,
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

class _OpportunityCard extends StatelessWidget {
  final ContentOpportunity opportunity;
  const _OpportunityCard({required this.opportunity});

  Color get _impactColor {
    switch (opportunity.impact.toLowerCase()) {
      case 'high': return AppColors.accent;
      case 'medium': return AppColors.warning;
      case 'low': return AppColors.info;
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _impactColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Text(
                  opportunity.impact,
                  style: AppTypography.labelSmall.copyWith(
                    color: _impactColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(opportunity.title, style: AppTypography.headingSmall),
          const SizedBox(height: AppSpacing.xs),
          Text(opportunity.description, style: AppTypography.bodyMedium),
          if (opportunity.action != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Row(
                children: [
                  Icon(Icons.arrow_forward, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      opportunity.action!,
                      style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
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
