import React, { useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {

  useEffect(() => {
    let isMounted = true;

    const abrirEscanerNativo = async () => {
      try {
        // Solicitar permisos nativos si aún no se tienen
        const permissions = await BarcodeScanner.checkPermissions();
        if (permissions.camera !== 'granted') {
          const req = await BarcodeScanner.requestPermissions();
          if (req.camera !== 'granted') {
            alert('Se requiere acceso a la cámara para escanear el código QR.');
            onCancel();
            return;
          }
        }

        // Abrir directamente el visor nativo de Google Play Services en pantalla completa
        // (Funciona exactamente igual que Yape/Plin, sin pantallas negras ni divs web)
        const result = await BarcodeScanner.scan();

        if (result.barcodes && result.barcodes.length > 0 && isMounted) {
          const codigoLeido = result.barcodes[0].displayValue;
          onScanSuccess(codigoLeido);
        } else if (isMounted) {
          onCancel();
        }
      } catch (error) {
        console.error('Error al abrir el escáner nativo:', error);
        if (isMounted) {
          onCancel();
        }
      }
    };

    abrirEscanerNativo();

    return () => {
      isMounted = false;
      BarcodeScanner.stopScan().catch(() => {});
    };
  }, [onScanSuccess, onCancel]);

  return null; // No requiere interfaz web, el visor nativo se encarga de todo en pantalla completa.
