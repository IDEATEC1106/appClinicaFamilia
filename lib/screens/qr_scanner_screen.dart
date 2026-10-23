import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_mlkit_barcode_scanning/google_mlkit_barcode_scanning.dart';
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
  final ImagePicker _picker = ImagePicker();
  final BarcodeScanner _barcodeScanner = BarcodeScanner(formats: [BarcodeFormat.qrCode]);

  @override
  void dispose() {
    _barcodeScanner.close();
    super.dispose();
  }

  Future<void> _scanWithCamera() async {
    // Solicitar permiso de cámara
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      _showErrorDialog("Se requiere el permiso de la cámara para continuar.");
      return;
    }

    try {
      // Abre la cámara nativa del teléfono para tomar una foto al QR
      final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
      
      if (photo == null) return; // El usuario canceló la foto

      setState(() {
        _isProcessing = true;
      });

      // Analiza la imagen usando ML Kit de Google
      final inputImage = InputImage.fromFilePath(photo.path);
      final List<Barcode> barcodes = await _barcodeScanner.processImage(inputImage);

      if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
        final String qrCode = barcodes.first.rawValue!;
        _processQRCode(qrCode);
      } else {
        setState(() {
          _isProcessing = false;
        });
        _showErrorDialog("No se detectó ningún código QR válido en la foto. Intente de nuevo.");
      }
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog("Ocurrió un error al procesar la imagen: $e");
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
            onPressed: () => Navigator.pop(context),
            child: const Text("Aceptar"),
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
                      size: 120,
                      color: Colors.blueAccent,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Presione el botón para abrir la cámara, enfocar el código QR y proceder con el acceso.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.black87),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Abrir Cámara y Escanear'),
                      onPressed: _scanWithCamera,
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
