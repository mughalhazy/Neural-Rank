import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:neural_rank/data/models/review.dart';
import 'package:neural_rank/data/repositories/seo_repository.dart';

part 'review_event.dart';
part 'review_state.dart';

class ReviewBloc extends Bloc<ReviewEvent, ReviewState> {
  final SEORepository _repository;

  ReviewBloc(this._repository) : super(ReviewInitial()) {
    on<AnalyzeReviews>(_onAnalyze);
  }

  Future<void> _onAnalyze(AnalyzeReviews event, Emitter<ReviewState> emit) async {
    emit(ReviewLoading());
    try {
      final reviews = await _repository.analyzeReviews(event.appUrl);
      final summary = await _repository.getReviewSummary(event.appUrl);
      emit(ReviewLoaded(reviews: reviews, summary: summary));
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }
}
