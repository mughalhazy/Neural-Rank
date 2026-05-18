import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/core/constants/app_constants.dart';

class AppShell extends StatefulWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  final _navItems = [
    _NavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard', path: '/'),
    _NavItem(icon: Icons.search_outlined, activeIcon: Icons.search, label: 'Keywords', path: '/keyword'),
    _NavItem(icon: Icons.trending_up_outlined, activeIcon: Icons.trending_up, label: 'Rank', path: '/rank'),
    _NavItem(icon: Icons.article_outlined, activeIcon: Icons.article, label: 'Content', path: '/content'),
    _NavItem(icon: Icons.reviews_outlined, activeIcon: Icons.reviews, label: 'Reviews', path: '/review'),
  ];

  @override
  Widget build(BuildContext context) {
    final path = GoRouterState.of(context).uri.path;
    _currentIndex = _navItems.indexWhere((i) => i.path == path);
    if (_currentIndex < 0) _currentIndex = 0;

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).bottomNavigationBarTheme.backgroundColor,
          border: Border(
            top: BorderSide(
              color: Theme.of(context).dividerTheme.color ?? AppColors.border,
              width: 1,
            ),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _navItems.asMap().entries.map((e) {
                final idx = e.key;
                final item = e.value;
                final isActive = idx == _currentIndex;
                return _NavButton(
                  item: item,
                  isActive: isActive,
                  onTap: () {
                    if (idx != _currentIndex) {
                      context.go(item.path);
                    }
                  },
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;
  _NavItem({required this.icon, required this.activeIcon, required this.label, required this.path});
}

class _NavButton extends StatelessWidget {
  final _NavItem item;
  final bool isActive;
  final VoidCallback onTap;
  const _NavButton({required this.item, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = isActive ? AppColors.primary : AppColors.textTertiary;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppConstants.animationFast,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isActive ? item.activeIcon : item.icon, color: color, size: AppSpacing.iconLg),
            const SizedBox(height: 2),
            Text(
              item.label,
              style: AppTypography.labelSmall.copyWith(color: color),
            ),
          ],
        ),
      ),
    );
  }
}
