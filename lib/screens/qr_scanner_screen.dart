import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:google_mlkit_barcode_scanning/google_mlkit_barcode_scanning.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final ImagePicker _picker = ImagePicker();
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    // Abre la cámara de forma totalmente automática apenas carga la pantalla
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _abrirCamaraDirecta();
    });
  }

  Future<void> _abrirCamaraDirecta() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      if (!mounted) return;
      _showErrorDialog("Se requiere el permiso de la cámara para escanear el código QR.");
      return;
    }

    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 90,
      );

      if (photo == null) {
        // Si el usuario cancela la cámara, regresamos o permitimos reintentar
        return;
      }

      setState(() {
        _isProcessing = true;
      });

      // Procesamiento local ultra rápido con Google ML Kit
      final inputImage = InputImage.fromFilePath(photo.path);
      final barcodeScanner = BarcodeScanner(formats: [BarcodeFormat.qr]);
      final List<Barcode> barcodes = await barcodeScanner.processImage(inputImage);
      await barcodeScanner.close();

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
      _showErrorDialog("Error al acceder a la cámara: $e");
    }
  }

  void _processQRCode(String qrCode) async {
    if (qrCode.length < 10) {
      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog("El código QR no tiene un formato válido.");
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
              _abrirCamaraDirecta();
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
        title: const Text('Escaneo de Código QR'),
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
                    SizedBox(height: 20),
                    Text(
                      "Validando código en el sistema...",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                    ),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.camera_alt_rounded,
                      size: 100,
                      color: Colors.blueAccent,
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Activando cámara para escaneo automático...',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.black87),
                    ),
                    const SizedBox(height: 30),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                      onPressed: _abrirCamaraDirecta,
                      child: const Text('Abrir Cámara Nuevamente'),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
