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
        // 0. Verificar o solicitar permisos de cámara obligatorios
        const permission = await BarcodeScanner.checkPermissions();
        if (permission.camera !== 'granted') {
          const reqPermission = await BarcodeScanner.requestPermissions();
          if (reqPermission.camera !== 'granted') {
            alert("Se necesitan permisos de cámara para escanear el QR.");
            onCancel();
            return;
          }
        }

        // 1. Abrir el visor nativo de la cámara automáticamente
        const result = await BarcodeScanner.scan();

        if (!isMounted) return;

        if (result.barcodes && result.barcodes.length > 0) {
          const codigoQrLeido = result.barcodes[0].rawValue;

          // 2. Enviar el código QR al API de Flask
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
        console.error("Error detallado:", error);
        if (isMounted) {
          // AQUÍ MOSTRAMOS EL ERROR REAL PARA SABER QUÉ FALLÓ
          alert("Error técnico: " + (error.message || JSON.stringify(error)));
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
