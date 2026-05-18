part of 'content_bloc.dart';

abstract class ContentState extends Equatable {
  const ContentState();
  @override
  List<Object?> get props => [];
}

class ContentInitial extends ContentState {}
class ContentLoading extends ContentState {}
class ContentLoaded extends ContentState {
  final ContentAnalysis analysis;
  const ContentLoaded({required this.analysis});
  @override
  List<Object?> get props => [analysis];
}
class ContentError extends ContentState {
  final String message;
  const ContentError(this.message);
  @override
  List<Object?> get props => [message];
}
