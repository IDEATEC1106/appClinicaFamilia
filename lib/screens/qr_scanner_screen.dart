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

  Future<void> _pickImageAndScan(ImageSource source) async {
    final status = await Permission.camera.request();
    if (!status.isGranted && source == ImageSource.camera) {
      _showErrorDialog("Se requiere el permiso de la cámara para continuar.");
      return;
    }

    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 90,
      );

      if (image == null) return;

      setState(() {
        _isProcessing = true;
      });

      final inputImage = InputImage.fromFilePath(image.path);
      final List<Barcode> barcodes = await _barcodeScanner.processImage(inputImage);

      if (barcodes.isNotEmpty) {
        String? qrCode;
        for (final barcode in barcodes) {
          if (barcode.rawValue != null && barcode.rawValue!.isNotEmpty) {
            qrCode = barcode.rawValue;
            break;
          }
        }

        if (qrCode != null) {
          _processQRCode(qrCode);
          return;
        }
      }

      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog("No se detectó un código QR válido en la imagen. Intente nuevamente.");
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog("Error al procesar la imagen: $e");
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
                      size: 110,
                      color: Colors.blueAccent,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Elija una opción para registrar el acceso mediante el código QR proporcionado por la clínica:',
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
                        label: const Text('Tomar Foto al QR'),
                        onPressed: () => _pickImageAndScan(ImageSource.camera),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.blueAccent,
                          side: const BorderSide(color: Colors.blueAccent, width: 2),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        icon: const Icon(Icons.image),
                        label: const Text('Seleccionar de la Galería'),
                        onPressed: () => _pickImageAndScan(ImageSource.gallery),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
