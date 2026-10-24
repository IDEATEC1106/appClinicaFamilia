import React, { useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    let activo = true;

    const iniciarEscaner = async () => {
      try {
        // Solicita el permiso nativo del sistema Android
        const status = await BarcodeScanner.requestPermissions();
        if (status.camera !== 'granted') {
          alert('Se necesita permiso de la cámara para escanear.');
          onCancel();
          return;
        }

        // Hace transparente la interfaz web para mostrar la cámara nativa debajo
        document.body.style.background = 'transparent';
        const root = document.getElementById('root');
        if (root) root.style.background = 'transparent';

        // Escucha la lectura automática del código QR
        BarcodeScanner.addListener('barcodeScanned', async event => {
          if (event.barcode && activo) {
            activo = false;
            await BarcodeScanner.stopScan();
            BarcodeScanner.removeAllListeners();
            onScanSuccess(event.barcode.displayValue);
          }
        });

        // Abre el visor nativo en tiempo real
        await BarcodeScanner.startScan();

      } catch (e) {
        console.error('Error al iniciar el escáner:', e);
        onCancel();
      }
    };

    iniciarEscaner();

    return () => {
      activo = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
      document.body.style.background = '';
      const root = document.getElementById('root');
      if (root) root.style.background = '';
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99999, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000, pointerEvents: 'auto' }}>
        <button 
          onClick={async () => {
            try {
              await BarcodeScanner.stopScan();
              BarcodeScanner.removeAllListeners();
            } catch (err) {}
            onCancel();
          }}
          style={{
            background: 'rgba(0,0,0,0.8)',
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
