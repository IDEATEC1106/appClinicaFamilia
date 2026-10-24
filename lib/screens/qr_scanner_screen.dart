import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
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
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _inicializarCamaraYWeb();
  }

  Future<void> _inicializarCamaraYWeb() async {
    final status = await Permission.camera.request();
    
    if (!status.isGranted) {
      if (!mounted) return;
      _mostrarDialogoPermiso();
      return;
    }

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..addJavaScriptChannel(
        'QRBridge',
        onMessageReceived: (JavaScriptMessage message) {
          _procesarCodigoLeido(message.message);
        },
      )
      ..loadHtmlString(_htmlScannerContent);

    // Habilitar permisos de medios nativos para Android WebView
    if (_webViewController.platform is AndroidWebViewController) {
      final androidController = _webViewController.platform as AndroidWebViewController;
      androidController.setMediaPlaybackRequiresUserGesture(false);
    }

    if (mounted) {
      setState(() {
        _isInitialized = true;
      });
    }
  }

  void _mostrarDialogoPermiso() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("Permiso Requerido"),
        content: const Text("Se necesita acceso a la cámara para escanear el código QR automáticamente."),
        actions: [
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await _inicializarCamaraYWeb();
            },
            child: const Text("Reintentar"),
          ),
        ],
      ),
    );
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

  final String _htmlScannerContent = '''
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://unpkg.com/html5-qrcode"></script>
        <style>
            body { margin: 0; background-color: #000; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; font-family: sans-serif; }
            #reader { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
            #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
            .overlay { position: absolute; bottom: 50px; background: rgba(0,0,0,0.75); padding: 12px 24px; border-radius: 8px; font-size: 15px; text-align: center; z-index: 999; border: 1px solid rgba(255,255,255,0.2); }
        </style>
    </head>
    <body>
        <div id="reader"></div>
        <div class="overlay" id="status">Enfoque el Código QR dentro del recuadro</div>
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
                { fps: 20, qrbox: { width: 260, height: 260 } },
                onScanSuccess
            ).catch(err => {
                document.getElementById('status').innerText = "Error al iniciar visor: " + err;
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
          : !_isInitialized
              ? const Center(
                  child: CircularProgressIndicator(),
                )
              : WebViewWidget(controller: _webViewController),
    );
  }
}
