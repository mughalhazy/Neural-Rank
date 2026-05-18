import 'package:equatable/equatable.dart';

class RankData extends Equatable {
  final String id;
  final String keyword;
  final String url;
  final int currentPosition;
  final int previousPosition;
  final DateTime trackedAt;
  final String? insight;
  final String? action;

  int get positionChange => previousPosition - currentPosition;
  bool get isImproved => positionChange > 0;
  bool get isDeclined => positionChange < 0;

  const RankData({
    required this.id,
    required this.keyword,
    required this.url,
    required this.currentPosition,
    required this.previousPosition,
    required this.trackedAt,
    this.insight,
    this.action,
  });

  @override
  List<Object?> get props => [id, keyword, url, currentPosition, previousPosition, trackedAt, insight, action];
}
