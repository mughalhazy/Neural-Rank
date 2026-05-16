part of 'review_bloc.dart';

abstract class ReviewEvent extends Equatable {
  const ReviewEvent();
  @override
  List<Object?> get props => [];
}

class AnalyzeReviews extends ReviewEvent {
  final String appUrl;
  const AnalyzeReviews(this.appUrl);
  @override
  List<Object?> get props => [appUrl];
}
