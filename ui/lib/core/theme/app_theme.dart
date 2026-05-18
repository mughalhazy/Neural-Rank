import 'package:flutter/material.dart';

class AppColors {
  static const Color ink = Color(0xFFFFFFFF);
  static const Color canvas = Color(0xFFF4F7FB);
  static const Color panel = Color(0xFFFFFFFF);
  static const Color panelAlt = Color(0xFFF8FAFD);
  static const Color line = Color(0xFFDCE4EF);
  static const Color glass = Color(0xFFEFF4FA);
  static const Color text = Color(0xFF172033);
  static const Color muted = Color(0xFF6E7A90);
  static const Color accent = Color(0xFF3CCFC4);
  static const Color accent2 = Color(0xFF356FF6);
  static const Color signal = Color(0xFF7F8BFF);
  static const Color warning = Color(0xFFFFB44C);
  static const Color danger = Color(0xFFF1686C);
  static const Color success = Color(0xFF35B56A);
  static const Color locked = Color(0xFF98A2B3);
  static const Color info = Color(0xFF356FF6);
}

class AppSpacing {
  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
}

class AppOpacity {
  static const double surfaceLow = 0.06;
  static const double surface = 0.1;
  static const double surfaceStrong = 0.16;
  static const double border = 0.16;
  static const double borderStrong = 0.24;
  static const double glow = 0.1;
  static const double card = 1;
}

class AppInsets {
  static const EdgeInsets screen = EdgeInsets.fromLTRB(
    AppSpacing.lg,
    AppSpacing.lg,
    AppSpacing.lg,
    112,
  );
  static const EdgeInsets chip = EdgeInsets.symmetric(
    horizontal: AppSpacing.md,
    vertical: 10,
  );
  static const EdgeInsets compactChip = EdgeInsets.symmetric(
    horizontal: AppSpacing.sm,
    vertical: 10,
  );
  static const EdgeInsets card = EdgeInsets.all(AppSpacing.lg);
  static const EdgeInsets cardCompact = EdgeInsets.all(AppSpacing.md);
  static const EdgeInsets item = EdgeInsets.all(AppSpacing.sm);
}

class AppRadii {
  static const double sm = 12;
  static const double md = 18;
  static const double lg = 28;
  static const double xl = 36;
  static const double pill = 999;
}

class AppSizes {
  static const double iconSm = 16;
  static const double iconMd = 20;
  static const double iconLg = 28;
  static const double inputHeight = 52;
}

class AppTheme {
  static ThemeData build() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.canvas,
      colorScheme: const ColorScheme.light(
        surface: AppColors.panel,
        primary: AppColors.accent2,
        secondary: AppColors.accent,
        error: AppColors.danger,
      ),
    );

    return base.copyWith(
      textTheme: const TextTheme(
        displaySmall: TextStyle(
          fontSize: 36,
          height: 1.08,
          fontWeight: FontWeight.w800,
          color: AppColors.text,
          letterSpacing: -1.5,
        ),
        headlineMedium: TextStyle(
          fontSize: 25,
          height: 1.2,
          fontWeight: FontWeight.w700,
          color: AppColors.text,
          letterSpacing: -0.8,
        ),
        titleLarge: TextStyle(
          fontSize: 19,
          height: 1.25,
          fontWeight: FontWeight.w700,
          color: AppColors.text,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          height: 1.25,
          fontWeight: FontWeight.w700,
          color: AppColors.text,
        ),
        bodyLarge: TextStyle(
          fontSize: 15,
          height: 1.45,
          fontWeight: FontWeight.w500,
          color: AppColors.text,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          height: 1.45,
          fontWeight: FontWeight.w500,
          color: AppColors.muted,
        ),
        labelLarge: TextStyle(
          fontSize: 12,
          height: 1.2,
          fontWeight: FontWeight.w600,
          color: AppColors.text,
          letterSpacing: 0.2,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.accent2,
          foregroundColor: AppColors.ink,
          minimumSize: const Size(0, AppSizes.inputHeight),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
          elevation: 0,
          textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
        color: AppColors.panel,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          side: BorderSide(color: AppColors.line.withValues(alpha: 0.75)),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
        ),
        side: BorderSide.none,
        backgroundColor: AppColors.panelAlt,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.line,
        thickness: 1,
        space: 1,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.panel.withValues(alpha: 0.96),
        indicatorColor: AppColors.accent2.withValues(alpha: 0.1),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected ? AppColors.accent2 : AppColors.muted,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            fontSize: 11,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
            color: selected ? AppColors.text : AppColors.muted,
          );
        }),
      ),
    );
  }
}
