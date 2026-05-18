part of 'dashboard_bloc.dart';

abstract class DashboardState extends Equatable {
  const DashboardState();
  @override
  List<Object?> get props => [];
}

class DashboardInitial extends DashboardState {}
class DashboardLoading extends DashboardState {}
class DashboardLoaded extends DashboardState {
  final List<Insight> insights;
  final Map<String, dynamic> summary;
  final bool isRefreshing;
  const DashboardLoaded({
    required this.insights,
    required this.summary,
    this.isRefreshing = false,
  });
  @override
  List<Object?> get props => [insights, summary, isRefreshing];
}
class DashboardError extends DashboardState {
  final String message;
  const DashboardError(this.message);
  @override
  List<Object?> get props => [message];
}
