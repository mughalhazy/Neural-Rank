import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppColors {
  static const Color primary = Color(0xFF0A84FF);
  static const Color primaryDark = Color(0xFF0066CC);
  static const Color primaryLight = Color(0xFF5CADFF);
  static const Color accent = Color(0xFF34C759);
  static const Color accentDark = Color(0xFF248A3D);
  static const Color warning = Color(0xFFFF9500);
  static const Color error = Color(0xFFFF3B30);
  static const Color info = Color(0xFF5AC8FA);

  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFF8F9FA);
  static const Color surfaceElevated = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE8EAED);
  static const Color borderLight = Color(0xFFF1F3F4);
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textInverse = Color(0xFFFFFFFF);

  static const Color darkBackground = Color(0xFF0F0F0F);
  static const Color darkSurface = Color(0xFF1C1C1E);
  static const Color darkSurfaceElevated = Color(0xFF2C2C2E);
  static const Color darkBorder = Color(0xFF3A3A3C);
  static const Color darkTextPrimary = Color(0xFFF5F5F7);
  static const Color darkTextSecondary = Color(0xFF8E8E93);
  static const Color darkTextTertiary = Color(0xFF636366);

  static const Color success = Color(0xFF34C759);
  static const Color successLight = Color(0xFFE8F5E9);
  static const Color warningLight = Color(0xFFFFF3E0);
  static const Color errorLight = Color(0xFFFFEBEE);
  static const Color infoLight = Color(0xFFE3F2FD);

  static const Color priorityHigh = Color(0xFFFF3B30);
  static const Color priorityMedium = Color(0xFFFF9500);
  static const Color priorityLow = Color(0xFF34C759);
}

class AppTypography {
  static const TextStyle displayLarge = TextStyle(
    fontSize: 32, fontWeight: FontWeight.w700,
    letterSpacing: -0.02, height: 1.2, color: AppColors.textPrimary,
  );
  static const TextStyle displayMedium = TextStyle(
    fontSize: 24, fontWeight: FontWeight.w600,
    letterSpacing: -0.01, height: 1.3, color: AppColors.textPrimary,
  );
  static const TextStyle headingLarge = TextStyle(
    fontSize: 20, fontWeight: FontWeight.w600,
    letterSpacing: -0.01, height: 1.4, color: AppColors.textPrimary,
  );
  static const TextStyle headingMedium = TextStyle(
    fontSize: 17, fontWeight: FontWeight.w600,
    letterSpacing: -0.01, height: 1.4, color: AppColors.textPrimary,
  );
  static const TextStyle headingSmall = TextStyle(
    fontSize: 15, fontWeight: FontWeight.w600,
    letterSpacing: 0, height: 1.4, color: AppColors.textPrimary,
  );
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16, fontWeight: FontWeight.w400,
    letterSpacing: 0, height: 1.5, color: AppColors.textPrimary,
  );
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14, fontWeight: FontWeight.w400,
    letterSpacing: 0, height: 1.5, color: AppColors.textSecondary,
  );
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w400,
    letterSpacing: 0.01, height: 1.5, color: AppColors.textTertiary,
  );
  static const TextStyle labelLarge = TextStyle(
    fontSize: 14, fontWeight: FontWeight.w500,
    letterSpacing: 0.01, height: 1.4, color: AppColors.textPrimary,
  );
  static const TextStyle labelMedium = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w500,
    letterSpacing: 0.02, height: 1.4, color: AppColors.textSecondary,
  );
  static const TextStyle labelSmall = TextStyle(
    fontSize: 10, fontWeight: FontWeight.w500,
    letterSpacing: 0.03, height: 1.4, color: AppColors.textTertiary,
  );
}

class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 24;
  static const double radiusFull = 999;
  static const double iconSm = 16;
  static const double iconMd = 20;
  static const double iconLg = 24;
  static const double iconXl = 32;
}

class AppShadows {
  static const BoxShadow shadowSm = BoxShadow(
    color: Color(0x0D000000), blurRadius: 4, offset: Offset(0, 1),
  );
  static const BoxShadow shadowMd = BoxShadow(
    color: Color(0x14000000), blurRadius: 8, offset: Offset(0, 2),
  );
  static const BoxShadow shadowLg = BoxShadow(
    color: Color(0x1A000000), blurRadius: 16, offset: Offset(0, 4),
  );
}

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: AppColors.primary, secondary: AppColors.accent,
      surface: AppColors.surface, background: AppColors.background,
      error: AppColors.error, onPrimary: AppColors.textInverse,
      onSecondary: AppColors.textInverse, onSurface: AppColors.textPrimary,
      onBackground: AppColors.textPrimary, onError: AppColors.textInverse,
    ),
    scaffoldBackgroundColor: AppColors.background,
    textTheme: const TextTheme(
      displayLarge: AppTypography.displayLarge,
      displayMedium: AppTypography.displayMedium,
      headlineLarge: AppTypography.headingLarge,
      headlineMedium: AppTypography.headingMedium,
      headlineSmall: AppTypography.headingSmall,
      bodyLarge: AppTypography.bodyLarge,
      bodyMedium: AppTypography.bodyMedium,
      bodySmall: AppTypography.bodySmall,
      labelLarge: AppTypography.labelLarge,
      labelMedium: AppTypography.labelMedium,
      labelSmall: AppTypography.labelSmall,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        side: const BorderSide(color: AppColors.border, width: 1),
      ),
      color: AppColors.surfaceElevated,
      margin: EdgeInsets.zero,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
      hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textTertiary),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textInverse,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusMd)),
        textStyle: AppTypography.labelLarge.copyWith(color: AppColors.textInverse, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        textStyle: AppTypography.labelMedium,
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.borderLight,
      selectedColor: AppColors.primaryLight.withOpacity(0.15),
      labelStyle: AppTypography.labelSmall,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusSm)),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surfaceElevated,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textTertiary,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      selectedLabelStyle: AppTypography.labelSmall,
      unselectedLabelStyle: AppTypography.labelSmall,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.background,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: AppTypography.headingMedium,
      iconTheme: IconThemeData(color: AppColors.textPrimary),
      systemOverlayStyle: SystemUiOverlayStyle.dark,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.border, thickness: 1, space: 1,
    ),
  );

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.primary, secondary: AppColors.accent,
      surface: AppColors.darkSurface, background: AppColors.darkBackground,
      error: AppColors.error, onPrimary: AppColors.textInverse,
      onSecondary: AppColors.textInverse, onSurface: AppColors.darkTextPrimary,
      onBackground: AppColors.darkTextPrimary, onError: AppColors.textInverse,
    ),
    scaffoldBackgroundColor: AppColors.darkBackground,
    textTheme: TextTheme(
      displayLarge: AppTypography.displayLarge.copyWith(color: AppColors.darkTextPrimary),
      displayMedium: AppTypography.displayMedium.copyWith(color: AppColors.darkTextPrimary),
      headlineLarge: AppTypography.headingLarge.copyWith(color: AppColors.darkTextPrimary),
      headlineMedium: AppTypography.headingMedium.copyWith(color: AppColors.darkTextPrimary),
      headlineSmall: AppTypography.headingSmall.copyWith(color: AppColors.darkTextPrimary),
      bodyLarge: AppTypography.bodyLarge.copyWith(color: AppColors.darkTextPrimary),
      bodyMedium: AppTypography.bodyMedium.copyWith(color: AppColors.darkTextSecondary),
      bodySmall: AppTypography.bodySmall.copyWith(color: AppColors.darkTextTertiary),
      labelLarge: AppTypography.labelLarge.copyWith(color: AppColors.darkTextPrimary),
      labelMedium: AppTypography.labelMedium.copyWith(color: AppColors.darkTextSecondary),
      labelSmall: AppTypography.labelSmall.copyWith(color: AppColors.darkTextTertiary),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        side: const BorderSide(color: AppColors.darkBorder, width: 1),
      ),
      color: AppColors.darkSurfaceElevated,
      margin: EdgeInsets.zero,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.darkSurface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(color: AppColors.darkBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(color: AppColors.darkBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
      hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.darkTextTertiary),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textInverse,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusMd)),
        textStyle: AppTypography.labelLarge.copyWith(color: AppColors.textInverse, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primaryLight,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        textStyle: AppTypography.labelMedium,
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.darkBorder,
      selectedColor: AppColors.primary.withOpacity(0.25),
      labelStyle: AppTypography.labelSmall.copyWith(color: AppColors.darkTextSecondary),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusSm)),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.darkSurface,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.darkTextTertiary,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      selectedLabelStyle: AppTypography.labelSmall,
      unselectedLabelStyle: AppTypography.labelSmall,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.darkBackground,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: AppTypography.headingMedium.copyWith(color: AppColors.darkTextPrimary),
      iconTheme: IconThemeData(color: AppColors.darkTextPrimary),
      systemOverlayStyle: SystemUiOverlayStyle.light,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.darkBorder, thickness: 1, space: 1,
    ),
  );
}
