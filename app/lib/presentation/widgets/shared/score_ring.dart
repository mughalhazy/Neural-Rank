import 'package:flutter/material.dart';
import 'package:neural_rank/core/theme/app_theme.dart';

class ScoreRing extends StatelessWidget {
  final double score;
  final double size;
  final double strokeWidth;
  const ScoreRing({
    super.key,
    required this.score,
    this.size = 72,
    this.strokeWidth = 6,
  });

  Color get _scoreColor {
    if (score >= 80) return AppColors.accent;
    if (score >= 60) return AppColors.warning;
    return AppColors.error;
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CircularProgressIndicator(
            value: score / 100,
            strokeWidth: strokeWidth,
            backgroundColor: (Theme.of(context).dividerTheme.color ?? AppColors.border).withOpacity(0.3),
            valueColor: AlwaysStoppedAnimation<Color>(_scoreColor),
          ),
          Center(
            child: Text(
              '${score.toInt()}',
              style: AppTypography.headingLarge.copyWith(
                fontSize: size * 0.35,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
