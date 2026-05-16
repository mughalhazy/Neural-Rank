import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final DateTime createdAt;
  final List<String> activeModules;

  const User({
    required this.id,
    required this.email,
    this.displayName,
    this.avatarUrl,
    required this.createdAt,
    this.activeModules = const [],
  });

  @override
  List<Object?> get props => [id, email, displayName, avatarUrl, createdAt, activeModules];
}
