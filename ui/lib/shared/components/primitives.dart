import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../icons/app_icon.dart';

class AppAlertStrip extends StatelessWidget {
  const AppAlertStrip({
    super.key,
    required this.title,
    required this.message,
    this.tone = AppColors.warning,
  });

  final String title;
  final String message;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: AppOpacity.surfaceLow),
        borderRadius: BorderRadius.circular(AppRadii.md),
        border: Border.all(color: tone.withValues(alpha: AppOpacity.border)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppIcon(AppIconSymbol.alert, color: tone),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: AppSpacing.xxs),
                Text(message, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class TrustCueBar extends StatelessWidget {
  const TrustCueBar({
    super.key,
    required this.source,
    required this.freshness,
    required this.confidence,
  });

  final String source;
  final String freshness;
  final String confidence;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Wrap(
        spacing: AppSpacing.sm,
        runSpacing: AppSpacing.sm,
        children: [
          StatusPill(
            icon: AppIconSymbol.content,
            label: source,
            tone: AppColors.signal,
          ),
          StatusPill(
            icon: AppIconSymbol.workflow,
            label: freshness,
            tone: AppColors.accent,
          ),
          StatusPill(
            icon: AppIconSymbol.insight,
            label: confidence,
            tone: AppColors.warning,
          ),
        ],
      ),
    );
  }
}

class StatusPill extends StatelessWidget {
  const StatusPill({
    super.key,
    required this.icon,
    required this.label,
    required this.tone,
  });

  final AppIconSymbol icon;
  final String label;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppInsets.chip,
      decoration: BoxDecoration(
        color: tone.withValues(alpha: AppOpacity.surfaceLow),
        borderRadius: BorderRadius.circular(AppRadii.pill),
        border: Border.all(color: tone.withValues(alpha: AppOpacity.border)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AppIcon(icon, size: AppSizes.iconSm, color: tone),
          const SizedBox(width: AppSpacing.xs),
          Text(label, style: Theme.of(context).textTheme.labelLarge),
        ],
      ),
    );
  }
}

class AppPrimaryButton extends StatelessWidget {
  const AppPrimaryButton({
    super.key,
    required this.label,
    required this.icon,
    this.onPressed,
  });

  final String label;
  final AppIconSymbol icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      onPressed: onPressed,
      icon: AppIcon(icon, color: AppColors.ink),
      label: Text(label),
    );
  }
}

class AppFilterChipBar extends StatelessWidget {
  const AppFilterChipBar({
    super.key,
    required this.items,
    this.selectedIndex = 0,
  });

  final List<String> items;
  final int selectedIndex;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Wrap(
        spacing: AppSpacing.sm,
        runSpacing: AppSpacing.sm,
        children: [
          for (var i = 0; i < items.length; i++)
            Container(
              padding: AppInsets.chip,
              decoration: BoxDecoration(
                color: i == selectedIndex
                    ? AppColors.signal.withValues(alpha: AppOpacity.surface)
                    : AppColors.panelAlt,
                borderRadius: BorderRadius.circular(AppRadii.pill),
                border: Border.all(
                  color: i == selectedIndex
                      ? AppColors.signal.withValues(alpha: AppOpacity.border)
                      : AppColors.line,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppIcon(
                    AppIconSymbol.filter,
                    size: AppSizes.iconSm,
                    color: i == selectedIndex
                        ? AppColors.signal
                        : AppColors.muted,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(items[i], style: Theme.of(context).textTheme.labelLarge),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class AppNavDestination extends StatelessWidget {
  const AppNavDestination({super.key, required this.icon, required this.label});

  final AppIconSymbol icon;
  final String label;

  NavigationDestination toNavigationDestination() {
    return NavigationDestination(
      icon: AppIcon(icon, color: AppColors.muted),
      selectedIcon: AppIcon(icon, color: AppColors.accent2),
      label: label,
    );
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

class AppInputField extends StatelessWidget {
  const AppInputField({
    super.key,
    required this.label,
    required this.hint,
    this.trailing,
  });

  final String label;
  final String hint;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: AppSpacing.xs),
        Container(
          height: AppSizes.inputHeight,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.ink.withValues(alpha: AppOpacity.surface),
            borderRadius: BorderRadius.circular(AppRadii.md),
            border: Border.all(color: AppColors.line),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  hint,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              if (trailing case final Widget trailingWidget) trailingWidget,
            ],
          ),
        ),
      ],
    );
  }
}

class AppChartCard extends StatelessWidget {
  const AppChartCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: AppSpacing.xs),
            Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: AppSpacing.md),
            child,
          ],
        ),
      ),
    );
  }
}

class AppStateView extends StatelessWidget {
  const AppStateView({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.tone = AppColors.muted,
  });

  final AppIconSymbol icon;
  final String title;
  final String message;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.panel,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppIcon(icon, size: AppSizes.iconLg, color: tone),
          const SizedBox(height: AppSpacing.md),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppSpacing.xs),
          Text(message, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
