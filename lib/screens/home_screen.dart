import 'package:flutter/material.dart';
import 'qr_scanner_screen.dart';

class HomeScreen extends StatelessWidget {
  final String razonSocial;
  final String ruc;
  final String nombrePadre;

  const HomeScreen({
    super.key,
    required this.razonSocial,
    required this.ruc,
    required this.nombrePadre,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel Principal - Neonato'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            tooltip: 'Salir / Cerrar Sesión',
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const QrScannerScreen()),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Cabecera: Datos de la Clínica y Logo SPT
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    // Logo de la clínica
                    Image.asset(
                      'LogoSPT.png',
                      width: 60,
                      height: 60,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return const Icon(Icons.local_hospital, size: 50, color: Colors.blue);
                      },
                    ),
                    const SizedBox(width: 16),
                    // Razón social y RUC
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            razonSocial,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blue),
                          ),
                          const SizedBox(height: 5),
                          Text('RUC: $ruc', style: const TextStyle(fontSize: 14, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Bienvenida
            Text(
              '¡Bienvenido, $nombrePadre!',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const Text(
              'Seleccione una opción del menú:',
              style: TextStyle(fontSize: 14, color: Colors.black54),
            ),
            const SizedBox(height: 30),

            // Opciones de menú
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.blue.shade50,
                foregroundColor: Colors.blue.shade800,
                elevation: 0,
              ),
              icon: const Icon(Icons.medical_services_outlined),
              label: const Text('1. Historia Clínica', style: TextStyle(fontSize: 16)),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Módulo Historia Clínica: Próximamente')),
                );
              },
            ),
            const SizedBox(height: 15),

            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.blue.shade50,
                foregroundColor: Colors.blue.shade800,
                elevation: 0,
              ),
              icon: const Icon(Icons.info_outline),
              label: const Text('2. Visualización de Información', style: TextStyle(fontSize: 16)),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Módulo Visualización: Próximamente')),
                );
              },
            ),
            const Spacer(),

            // Botón Salir
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
              ),
              icon: const Icon(Icons.logout),
              label: const Text('Salir del Aplicativo', style: TextStyle(fontSize: 16)),
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const QrScannerScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
