import { useEffect, useRef } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const isScanning = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const iniciarEscaneoAutomatico = async () => {
      // Evita ejecuciones dobles si el componente se vuelve a renderizar
      if (isScanning.current) return;
      isScanning.current = true;

      try {
        // Abre el visor nativo de Google Play Services de forma instantánea
        const result = await BarcodeScanner.scan();

        if (isMounted && result.barcodes && result.barcodes.length > 0) {
          onScanSuccess(result.barcodes[0].rawValue);
        } else if (isMounted) {
          onCancel();
        }
      } catch (error) {
        console.error("Error en el visor nativo:", error);
        if (isMounted) {
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

  // Retorna null para no mostrar ninguna interfaz web innecesaria; la cámara toma el control absoluto.
  return null;
}
