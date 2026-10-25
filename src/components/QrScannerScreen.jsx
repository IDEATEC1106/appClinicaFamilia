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
        // 1. Abrir el visor nativo de la cámara
        const result = await BarcodeScanner.scan();

        if (!isMounted) return;

        if (result.barcodes && result.barcodes.length > 0) {
          const codigoQrLeido = result.barcodes[0].rawValue;

          // 2. Petición estándar compatible con el WebView de Android
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
        console.error("Error en la conexión:", error);
        if (isMounted) {
          alert("Error de conexión: " + error.message);
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
