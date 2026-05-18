import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../core/theme/app_theme.dart';

enum AppIconSymbol {
  dashboard,
  keyword,
  rank,
  content,
  review,
  settings,
  flash,
  insight,
  priority,
  check,
  lock,
  workflow,
  competitor,
  filter,
  alert,
  search,
}

enum AppIconTone { active, muted, warning, locked, danger, info }

class AppIcon extends StatelessWidget {
  const AppIcon(
    this.symbol, {
    super.key,
    this.size = AppSizes.iconMd,
    this.color,
    this.tone = AppIconTone.active,
  });

  final AppIconSymbol symbol;
  final double size;
  final Color? color;
  final AppIconTone tone;

  static const Map<AppIconSymbol, String> _assetMap = {
    AppIconSymbol.dashboard: 'assets/icons/dashboard.svg',
    AppIconSymbol.keyword: 'assets/icons/keyword.svg',
    AppIconSymbol.rank: 'assets/icons/rank.svg',
    AppIconSymbol.content: 'assets/icons/content.svg',
    AppIconSymbol.review: 'assets/icons/review.svg',
    AppIconSymbol.settings: 'assets/icons/settings.svg',
    AppIconSymbol.flash: 'assets/icons/flash.svg',
    AppIconSymbol.insight: 'assets/icons/insight.svg',
    AppIconSymbol.priority: 'assets/icons/priority.svg',
    AppIconSymbol.check: 'assets/icons/check.svg',
    AppIconSymbol.lock: 'assets/icons/lock.svg',
    AppIconSymbol.workflow: 'assets/icons/workflow.svg',
    AppIconSymbol.competitor: 'assets/icons/competitor.svg',
    AppIconSymbol.filter: 'assets/icons/filter.svg',
    AppIconSymbol.alert: 'assets/icons/alert.svg',
    AppIconSymbol.search: 'assets/icons/search.svg',
  };

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      _assetMap[symbol]!,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(
        color ?? _resolveToneColor(tone),
        BlendMode.srcIn,
      ),
    );
  }

  Color _resolveToneColor(AppIconTone tone) {
    switch (tone) {
      case AppIconTone.active:
        return AppColors.text;
      case AppIconTone.muted:
        return AppColors.muted;
      case AppIconTone.warning:
        return AppColors.warning;
      case AppIconTone.locked:
        return AppColors.locked;
      case AppIconTone.danger:
        return AppColors.danger;
      case AppIconTone.info:
        return AppColors.info;
    }
  }
}
