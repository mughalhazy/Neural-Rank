import 'package:flutter_test/flutter_test.dart';

import 'package:frontend/app/app.dart';

void main() {
  testWidgets('renders Neural Rank home shell', (WidgetTester tester) async {
    await tester.pumpWidget(const NeuralRankApp());

    expect(find.text('Neural Rank'), findsNothing);
    expect(find.text('What to do today'), findsOneWidget);
    expect(find.text('Keywords'), findsOneWidget);
  });
}
