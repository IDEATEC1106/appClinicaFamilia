import React, { useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    let isMounted = true;

    const startScan = async () => {
      try {
        // Solicitar permisos de cámara de manera nativa
        const status = await BarcodeScanner.requestPermissions();
        if (status.camera !== 'granted') {
          alert('Se requieren permisos de cámara para escanear el código QR.');
          onCancel();
          return;
        }

        // Hacer transparente el fondo web para ver la cámara
        document.body.style.background = 'transparent';
        const rootEl = document.getElementById('root');
        if (rootEl) rootEl.style.background = 'transparent';

        // Escuchar cuando se detecte un código QR
        const listener = await BarcodeScanner.addListener('barcodeScanned', async result => {
          if (result.barcode && isMounted) {
            await BarcodeScanner.stopScan();
            BarcodeScanner.removeAllListeners();
            onScanSuccess(result.barcode.displayValue);
          }
        });

        await BarcodeScanner.startScan();
      } catch (err) {
        console.error('Error al iniciar el escáner:', err);
        onCancel();
      }
    };

    startScan();

    return () => {
      isMounted = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
      document.body.style.background = '';
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.style.background = '';
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99999, background: 'transparent' }}>
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000 }}>
        <button 
          onClick={async () => {
            try {
              await BarcodeScanner.stopScan();
              BarcodeScanner.removeAllListeners();
            } catch (e) {}
            onCancel();
          }}
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
