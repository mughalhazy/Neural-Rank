enum ViewStatus { loading, success, empty, error }

class ScreenStateConfig {
  const ScreenStateConfig({
    required this.status,
    required this.loadingTitle,
    required this.loadingMessage,
    required this.emptyTitle,
    required this.emptyMessage,
    required this.errorTitle,
    required this.errorMessage,
  });

  final ViewStatus status;
  final String loadingTitle;
  final String loadingMessage;
  final String emptyTitle;
  final String emptyMessage;
  final String errorTitle;
  final String errorMessage;
}
