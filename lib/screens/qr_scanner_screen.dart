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
  bool _mostrarVisor = false;
  bool _isScanned = false;
  late final MobileScannerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
      autoStart: false, // Vital para evitar el arranque en frío y la pantalla negra
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _iniciarEscaneo() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      if (!mounted) return;
      _showErrorDialog("Se requiere el permiso de la cámara para escanear el QR.");
      return;
    }

    setState(() {
      _mostrarVisor = true;
    });

    // Espera un instante a que el widget de video esté completamente montado en el árbol de UI
    await Future.delayed(const Duration(milliseconds: 350));
    try {
      await _controller.start();
    } catch (e) {
      debugPrint("Error al iniciar la cámara: $e");
    }
  }

  void _processQRCode(String qrCode) async {
    if (_isScanned) return;
    setState(() {
      _isScanned = true;
    });

    await _controller.stop();

    if (qrCode.length < 10) {
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
              setState(() {
                _isScanned = false;
                _mostrarVisor = false;
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
        actions: _mostrarVisor
            ? [
                IconButton(
                  icon: const Icon(Icons.flash_on),
                  onPressed: () => _controller.toggleTorch(),
                ),
                IconButton(
                  icon: const Icon(Icons.flip_camera_ios),
                  onPressed: () => _controller.switchCamera(),
                ),
              ]
            : null,
      ),
      body: _mostrarVisor
          ? Column(
              children: [
                Expanded(
                  child: Stack(
                    children: [
                      MobileScanner(
                        controller: _controller,
                        onDetect: (capture) {
                          final List<Barcode> barcodes = capture.barcodes;
                          for (final barcode in barcodes) {
                            if (barcode.rawValue != null && barcode.rawValue!.isNotEmpty) {
                              _processQRCode(barcode.rawValue!);
                              break;
                            }
                          }
                        },
                      ),
                      Center(
                        child: Container(
                          width: 250,
                          height: 250,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.blueAccent, width: 3),
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 16.0),
                  color: Colors.black87,
                  child: const Text(
                    'Enfoque el Código QR dentro del recuadro',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            )
          : Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.qr_code_scanner_rounded,
                      size: 120,
                      color: Colors.blueAccent,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Presione el botón para abrir el visor integrado y escanear el código QR automáticamente en tiempo real:',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
                    ),
                    const SizedBox(height: 40),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(Icons.camera_alt_rounded, size: 24),
                        label: const Text('Escanear Código QR'),
                        onPressed: _iniciarEscaneo,
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
