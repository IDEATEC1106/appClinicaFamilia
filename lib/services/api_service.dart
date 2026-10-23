import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/clinica_session_model.dart';

class ApiService {
  // Ajusta la IP según tu entorno (10.0.2.2 para emulador Android, o la IP de tu red local)
  static const String baseUrl = 'http://192.168.15.253:5000/api';

  static Future<ClinicaSessionModel> validarQr(String codigoQr) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/validar-qr'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'codigo_qr': codigoQr}),
      );

      final jsonResponse = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return ClinicaSessionModel.fromJson(jsonResponse);
      } else {
        return ClinicaSessionModel(
          success: false,
          message: jsonResponse['message'] ?? 'Error desconocido en el servidor',
          razonSocial: '',
          ruc: '',
          nombrePadre: '',
        );
      }
    } catch (e) {
      return ClinicaSessionModel(
        success: false,
        message: 'No se pudo conectar al servidor: $e',
        razonSocial: '',
        ruc: '',
        nombrePadre: '',
      );
    }
  }
}
