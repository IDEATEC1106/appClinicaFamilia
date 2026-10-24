import 'package:flutter/material.dart';
import 'package:flutter_zxing/flutter_zxing.dart';
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
  bool _isProcessing = false;

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
  }

  void _onDetect(Code result) async {
    if (_isProcessing) return;
    if (result.text != null && result.text!.isNotEmpty) {
      final qrCode = result.text!;
      
      setState(() {
        _isProcessing = true;
      });

      _validarCodigoEnApi(qrCode);
    }
  }

  void _validarCodigoEnApi(String qrCode) async {
    if (qrCode.length < 10) {
      setState(() {
        _isProcessing = false;
        _mostrarVisor = false;
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
        _mostrarVisor = false;
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
            child: const Text("Entendido"),
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
      body: _mostrarVisor
          ? Stack(
              children: [
                ReaderWidget(
                  onScan: _onDetect,
                  scanDelay: const Duration(milliseconds: 500),
                ),
                if (_isProcessing)
                  Container(
                    color: Colors.black54,
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 16),
                          Text(
                            "Validando código QR...",
                            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
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
