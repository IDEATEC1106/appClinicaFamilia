import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  late final MobileScannerController _controller;
  bool _isProcessing = false;
  bool _isCameraActive = false;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
      autoStart: false,
    );
  }

  Future<void> _activarCamara() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      if (!mounted) return;
      _mostrarError("Se requiere conceder el permiso de la cámara para continuar.");
      return;
    }

    setState(() {
      _isCameraActive = true;
    });

    try {
      await _controller.start();
    } catch (e) {
      debugPrint("Error al iniciar la cámara: $e");
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _procesarQrDetectado(String qrCode) async {
    if (_isProcessing || qrCode.trim().isEmpty) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      await _controller.stop();
    } catch (_) {}

    if (qrCode.length < 10) {
      _mostrarError("El código QR escaneado no tiene un formato válido.");
      return;
    }

    final resultado = await ApiService.validarQr(qrCode.trim());

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
      _mostrarError(resultado.message);
    }
  }

  void _mostrarError(String mensaje) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("Aviso"),
        content: Text(mensaje),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _isProcessing = false;
                _isCameraActive = false;
              });
            },
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
        title: const Text('Escaneo de Código QR'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
        actions: [
          if (_isCameraActive)
            IconButton(
              icon: const Icon(Icons.flash_on),
              onPressed: () => _controller.toggleTorch(),
            ),
        ],
      ),
      body: _isProcessing
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 20),
                  Text(
                    "Validando código en el sistema...",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            )
          : !_isCameraActive
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.qr_code_scanner_rounded,
                          size: 110,
                          color: Colors.blueAccent,
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Presione el botón para activar el escáner de código QR en tiempo real:',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
                        ),
                        const SizedBox(height: 35),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ).wrap(
                            ElevatedButton(
                              onPressed: _activarCamara,
                              child: const Text('Iniciar Escáner', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : Stack(
                  fit: StackFit.expand,
                  children: [
                    MobileScanner(
                      controller: _controller,
                      onDetect: (capture) {
                        final List<Barcode> barcodes = capture.barcodes;
                        for (final barcode in barcodes) {
                          if (barcode.rawValue != null && barcode.rawValue!.isNotEmpty) {
                            _procesarQrDetectado(barcode.rawValue!);
                            break;
                        }
                      }
                    },
                  ),
                  Center(
                    child: Container(
                      width: 260,
                      height: 260,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.blueAccent, width: 3),
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 40,
                    left: 20,
                    right: 20,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Enfoque el Código QR dentro del recuadro',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white, fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
    );
  }
}
