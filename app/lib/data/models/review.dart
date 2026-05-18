import 'package:equatable/equatable.dart';

class Review extends Equatable {
  final String id;
  final String author;
  final String content;
  final double rating;
  final DateTime date;
  final String sentiment;
  final List<String> topics;
  final String? insight;
  final String? action;

  const Review({
    required this.id,
    required this.author,
    required this.content,
    required this.rating,
    required this.date,
    required this.sentiment,
    this.topics = const [],
    this.insight,
    this.action,
  });

  @override
  List<Object?> get props => [id, author, content, rating, date, sentiment, topics, insight, action];
}
