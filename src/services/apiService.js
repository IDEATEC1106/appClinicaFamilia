const API_URL = "38.224.68.171:5010"; // Ej: http://192.168.15.253:5000/api

export const ApiService = {
  async validarQr(qrCode) {
    try {
      const response = await fetch(`${API_URL}/validar-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qr: qrCode }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          razonSocial: data.razonSocial,
          ruc: data.ruc,
          nombrePadre: data.nombrePadre,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Código no reconocido en el sistema.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor backend.',
      };
    }
  }
};
