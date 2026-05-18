import 'package:equatable/equatable.dart';

/// Base Insight entity — converts data → insight → action
class Insight extends Equatable {
  final String id;
  final String title;
  final String description;
  final String module;
  final String priority;
  final String? action;
  final DateTime createdAt;
  final bool isRead;
  final Map<String, dynamic>? metadata;

  const Insight({
    required this.id,
    required this.title,
    required this.description,
    required this.module,
    required this.priority,
    this.action,
    required this.createdAt,
    this.isRead = false,
    this.metadata,
  });

  Insight copyWith({
    String? id,
    String? title,
    String? description,
    String? module,
    String? priority,
    String? action,
    DateTime? createdAt,
    bool? isRead,
    Map<String, dynamic>? metadata,
  }) => Insight(
    id: id ?? this.id,
    title: title ?? this.title,
    description: description ?? this.description,
    module: module ?? this.module,
    priority: priority ?? this.priority,
    action: action ?? this.action,
    createdAt: createdAt ?? this.createdAt,
    isRead: isRead ?? this.isRead,
    metadata: metadata ?? this.metadata,
  );

  @override
  List<Object?> get props => [id, title, description, module, priority, action, createdAt, isRead, metadata];
}
