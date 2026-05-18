import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/core/constants/app_constants.dart';
import 'package:seosync/presentation/blocs/settings/settings_bloc.dart';
import 'package:seosync/presentation/widgets/shared/loading_state.dart';
import 'package:seosync/presentation/widgets/shared/error_state.dart';
import 'package:seosync/presentation/widgets/shared/section_header.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<SettingsBloc>().add(LoadSettings());
  }

  String _capitalize(String s) {
    if (s.isEmpty) return s;
    return '${s[0].toUpperCase()}${s.substring(1)}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: BlocBuilder<SettingsBloc, SettingsState>(
        builder: (context, state) {
          if (state is SettingsLoading) {
            return const LoadingState();
          }
          if (state is SettingsError) {
            return ErrorState(
              message: state.message,
              onRetry: () => context.read<SettingsBloc>().add(LoadSettings()),
            );
          }
          if (state is SettingsLoaded) {
            final s = state.settings;
            return ListView(
              children: [
                const SectionHeader(title: 'General'),
                _SettingTile(
                  icon: Icons.notifications_outlined,
                  title: 'Push Notifications',
                  subtitle: 'Get alerts for ranking changes and new insights',
                  trailing: Switch(
                    value: s['notifications'] ?? true,
                    onChanged: (v) => context.read<SettingsBloc>().add(UpdateSetting('notifications', v)),
                  ),
                ),
                _SettingTile(
                  icon: Icons.dark_mode_outlined,
                  title: 'Dark Mode',
                  subtitle: 'Follow system, light, or dark',
                  trailing: Text(
                    _capitalize(s['darkMode'] ?? 'system'),
                    style: AppTypography.bodyMedium,
                  ),
                  onTap: () => _showDarkModePicker(context, s['darkMode'] ?? 'system'),
                ),
                _SettingTile(
                  icon: Icons.language_outlined,
                  title: 'Language',
                  subtitle: 'App display language',
                  trailing: Text(
                    (s['language'] ?? 'en').toUpperCase(),
                    style: AppTypography.bodyMedium,
                  ),
                  onTap: () {},
                ),
                const SizedBox(height: AppSpacing.lg),
                const SectionHeader(title: 'Data & Sync'),
                _SettingTile(
                  icon: Icons.sync_outlined,
                  title: 'Data Refresh',
                  subtitle: 'How often to update rankings and insights',
                  trailing: Text(
                    _capitalize(s['dataRefresh'] ?? 'daily'),
                    style: AppTypography.bodyMedium,
                  ),
                  onTap: () {},
                ),
                _SettingTile(
                  icon: Icons.folder_outlined,
                  title: 'Default Project',
                  subtitle: 'Active project for analysis',
                  trailing: Text(
                    _capitalize(s['defaultProject'] ?? 'main'),
                    style: AppTypography.bodyMedium,
                  ),
                  onTap: () {},
                ),
                const SizedBox(height: AppSpacing.lg),
                const SectionHeader(title: 'Modules'),
                _ModuleTile(
                  title: 'Review Analysis',
                  active: AppConstants.moduleReviewActive,
                  icon: Icons.reviews_outlined,
                ),
                _ModuleTile(
                  title: 'Content Insights',
                  active: AppConstants.moduleContentActive,
                  icon: Icons.article_outlined,
                ),
                _ModuleTile(
                  title: 'Keyword Analysis',
                  active: AppConstants.moduleKeywordActive,
                  icon: Icons.search_outlined,
                ),
                _ModuleTile(
                  title: 'Rank Tracking',
                  active: AppConstants.moduleRankActive,
                  icon: Icons.trending_up_outlined,
                ),
                _ModuleTile(
                  title: 'Competitor Analysis',
                  active: AppConstants.moduleCompetitorActive,
                  icon: Icons.people_outline,
                  isGated: true,
                ),
                _ModuleTile(
                  title: 'Optimization Layer',
                  active: AppConstants.moduleOptimizationActive,
                  icon: Icons.build_outlined,
                  isGated: true,
                ),
                _ModuleTile(
                  title: 'Creative / Messaging',
                  active: AppConstants.moduleCreativeActive,
                  icon: Icons.palette_outlined,
                  isGated: true,
                ),
                _ModuleTile(
                  title: 'Unified Workflow',
                  active: AppConstants.moduleWorkflowActive,
                  icon: Icons.account_tree_outlined,
                  isGated: true,
                ),
                const SizedBox(height: AppSpacing.xl),
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    children: [
                      Text(
                        '${AppConstants.appName} v${AppConstants.appVersion}',
                        style: AppTypography.bodySmall,
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        'Built for Android - Ready for Web & Portal',
                        style: AppTypography.labelSmall.copyWith(color: AppColors.textTertiary),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
              ],
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  void _showDarkModePicker(BuildContext context, String current) {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: ['system', 'light', 'dark'].map((mode) => ListTile(
            title: Text(_capitalize(mode)),
            trailing: current == mode ? const Icon(Icons.check, color: AppColors.primary) : null,
            onTap: () {
              context.read<SettingsBloc>().add(UpdateSetting('darkMode', mode));
              Navigator.pop(context);
            },
          )).toList(),
        ),
      ),
    );
  }
}

class _SettingTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.08),
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: AppTypography.labelLarge),
      subtitle: Text(subtitle, style: AppTypography.bodySmall),
      trailing: trailing ?? const Icon(Icons.chevron_right, color: AppColors.textTertiary),
      onTap: onTap,
    );
  }
}

class _ModuleTile extends StatelessWidget {
  final String title;
  final bool active;
  final IconData icon;
  final bool isGated;

  const _ModuleTile({
    required this.title,
    required this.active,
    required this.icon,
    this.isGated = false,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: active
              ? AppColors.accent.withOpacity(0.1)
              : AppColors.textTertiary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
        child: Icon(
          icon,
          color: active ? AppColors.accent : AppColors.textTertiary,
          size: 20,
        ),
      ),
      title: Text(title, style: AppTypography.labelLarge),
      subtitle: Text(
        isGated ? 'Coming soon' : (active ? 'Active' : 'Inactive'),
        style: AppTypography.bodySmall.copyWith(
          color: isGated ? AppColors.warning : (active ? AppColors.accent : AppColors.textTertiary),
        ),
      ),
      trailing: isGated
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Text(
                'Soon',
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.warning,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          : Icon(
              active ? Icons.check_circle : Icons.radio_button_unchecked,
              color: active ? AppColors.accent : AppColors.textTertiary,
            ),
    );
  }
}
