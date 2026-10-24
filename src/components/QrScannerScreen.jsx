import React, { useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    let isMounted = true;

    const startScan = async () => {
      try {
        // Solicitar permisos de cámara nativos si aún no se han otorgado
        const status = await BarcodeScanner.requestPermissions();
        if (status.camera !== 'granted') {
          alert('Se requieren permisos de cámara para escanear el código QR.');
          onCancel();
          return;
        }

        // Ocultar el fondo web para permitir ver la cámara nativa a través del visor
        document.querySelector('body').style.background = 'transparent';
        document.getElementById('root').style.background = 'transparent';

        // Iniciar el escáner nativo
        const listener = await BarcodeScanner.addListener('barcodeScanned', async result => {
          if (result.barcode && isMounted) {
            await BarcodeScanner.stopScan();
            BarcodeScanner.removeAllListeners();
            onScanSuccess(result.barcode.displayValue);
          }
        });

        await BarcodeScanner.startScan();
      } catch (err) {
        console.error('Error al iniciar el escáner nativo:', err);
        onCancel();
      }
    };

    startScan();

    return () => {
      isMounted = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
      document.querySelector('body').style.background = '';
      document.getElementById('root').style.background = '';
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999, background: 'transparent' }}>
      {/* Botón flotante superior para cancelar y volver */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 1000 }}>
        <button 
          onClick={onCancel}
          style={{
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
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
