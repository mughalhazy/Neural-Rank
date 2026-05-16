import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:seosync/data/models/rank_data.dart';
import 'package:seosync/data/repositories/seo_repository.dart';

part 'rank_event.dart';
part 'rank_state.dart';

class RankBloc extends Bloc<RankEvent, RankState> {
  final SEORepository _repository;

  RankBloc(this._repository) : super(RankInitial()) {
    on<LoadRankData>(_onLoad);
    on<TrackNewKeyword>(_onTrack);
  }

  Future<void> _onLoad(LoadRankData event, Emitter<RankState> emit) async {
    emit(RankLoading());
    try {
      final data = await _repository.getRankData(event.url);
      emit(RankLoaded(data: data, url: event.url));
    } catch (e) {
      emit(RankError(e.toString()));
    }
  }

  Future<void> _onTrack(TrackNewKeyword event, Emitter<RankState> emit) async {
    emit(RankLoading());
    try {
      final data = await _repository.trackKeyword(event.keyword, event.url);
      emit(RankLoaded(data: data, url: event.url));
    } catch (e) {
      emit(RankError(e.toString()));
    }
  }
}
