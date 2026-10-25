import { useEffect, useRef } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { CapacitorHttp } from '@capacitor/core';

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

          // 2. Petición HTTP nativa (evita bloqueos de CORS y WebView)
          const response = await CapacitorHttp.post({
            url: API_URL,
            headers: {
              'Content-Type': 'application/json',
            },
            data: { codigo_qr: codigoQrLeido },
          });

          const data = response.data;

          if (response.status >= 200 && response.status < 300 && data.success) {
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
          alert("Error de conexión nativa: " + (error.message || JSON.stringify(error)));
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
