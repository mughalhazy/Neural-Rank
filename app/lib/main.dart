import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:neural_rank/core/theme/app_theme.dart';
import 'package:neural_rank/core/utils/app_router.dart';
import 'package:neural_rank/presentation/blocs/app_bloc_observer.dart';
import 'package:neural_rank/presentation/blocs/auth/auth_bloc.dart';
import 'package:neural_rank/presentation/blocs/dashboard/dashboard_bloc.dart';
import 'package:neural_rank/presentation/blocs/keyword/keyword_bloc.dart';
import 'package:neural_rank/presentation/blocs/rank/rank_bloc.dart';
import 'package:neural_rank/presentation/blocs/content/content_bloc.dart';
import 'package:neural_rank/presentation/blocs/review/review_bloc.dart';
import 'package:neural_rank/presentation/blocs/settings/settings_bloc.dart';
import 'package:neural_rank/data/repositories/mock_repository.dart';
import 'package:neural_rank/data/repositories/api_repository.dart';
import 'package:neural_rank/data/repositories/seo_repository.dart';
import 'package:neural_rank/presentation/widgets/shared/error_boundary.dart';

const _supabaseUrl = String.fromEnvironment(
  'SUPABASE_URL',
  defaultValue: 'https://bvujfwwwwzlpsxbshxyn.supabase.co',
);
const _supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Color(0xFF0F0F0F),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Supabase is only initialised in release builds.
  // Debug builds use MockRepository and skip auth entirely.
  if (!kDebugMode) {
    await Supabase.initialize(url: _supabaseUrl, anonKey: _supabaseAnonKey);
  }

  Bloc.observer = AppBlocObserver();
  FlutterError.onError = (details) { FlutterError.presentError(details); };
  PlatformDispatcher.instance.onError = (error, stack) { return true; };
  runZonedGuarded(() => runApp(const NeuralRankApp()), (error, stack) {});
}

class NeuralRankApp extends StatefulWidget {
  const NeuralRankApp({super.key});

  @override
  State<NeuralRankApp> createState() => _NeuralRankAppState();
}

class _NeuralRankAppState extends State<NeuralRankApp> {
  // Late-final: initialised once, never rebuilt.
  late final SEORepository _repository;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    if (kDebugMode) {
      // Debug: MockRepository — no network calls, no login required.
      _repository = MockRepository();
      _router = AppRouter.createDebugRouter();
    } else {
      // Release: ApiRepository — Dio client → Render backend, Supabase JWT auth.
      _repository = ApiRepository();
      _router = AppRouter.createRouter();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthBloc(_repository)..add(AppStarted())),
        BlocProvider(create: (_) => DashboardBloc(_repository)),
        BlocProvider(create: (_) => KeywordBloc(_repository)),
        BlocProvider(create: (_) => RankBloc(_repository)),
        BlocProvider(create: (_) => ContentBloc(_repository)),
        BlocProvider(create: (_) => ReviewBloc(_repository)),
        BlocProvider(create: (_) => SettingsBloc(_repository)),
      ],
      child: ErrorBoundaryWidget(
        child: MaterialApp.router(
          title: 'Neural Rank',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.system,
          routerConfig: _router,
        ),
      ),
    );
  }
}
