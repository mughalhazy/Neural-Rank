import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:seosync/core/theme/app_theme.dart';
import 'package:seosync/core/utils/app_router.dart';
import 'package:seosync/presentation/blocs/app_bloc_observer.dart';
import 'package:seosync/presentation/blocs/auth/auth_bloc.dart';
import 'package:seosync/presentation/blocs/dashboard/dashboard_bloc.dart';
import 'package:seosync/presentation/blocs/keyword/keyword_bloc.dart';
import 'package:seosync/presentation/blocs/rank/rank_bloc.dart';
import 'package:seosync/presentation/blocs/content/content_bloc.dart';
import 'package:seosync/presentation/blocs/review/review_bloc.dart';
import 'package:seosync/presentation/blocs/settings/settings_bloc.dart';
import 'package:seosync/data/repositories/mock_repository.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Color(0xFF0F0F0F),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  Bloc.observer = AppBlocObserver();
  runApp(const SEOSyncApp());
}

class SEOSyncApp extends StatelessWidget {
  const SEOSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = MockRepository();
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthBloc(repository)..add(AppStarted())),
        BlocProvider(create: (_) => DashboardBloc(repository)),
        BlocProvider(create: (_) => KeywordBloc(repository)),
        BlocProvider(create: (_) => RankBloc(repository)),
        BlocProvider(create: (_) => ContentBloc(repository)),
        BlocProvider(create: (_) => ReviewBloc(repository)),
        BlocProvider(create: (_) => SettingsBloc(repository)),
      ],
      child: MaterialApp.router(
        title: 'SEOSync',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
