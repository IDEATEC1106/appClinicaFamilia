import { useEffect, useRef } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

// ⚠️ IMPORTANTE: Reemplaza esta IP por la dirección IP de tu servidor o PC donde corre Flask
const API_URL = 'http://38.224.68.171:5010/api/validar-qr';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const isScanning = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const iniciarEscaneoAutomatico = async () => {
      if (isScanning.current) return;
      isScanning.current = true;

      try {
        // 1. Abrir el visor nativo de la cámara automáticamente
        const result = await BarcodeScanner.scan();

        if (!isMounted) return;

        if (result.barcodes && result.barcodes.length > 0) {
          const codigoQrLeido = result.barcodes[0].rawValue;

          // 2. Enviar el código QR al API de Flask para validar reglas de negocio y SPs
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo_qr: codigoQrLeido }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            // 3. Validación exitosa: pasamos los datos obtenidos (razon_social, ruc, nombre_padre)
            onScanSuccess(data.data);
          } else {
            // 4. Error devuelto por el backend (Código caducado, no registrado, etc.)
            alert(data.message || 'Código QR no válido.');
            onCancel();
          }
        } else {
          onCancel();
        }
      } catch (error) {
        console.error("Error en el escáner o conexión:", error);
        if (isMounted) {
          alert("No se pudo conectar con el servidor de validación.");
          onCancel();
        }
      } finally {
        isScanning.current = false;
      }
    };

    iniciarEscaneoAutomatico();

    return () => {
      isMounted = false;
    };
  }, [onScanSuccess, onCancel]);

  // Retorna null ya que la interfaz visual es el visor nativo de Google Play Services
  return null;
}
