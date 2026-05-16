import 'package:flutter/material.dart';
import 'package:seosync/core/theme/app_theme.dart';

extension BuildContextExt on BuildContext {
  ThemeData get theme => Theme.of(this);
  ColorScheme get colors => theme.colorScheme;
  TextTheme get textTheme => theme.textTheme;
  Size get screenSize => MediaQuery.of(this).size;
  double get screenWidth => screenSize.width;
  double get screenHeight => screenSize.height;
  bool get isDark => theme.brightness == Brightness.dark;
}

extension StringExt on String {
  String get capitalize => isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
  String get truncate {
    if (length <= 40) return this;
    return '${substring(0, 37)}...';
  }
}

extension DateTimeExt on DateTime {
  String get formatted => '$day/$month/$year';
  String get relative {
    final diff = DateTime.now().difference(this);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    if (diff.inDays < 30) return '${(diff.inDays / 7).floor()}w ago';
    return formatted;
  }
}
