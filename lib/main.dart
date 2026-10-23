import 'package:flutter/material.dart';
import 'screens/qr_scanner_screen.dart'; // Corregido sin prefijo de carpeta extra

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Clínica Familia - Neonato',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const QrScannerScreen(),
    );
  }
}
