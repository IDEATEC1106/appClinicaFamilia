import 'package:flutter/material.dart';
import 'package:google_mlkit_barcode_scanning/google_mlkit_barcode_scanning.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _escanearQrDirecto();
    });
  }

  Future<void> _escanearQrDirecto() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      if (!mounted) return;
      _mostrarDialogoError("Se requiere el permiso de la cámara para escanear el código QR.");
      return;
    }

    try {
      // Abre la cámara integrada del sistema optimizada para lectura rápida
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 100,
      );

      if (photo == null) {
        return; // Si el usuario cancela, se mantiene en la vista actual
      }

      setState(() {
        _isProcessing = true;
      });

      // Procesamiento local instantáneo con Google ML Kit Barcode
      final inputImage = InputImage.fromFilePath(photo.path);
      final barcodeScanner = BarcodeScanner(formats: [BarcodeFormat.qrCode]);
      final List<Barcode> barcodes = await barcodeScanner.processImage(inputImage);
      await barcodeScanner.close();

      if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
        final String qrCode = barcodes.first.rawValue!;
        _procesarCodigoValidado(qrCode);
      } else {
        setState(() {
          _isProcessing = false;
        });
        _mostrarDialogoError("No se detectó ningún código QR válido. Intente enfocar nuevamente.");
      }
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      _mostrarDialogoError("Error al procesar la cámara: $e");
    }
  }

  void _procesarCodigoValidado(String qrCode) async {
    if (qrCode.length < 10) {
      setState(() {
        _isProcessing = false;
      });
      _mostrarDialogoError("El formato del código QR no es válido.");
      return;
    }

    // Validación automática contra tu API
    final resultado = await ApiService.validarQr(qrCode);

    if (!mounted) return;

    if (resultado.success) {
      // Salto automático a la siguiente pantalla sin pasos extra
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
      _mostrarDialogoError(resultado.message);
    }
  }

  void _mostrarDialogoError(String mensaje) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Aviso"),
        content: Text(mensaje),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _escanearQrDirecto(); // Vuelve a abrir el visor de inmediato
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
                      Icons.qr_code_scanner_rounded,
                      size: 110,
                      color: Colors.blueAccent,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Preparando visor de cámara para lectura automática...',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.black87),
                    ),
                    const SizedBox(height: 35),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.camera_alt_rounded),
                      label: const Text('Activar Cámara', style: TextStyle(fontSize: 16)),
                      onPressed: _escanearQrDirecto,
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
