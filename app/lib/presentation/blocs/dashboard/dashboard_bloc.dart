import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:neural_rank/data/models/insight.dart';
import 'package:neural_rank/data/repositories/seo_repository.dart';

part 'dashboard_event.dart';
part 'dashboard_state.dart';

class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  final SEORepository _repository;

  DashboardBloc(this._repository) : super(DashboardInitial()) {
    on<LoadDashboard>(_onLoadDashboard);
    on<RefreshDashboard>(_onRefreshDashboard);
    on<MarkInsightRead>(_onMarkInsightRead);
  }

  Future<void> _onLoadDashboard(LoadDashboard event, Emitter<DashboardState> emit) async {
    emit(DashboardLoading());
    try {
      final insights = await _repository.getDashboardInsights();
      final summary = await _repository.getDashboardSummary();
      emit(DashboardLoaded(insights: insights, summary: summary));
    } catch (e) {
      emit(DashboardError(e.toString()));
    }
  }

  Future<void> _onRefreshDashboard(RefreshDashboard event, Emitter<DashboardState> emit) async {
    if (state is DashboardLoaded) {
      final current = state as DashboardLoaded;
      emit(DashboardLoaded(insights: current.insights, summary: current.summary, isRefreshing: true));
    }
    add(LoadDashboard());
  }

  Future<void> _onMarkInsightRead(MarkInsightRead event, Emitter<DashboardState> emit) async {
    if (state is DashboardLoaded) {
      final current = state as DashboardLoaded;
      final updated = current.insights.map((i) =>
        i.id == event.insightId ? i.copyWith(isRead: true) : i
      ).toList();
      emit(DashboardLoaded(insights: updated, summary: current.summary));
    }
  }
}
