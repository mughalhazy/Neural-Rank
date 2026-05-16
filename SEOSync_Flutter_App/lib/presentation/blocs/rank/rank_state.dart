part of 'rank_bloc.dart';

abstract class RankState extends Equatable {
  const RankState();
  @override
  List<Object?> get props => [];
}

class RankInitial extends RankState {}
class RankLoading extends RankState {}
class RankLoaded extends RankState {
  final List<RankData> data;
  final String url;
  const RankLoaded({required this.data, required this.url});
  @override
  List<Object?> get props => [data, url];
}
class RankError extends RankState {
  final String message;
  const RankError(this.message);
  @override
  List<Object?> get props => [message];
}
