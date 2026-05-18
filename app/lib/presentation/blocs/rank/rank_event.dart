part of 'rank_bloc.dart';

abstract class RankEvent extends Equatable {
  const RankEvent();
  @override
  List<Object?> get props => [];
}

class LoadRankData extends RankEvent {
  final String url;
  const LoadRankData(this.url);
  @override
  List<Object?> get props => [url];
}

class TrackNewKeyword extends RankEvent {
  final String keyword;
  final String url;
  const TrackNewKeyword(this.keyword, this.url);
  @override
  List<Object?> get props => [keyword, url];
}
