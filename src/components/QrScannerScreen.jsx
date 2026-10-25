import { useEffect, useRef } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

const API_URL = 'http://38.224.68.171:5010/api/validar-qr';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const isScanning = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const iniciarEscaneoAutomatico = async () => {
      if (isScanning.current) return;
      isScanning.current = true;

      try {
        // Abrir el visor nativo directamente (el plugin maneja los permisos automáticamente)
        const result = await BarcodeScanner.scan();

        if (!isMounted) return;

        if (result.barcodes && result.barcodes.length > 0) {
          const codigoQrLeido = result.barcodes[0].rawValue;

          // Enviar el código QR al API de Flask
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo_qr: codigoQrLeido }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            onScanSuccess(data.data);
          } else {
            alert(data.message || 'Código QR no válido.');
            onCancel();
          }
        } else {
          onCancel();
        }
      } catch (error) {
        console.error("Error en el escáner:", error);
        if (isMounted) {
          // Si ocurre un error real, lo veremos aquí en pantalla
          alert("Error al escanear: " + (error.message || JSON.stringify(error)));
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

  return null;
}
