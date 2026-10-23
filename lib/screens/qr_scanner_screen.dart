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

class _QrScannerScreenState extends State<QrScannerScreen> with WidgetsBindingObserver {
  bool _isScanned = false;
  bool _hasPermission = false;
  late final MobileScannerController _controller;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
    );
    _checkPermissionAndStart();
  }

  Future<void> _checkPermissionAndStart() async {
    final status = await Permission.camera.request();
    setState(() {
      _hasPermission = status.isGranted;
    });
    if (_hasPermission && mounted) {
      try {
        await _controller.start();
      } catch (e) {
        debugPrint("Error al iniciar la cámara: $e");
      }
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (!_controller.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.resumed) {
      if (_hasPermission) {
        _controller.start();
      }
    } else if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller.dispose();
    super.dispose();
  }

  void _processQRCode(String qrCode) async {
    if (_isScanned) return;
    setState(() {
      _isScanned = true;
    });

    if (qrCode.length < 10) {
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
      _showErrorDialog(resultado.message);
    }
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
              _controller.start();
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
      body: Column(
        children: [
          Expanded(
            child: _hasPermission
                ? MobileScanner(
                    controller: _controller,
                    onDetect: (capture) {
                      final List<Barcode> barcodes = capture.barcodes;
                      for (final barcode in barcodes) {
                        if (barcode.rawValue != null) {
                          _processQRCode(barcode.rawValue!);
                          break;
                        }
                      }
                    },
                  )
                : Center(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                      ),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Conceder Permiso de Cámara'),
                      onPressed: _checkPermissionAndStart,
                    ),
                  ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 16.0),
            color: Colors.black87,
            child: const Text(
              'Escanear su Código QR proporcionado por la Clínica',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
