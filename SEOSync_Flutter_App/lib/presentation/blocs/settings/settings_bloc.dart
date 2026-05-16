import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:seosync/data/repositories/seo_repository.dart';

part 'settings_event.dart';
part 'settings_state.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  final SEORepository _repository;

  SettingsBloc(this._repository) : super(SettingsInitial()) {
    on<LoadSettings>(_onLoad);
    on<UpdateSetting>(_onUpdate);
  }

  Future<void> _onLoad(LoadSettings event, Emitter<SettingsState> emit) async {
    emit(SettingsLoading());
    try {
      final settings = await _repository.getSettings();
      emit(SettingsLoaded(settings: settings));
    } catch (e) {
      emit(SettingsError(e.toString()));
    }
  }

  Future<void> _onUpdate(UpdateSetting event, Emitter<SettingsState> emit) async {
    if (state is SettingsLoaded) {
      final current = state as SettingsLoaded;
      final updated = Map<String, dynamic>.from(current.settings);
      updated[event.key] = event.value;
      emit(SettingsLoaded(settings: updated));
      await _repository.updateSettings(updated);
    }
  }
}
