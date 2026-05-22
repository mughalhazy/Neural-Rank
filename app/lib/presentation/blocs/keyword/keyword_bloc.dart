import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:neural_rank/data/models/keyword.dart';
import 'package:neural_rank/data/repositories/seo_repository.dart';

part 'keyword_event.dart';
part 'keyword_state.dart';

class KeywordBloc extends Bloc<KeywordEvent, KeywordState> {
  final SEORepository _repository;

  KeywordBloc(this._repository) : super(KeywordInitial()) {
    on<AnalyzeKeywords>(_onAnalyze);
    on<LoadSavedKeywords>(_onLoadSaved);
  }

  Future<void> _onAnalyze(AnalyzeKeywords event, Emitter<KeywordState> emit) async {
    emit(KeywordLoading());
    try {
      final keywords = await _repository.analyzeKeywords(event.query);
      emit(KeywordLoaded(keywords: keywords, query: event.query));
    } catch (e) {
      emit(KeywordError(e.toString()));
    }
  }

  Future<void> _onLoadSaved(LoadSavedKeywords event, Emitter<KeywordState> emit) async {
    emit(KeywordLoading());
    try {
      final keywords = await _repository.getSavedKeywords();
      emit(KeywordLoaded(keywords: keywords));
    } catch (e) {
      emit(KeywordError(e.toString()));
    }
  }
}
