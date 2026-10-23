import 'package:flutter/material.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    // Lanzamos el escáner automáticamente al entrar a la pantalla
    _startScanning();
  }

  Future<void> _startScanning() async {
    // Solicitar permiso de cámara por seguridad
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      if (!mounted) return;
      _showErrorDialog("Se requiere el permiso de la cámara para escanear el QR.");
      return;
    }

    try {
      // Abre la vista de escaneo dedicada en tiempo real
      String barcodeScanRes = await FlutterBarcodeScanner.scanBarcode(
        '#2196F3', // Color de la barra superior (Azul)
        'Cancelar', // Texto del botón de cancelar
        true,       // Mostrar icono de flash / linterna
        ScanMode.QR,
      );

      // Si el usuario cancela, el resultado es '-1'
      if (barcodeScanRes == '-1' || barcodeScanRes.isEmpty) {
        return;
      }

      setState(() {
        _isProcessing = true;
      });

      _processQRCode(barcodeScanRes);
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog("Ocurrió un error al iniciar el escáner: $e");
    }
  }

  void _processQRCode(String qrCode) async {
    if (qrCode.length < 10) {
      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog("El código QR no tiene el formato válido.");
      return;
    }

    final resultado = await ApiService.validarQr(qrCode);

    if (!mounted) return;

    if (resultado.success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => HomeScreen(
            razonSocial: resultado.razonSocial,
            ruc: resultado.ruc,
            nombrePadre: resultado.nombrePadre,
          ),
        ),
      );
    } else {
      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog(resultado.message);
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Aviso"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Permitir reintentar abriendo el escáner de nuevo
              _startScanning();
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
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: _isProcessing
              ? const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text("Validando código QR...", style: TextStyle(fontSize: 16)),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.qr_code_scanner_rounded,
                      size: 110,
                      color: Colors.blueAccent,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Presione el botón para abrir el visor y enfocar automáticamente el código QR de acceso.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 15, color: Colors.black87),
                    ),
                    const SizedBox(height: 36),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Abrir Escáner QR'),
                        onPressed: _startScanning,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
