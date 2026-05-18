part of 'review_bloc.dart';

abstract class ReviewState extends Equatable {
  const ReviewState();
  @override
  List<Object?> get props => [];
}

class ReviewInitial extends ReviewState {}
class ReviewLoading extends ReviewState {}
class ReviewLoaded extends ReviewState {
  final List<Review> reviews;
  final Map<String, dynamic> summary;
  const ReviewLoaded({required this.reviews, required this.summary});
  @override
  List<Object?> get props => [reviews, summary];
}
class ReviewError extends ReviewState {
  final String message;
  const ReviewError(this.message);
  @override
  List<Object?> get props => [message];
}
