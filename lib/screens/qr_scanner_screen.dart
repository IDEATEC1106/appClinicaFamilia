import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'home_screen.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  bool _isScanned = false;

  void _processQRCode(String qrCode) async {
    if (_isScanned) return;
    setState(() {
      _isScanned = true;
    });

    // Validaciones de longitud mínima del código QR (ejemplo: 10 dígitos totales)
    if (qrCode.length < 10) {
      _showErrorDialog("El código QR no tiene el formato válido.");
      return;
    }

    // Extracción de segmentos según regla de negocio
    String primeros6 = qrCode.substring(0, 6); // Para sp_Clinicas_GetInfoClinica
    String ultimos4 = qrCode.substring(qrCode.length - 4); // Para sp_Familias_GetInfoFamilia

    // TODO: Llamar a tu API Flask para validar:
    // 1. sp_RegistroQR_GetInfoQR con [qrCode]
    // 2. sp_Clinicas_GetInfoClinica con [primeros6] -> cli_razSocial, cli_ruc
    // 3. sp_Familias_GetInfoFamilia con [ultimos4] -> fam_padre

    // Simulación de respuesta exitosa para pasar a la siguiente pantalla:
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    // Navegar a la pantalla principal enviando los datos obtenidos
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => HomeScreen(
          razonSocial: "Clínica Ejemplo S.A.C. ($primeros6)",
          ruc: "20123456789",
          nombrePadre: "Padre de Familia ($ultimos4)",
        ),
      ),
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Error de Validación"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _isScanned = false;
              });
            },
            child: const Text("Reintentar"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escanee el Código QR de Acceso'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: MobileScanner(
        onDetect: (capture) {
          final List<Barcode> barcodes = capture.barcodes;
          for (final barcode in barcodes) {
            if (barcode.rawValue != null) {
              _processQRCode(barcode.rawValue!);
              break;
            }
          }
        },
      ),
    );
  }
}
