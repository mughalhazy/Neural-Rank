import 'package:equatable/equatable.dart';

class Keyword extends Equatable {
  final String id;
  final String term;
  final int searchVolume;
  final double difficulty;
  final double cpc;
  final String intent;
  final List<String> relatedTerms;
  final String? insight;
  final String? action;

  const Keyword({
    required this.id,
    required this.term,
    required this.searchVolume,
    required this.difficulty,
    required this.cpc,
    required this.intent,
    this.relatedTerms = const [],
    this.insight,
    this.action,
  });

  @override
  List<Object?> get props => [id, term, searchVolume, difficulty, cpc, intent, relatedTerms, insight, action];
}
