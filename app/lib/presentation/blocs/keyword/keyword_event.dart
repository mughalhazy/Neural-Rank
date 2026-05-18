part of 'keyword_bloc.dart';

abstract class KeywordEvent extends Equatable {
  const KeywordEvent();
  @override
  List<Object?> get props => [];
}

class AnalyzeKeywords extends KeywordEvent {
  final String query;
  const AnalyzeKeywords(this.query);
  @override
  List<Object?> get props => [query];
}

class LoadSavedKeywords extends KeywordEvent {}
