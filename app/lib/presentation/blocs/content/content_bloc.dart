import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:seosync/data/models/content_analysis.dart';
import 'package:seosync/data/repositories/seo_repository.dart';

part 'content_event.dart';
part 'content_state.dart';

class ContentBloc extends Bloc<ContentEvent, ContentState> {
  final SEORepository _repository;

  ContentBloc(this._repository) : super(ContentInitial()) {
    on<AnalyzeContent>(_onAnalyze);
  }

  Future<void> _onAnalyze(AnalyzeContent event, Emitter<ContentState> emit) async {
    emit(ContentLoading());
    try {
      final analysis = await _repository.analyzeContent(event.url);
      emit(ContentLoaded(analysis: analysis));
    } catch (e) {
      emit(ContentError(e.toString()));
    }
  }
}
