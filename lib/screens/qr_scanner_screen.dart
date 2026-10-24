_isProcessing = true;
    });

    if (qrCode.length < 10) {
      setState(() {
        _isProcessing = false;
        _controller.clear();
      });
      _showErrorDialog("El código QR ingresado no tiene un formato válido.");
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
      setState(() {
        _isProcessing = false;
        _controller.clear();
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
              FocusScope.of(context).requestFocus(_focusNode);
            },
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
        title: const Text('Validación de Código QR'),
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
                      size: 120,
                      color: Colors.blueAccent,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Escanee o ingrese el código QR de acceso:',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
                    ),
                    const SizedBox(height: 30),
                    TextField(
                      controller: _controller,
                      focusNode: _focusNode,
                      autofocus: true,
                      decoration: InputDecoration(
                        labelText: 'Código QR',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        prefixIcon: const Icon(Icons.qr_code),
                      ),
                      onSubmitted: _procesarCodigo,
                    ),
                    const SizedBox(height: 20),
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
                          onPressed: () => _procesarCodigo(_controller.text),
                          child: const Text('Validar Código', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
