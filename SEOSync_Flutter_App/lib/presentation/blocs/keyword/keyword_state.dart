part of 'keyword_bloc.dart';

abstract class KeywordState extends Equatable {
  const KeywordState();
  @override
  List<Object?> get props => [];
}

class KeywordInitial extends KeywordState {}
class KeywordLoading extends KeywordState {}
class KeywordLoaded extends KeywordState {
  final List<Keyword> keywords;
  final String? query;
  const KeywordLoaded({required this.keywords, this.query});
  @override
  List<Object?> get props => [keywords, query];
}
class KeywordError extends KeywordState {
  final String message;
  const KeywordError(this.message);
  @override
  List<Object?> get props => [message];
}
