import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  late final WebViewController _webViewController;
  bool _isProcessing = false;
  bool _hasPermission = false;

  @override
  void initState() {
    super.initState();
    _verificarPermisosYConfigurar();
  }

  Future<void> _verificarPermisosYConfigurar() async {
    final status = await Permission.camera.request();
    setState(() {
      _hasPermission = status.isGranted;
    });

    if (!_hasPermission) return;

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'QRBridge',
        onMessageReceived: (JavaScriptMessage message) {
          _procesarCodigoLeido(message.message);
        },
      )
      ..loadHtmlString(_htmlScannerContent);
  }

  void _procesarCodigoLeido(String qrCode) async {
    if (_isProcessing || qrCode.trim().isEmpty) return;

    setState(() {
      _isProcessing = true;
    });

    if (qrCode.length < 10) {
      _showErrorDialog("El código QR no tiene un formato válido.");
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
                _isProcessing = false;
              });
            },
            child: const Text("Reintentar"),
          ),
        ],
      ),
    );
  }

  // HTML optimizado con html5-qrcode para lectura en tiempo real automática
  final String _htmlScannerContent = '''
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/html5-qrcode"></script>
        <style>
            body { margin: 0; background-color: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; font-family: sans-serif; }
            #reader { width: 100%; max-width: 400px; }
            .msg { margin-top: 20px; font-size: 16px; text-align: center; padding: 0 20px; }
        </style>
    </head>
    <body>
        <div id="reader"></div>
        <div class="msg" id="status">Enfoque el Código QR dentro del recuadro</div>
        <script>
            function onScanSuccess(decodedText, decodedResult) {
                document.getElementById('status').innerText = "¡Código detectado! Validando...";
                html5QrCode.stop().then(() => {
                    QRBridge.postMessage(decodedText);
                }).catch(err => {
                    QRBridge.postMessage(decodedText);
                });
            }

            const html5QrCode = new Html5Qrcode("reader");
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess
            ).catch(err => {
                document.getElementById('status').innerText = "Error al iniciar la cámara. Verifique permisos.";
            });
        </script>
    </body>
    </html>
  ''';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escaneo de Código QR'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: !_hasPermission
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.camera_alt, size: 80, color: Colors.grey),
                    const SizedBox(height: 16),
                    const Text(
                      "Se requiere conceder acceso a la cámara para escanear el código QR.",
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                      ),
                      onPressed: _verificarPermisosYConfigurar,
                      child: const Text("Conceder Permiso"),
                    ),
                  ],
                ),
              ),
            )
          : _isProcessing
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
              : WebViewWidget(controller: _webViewController),
    );
  }
}
