import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../core/models/ui_models.dart';
import '../../core/theme/app_theme.dart';
import '../components/primitives.dart';
import '../icons/app_icon.dart';

class ScreenFrame extends StatelessWidget {
  const ScreenFrame({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Stack(
        children: [
          const Positioned(
            top: -60,
            right: -30,
            child: GlowOrb(color: AppColors.signal, size: 220),
          ),
          const Positioned(
            top: 220,
            left: -70,
            child: GlowOrb(color: AppColors.accent, size: 220),
          ),
          const Positioned(
            bottom: 180,
            right: -90,
            child: GlowOrb(color: AppColors.accent2, size: 240),
          ),
          SingleChildScrollView(padding: AppInsets.screen, child: child),
        ],
      ),
    );
  }
}

class GlowOrb extends StatelessWidget {
  const GlowOrb({super.key, required this.color, required this.size});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              color.withValues(alpha: AppOpacity.glow),
              Colors.transparent,
            ],
          ),
        ),
      ),
    );
  }
}

class CommandHeader extends StatelessWidget {
  const CommandHeader({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.actionLabel,
    this.symbol = AppIconSymbol.flash,
    this.tone = AppColors.accent2,
  });

  final String eyebrow;
  final String title;
  final String subtitle;
  final String actionLabel;
  final AppIconSymbol symbol;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: tone.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(AppRadii.lg),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: tone.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: AppIcon(symbol, color: tone, size: AppSizes.iconMd),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      eyebrow,
                      style: theme.textTheme.labelLarge?.copyWith(color: tone),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(title, style: theme.textTheme.displaySmall),
                    const SizedBox(height: AppSpacing.sm),
                    Text(subtitle, style: theme.textTheme.bodyLarge),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: AppPrimaryButton(
                onPressed: () {},
                icon: symbol,
                label: actionLabel,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    this.tone = AppColors.accent,
  });

  final String label;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadii.pill),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(color: tone),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.title,
    required this.subtitle,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Padding(
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: AppSpacing.xs),
                Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ),
        if (trailing case final Widget trailingWidget) trailingWidget,
      ],
    );
  }
}

class SectionBlock extends StatelessWidget {
  const SectionBlock({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(title: title, subtitle: subtitle, trailing: trailing),
        const SizedBox(height: AppSpacing.sm),
        child,
      ],
    );
  }
}

class MetricRail extends StatelessWidget {
  const MetricRail({super.key, required this.metrics});

  final List<MetricData> metrics;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: metrics.map((metric) => MetricCard(metric: metric)).toList(),
    );
  }
}

class MetricCard extends StatelessWidget {
  const MetricCard({super.key, required this.metric});

  final MetricData metric;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 174,
      child: Card(
        child: Padding(
          padding: AppInsets.cardCompact,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(metric.label, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: AppSpacing.sm),
              Text(
                metric.value,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                metric.delta,
                style: Theme.of(
                  context,
                ).textTheme.labelLarge?.copyWith(color: metric.tone),
              ),
              if (metric.caption != null) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  metric.caption!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
              if (metric.meaning.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  metric.meaning,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
              if (metric.action.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.xs),
                StatusChip(label: metric.action, tone: metric.tone),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class PriorityHero extends StatelessWidget {
  const PriorityHero({super.key, required this.action});

  final PriorityActionData action;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        gradient: LinearGradient(
          colors: [
            action.tone.withValues(alpha: AppOpacity.surfaceStrong),
            AppColors.panel.withValues(alpha: AppOpacity.card),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: action.tone.withValues(alpha: AppOpacity.borderStrong),
        ),
      ),
      padding: AppInsets.cardCompact,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              StatusChip(label: action.priority, tone: action.tone),
              const Spacer(),
              Text(
                action.timeEstimate,
                style: Theme.of(context).textTheme.labelLarge,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'TOP PRIORITY',
            style: Theme.of(
              context,
            ).textTheme.labelLarge?.copyWith(color: action.tone),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(action.title, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(action.summary, style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              MiniSignal(
                icon: AppIconSymbol.insight,
                label: 'Insight anchored',
              ),
              MiniSignal(
                icon: AppIconSymbol.priority,
                label: 'Priority assigned',
              ),
              MiniSignal(icon: AppIconSymbol.check, label: 'Action-ready'),
            ],
          ),
        ],
      ),
    );
  }
}

class MiniSignal extends StatelessWidget {
  const MiniSignal({super.key, required this.icon, required this.label});

  final AppIconSymbol icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppInsets.compactChip,
      decoration: BoxDecoration(
        color: AppColors.ink.withValues(alpha: AppOpacity.surfaceStrong),
        borderRadius: BorderRadius.circular(AppRadii.pill),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AppIcon(icon, size: AppSizes.iconSm, color: AppColors.signal),
          const SizedBox(width: AppSpacing.xs),
          Text(label, style: Theme.of(context).textTheme.labelLarge),
        ],
      ),
    );
  }
}

class InsightList extends StatelessWidget {
  const InsightList({super.key, required this.items});

  final List<InsightData> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: InsightCard(item: item),
            ),
          )
          .toList(),
    );
  }
}

class InsightCard extends StatelessWidget {
  const InsightCard({super.key, required this.item});

  final InsightData item;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: item.tone,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: AppSpacing.xs),
                Expanded(
                  child: Text(
                    item.title,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(item.summary, style: Theme.of(context).textTheme.bodyLarge),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: item.evidence
                  .map((entry) => StatusChip(label: entry, tone: item.tone))
                  .toList(),
            ),
            if (item.impact.isNotEmpty || item.action.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.xs,
                runSpacing: AppSpacing.xs,
                children: [
                  if (item.impact.isNotEmpty)
                    StatusChip(label: item.impact, tone: item.tone),
                  if (item.action.isNotEmpty)
                    StatusChip(label: item.action, tone: AppColors.signal),
                ],
              ),
            ],
            if (item.nextStep case final String nextStep) ...[
              const SizedBox(height: AppSpacing.xs),
              Text(nextStep, style: Theme.of(context).textTheme.labelLarge),
            ],
          ],
        ),
      ),
    );
  }
}

class ModuleFeatureMap extends StatelessWidget {
  const ModuleFeatureMap({super.key, required this.feature});

  final ModuleFeatureData feature;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadii.lg),
          gradient: LinearGradient(
            colors: [
              feature.tone.withValues(alpha: 0.16),
              AppColors.panel.withValues(alpha: AppOpacity.card),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(
            color: feature.tone.withValues(alpha: AppOpacity.borderStrong),
          ),
        ),
        padding: AppInsets.cardCompact,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StatusChip(label: feature.module, tone: feature.tone),
            const SizedBox(height: AppSpacing.md),
            Text(feature.feature, style: theme.textTheme.headlineMedium),
            const SizedBox(height: AppSpacing.sm),
            Text(feature.commercialJob, style: theme.textTheme.bodyLarge),
            const SizedBox(height: AppSpacing.md),
            _FeatureDecisionRow(
              label: 'Use this to',
              value: feature.decisionSupported,
              tone: feature.tone,
            ),
            const SizedBox(height: AppSpacing.sm),
            _FeatureDecisionRow(
              label: 'Why it matters',
              value: feature.valueCreated,
              tone: AppColors.accent,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('What we found', style: theme.textTheme.titleLarge),
            const SizedBox(height: AppSpacing.sm),
            FeatureEvidenceBoard(items: feature.evidence, tone: feature.tone),
            const SizedBox(height: AppSpacing.md),
            FeatureActionCard(feature: feature),
          ],
        ),
      ),
    );
  }
}

class CommercialFeatureList extends StatelessWidget {
  const CommercialFeatureList({
    super.key,
    required this.moduleLabel,
    required this.features,
    this.tone = AppColors.accent,
  });

  final String moduleLabel;
  final List<CommercialFeatureData> features;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: AppInsets.cardCompact,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StatusChip(label: moduleLabel, tone: tone),
            const SizedBox(height: AppSpacing.md),
            ...features.map(
              (feature) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: _CommercialFeatureRow(
                  feature: feature,
                  tone: tone,
                  moduleLabel: moduleLabel,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CommercialFeatureRow extends StatelessWidget {
  const _CommercialFeatureRow({
    required this.feature,
    required this.tone,
    required this.moduleLabel,
  });

  final CommercialFeatureData feature;
  final Color tone;
  final String moduleLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppInsets.item,
      decoration: BoxDecoration(
        color: AppColors.panelAlt,
        borderRadius: BorderRadius.circular(AppRadii.md),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: tone, shape: BoxShape.circle),
            child: AppIcon(
              _resolveFeatureIcon(feature.iconKey),
              size: AppSizes.iconSm,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  feature.name,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppSpacing.xxs),
                Text(
                  feature.description,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  AppIconSymbol _resolveFeatureIcon(String iconKey) {
    switch (iconKey) {
      case 'dashboard':
        return AppIconSymbol.dashboard;
      case 'keyword':
        return AppIconSymbol.keyword;
      case 'rank':
        return AppIconSymbol.rank;
      case 'content':
        return AppIconSymbol.content;
      case 'review':
        return AppIconSymbol.review;
      case 'settings':
        return AppIconSymbol.settings;
      case 'flash':
        return AppIconSymbol.flash;
      case 'insight':
        return AppIconSymbol.insight;
      case 'priority':
        return AppIconSymbol.priority;
      case 'check':
        return AppIconSymbol.check;
      case 'lock':
        return AppIconSymbol.lock;
      case 'workflow':
        return AppIconSymbol.workflow;
      case 'competitor':
        return AppIconSymbol.competitor;
      case 'filter':
        return AppIconSymbol.filter;
      case 'alert':
        return AppIconSymbol.alert;
      case 'search':
        return AppIconSymbol.search;
    }
    return AppIconSymbol.flash;
  }
}

class _FeatureDecisionRow extends StatelessWidget {
  const _FeatureDecisionRow({
    required this.label,
    required this.value,
    required this.tone,
  });

  final String label;
  final String value;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppInsets.item,
      decoration: BoxDecoration(
        color: AppColors.ink.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(AppRadii.md),
        border: Border.all(color: tone.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(
              context,
            ).textTheme.labelLarge?.copyWith(color: tone),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(value, style: Theme.of(context).textTheme.bodyMedium),
          ),
        ],
      ),
    );
  }
}

class FeatureEvidenceBoard extends StatelessWidget {
  const FeatureEvidenceBoard({
    super.key,
    required this.items,
    required this.tone,
  });

  final List<FeatureEvidenceData> items;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: _FeatureEvidenceTile(item: item, tone: tone),
            ),
          )
          .toList(),
    );
  }
}

class _FeatureEvidenceTile extends StatelessWidget {
  const _FeatureEvidenceTile({required this.item, required this.tone});

  final FeatureEvidenceData item;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppInsets.item,
      decoration: BoxDecoration(
        color: AppColors.ink.withValues(alpha: 0.24),
        borderRadius: BorderRadius.circular(AppRadii.md),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 82,
            child: Text(
              item.value,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(color: tone),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.label,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppSpacing.xxs),
                Text(
                  item.interpretation,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FeatureActionCard extends StatelessWidget {
  const FeatureActionCard({super.key, required this.feature});

  final ModuleFeatureData feature;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppInsets.item,
      decoration: BoxDecoration(
        color: feature.tone.withValues(alpha: 0.13),
        borderRadius: BorderRadius.circular(AppRadii.md),
        border: Border.all(color: feature.tone.withValues(alpha: 0.42)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppIcon(AppIconSymbol.check, color: feature.tone),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Do next',
                  style: Theme.of(
                    context,
                  ).textTheme.labelLarge?.copyWith(color: feature.tone),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  feature.primaryAction,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ActionQueue extends StatelessWidget {
  const ActionQueue({super.key, required this.items});

  final List<PriorityActionData> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const AppIcon(AppIconSymbol.check, color: AppColors.signal),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'Action queue',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Do these in order. Each task is tied to a visible issue.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.sm),
            ...items.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: Container(
                  padding: AppInsets.item,
                  decoration: BoxDecoration(
                    color: AppColors.ink.withValues(alpha: 0.22),
                    borderRadius: BorderRadius.circular(AppRadii.md),
                    border: Border.all(
                      color: item.tone.withValues(alpha: 0.34),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        margin: const EdgeInsets.only(top: AppSpacing.xxs),
                        decoration: BoxDecoration(
                          color: item.tone,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Text(
                              item.summary,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        item.timeEstimate,
                        style: Theme.of(context).textTheme.labelLarge,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class TrendTableCard extends StatelessWidget {
  const TrendTableCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.rows,
  });

  final String title;
  final String subtitle;
  final List<TrendRowData> rows;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        subtitle,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 78,
                  height: 44,
                  child: CustomPaint(
                    painter: SparkPainter(
                      color: AppColors.accent,
                      values: rows
                          .asMap()
                          .entries
                          .map(
                            (entry) =>
                                0.25 + ((entry.key + 1) / (rows.length + 2)),
                          )
                          .toList(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ...rows.map(
              (row) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.ink.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.line),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            row.label,
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            row.secondaryValue,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          if (row.explanation.isNotEmpty) ...[
                            const SizedBox(height: AppSpacing.xxs),
                            Text(
                              row.explanation,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                          if (row.action.isNotEmpty) ...[
                            const SizedBox(height: AppSpacing.xs),
                            Text(
                              row.action,
                              style: Theme.of(context).textTheme.labelLarge
                                  ?.copyWith(color: AppColors.signal),
                            ),
                          ],
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          row.primaryValue,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          row.delta,
                          style: Theme.of(context).textTheme.labelLarge
                              ?.copyWith(
                                color: row.isPositive
                                    ? AppColors.success
                                    : AppColors.danger,
                              ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    StatusChip(
                      label: row.flag,
                      tone: row.isPositive
                          ? AppColors.accent
                          : AppColors.warning,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class LockedModulesGrid extends StatelessWidget {
  const LockedModulesGrid({super.key, required this.items});

  final List<ModulePreviewData> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const AppIcon(
                            AppIconSymbol.lock,
                            color: AppColors.locked,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              item.title,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ),
                          StatusChip(label: item.badge, tone: AppColors.locked),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        item.summary,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: item.metrics
                            .map(
                              (metric) => StatusChip(
                                label: metric,
                                tone: AppColors.locked,
                              ),
                            )
                            .toList(),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class SettingsPanel extends StatelessWidget {
  const SettingsPanel({super.key, required this.title, required this.items});

  final String title;
  final List<MapEntry<String, String>> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 14),
            ...items.map(
              (item) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.ink.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.line),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        item.key,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    Text(
                      item.value,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SparkPainter extends CustomPainter {
  SparkPainter({required this.color, required this.values});

  final Color color;
  final List<double> values;

  @override
  void paint(Canvas canvas, Size size) {
    if (values.length < 2) {
      return;
    }

    final path = Path();
    for (var i = 0; i < values.length; i++) {
      final dx = size.width * i / (values.length - 1);
      final dy = size.height - (values[i] * size.height);
      if (i == 0) {
        path.moveTo(dx, dy);
      } else {
        path.lineTo(dx, dy);
      }
    }

    final glow = Paint()
      ..color = color.withValues(alpha: 0.2)
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final stroke = Paint()
      ..color = color
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(path, glow);
    canvas.drawPath(path, stroke);

    final dotPaint = Paint()..color = color;
    final lastDx = size.width;
    final lastDy = size.height - (values.last * size.height);
    canvas.drawCircle(Offset(lastDx, lastDy), 4, dotPaint);
  }

  @override
  bool shouldRepaint(covariant SparkPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.values != values;
  }
}

class TrendBars extends StatelessWidget {
  const TrendBars({super.key, required this.values});

  final List<double> values;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: values
            .map(
              (value) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Container(
                    height: math.max(24, value * 180),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          AppColors.accent2.withValues(alpha: 0.3),
                          AppColors.accent,
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}
