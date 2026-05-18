part of 'content_bloc.dart';

abstract class ContentEvent extends Equatable {
  const ContentEvent();
  @override
  List<Object?> get props => [];
}

class AnalyzeContent extends ContentEvent {
  final String url;
  const AnalyzeContent(this.url);
  @override
  List<Object?> get props => [url];
}
