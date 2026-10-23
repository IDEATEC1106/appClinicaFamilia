class ClinicaSessionModel {
  final bool success;
  final String message;
  final String razonSocial;
  final String ruc;
  final String nombrePadre;

  ClinicaSessionModel({
    required this.success,
    required this.message,
    required this.razonSocial,
    required this.ruc,
    required this.nombrePadre,
  });

  factory ClinicaSessionModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] ?? {};
    return ClinicaSessionModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      razonSocial: data['razon_social'] ?? 'Desconocida',
      ruc: data['ruc'] ?? '',
      nombrePadre: data['nombre_padre'] ?? 'Padre',
    );
  }
}
