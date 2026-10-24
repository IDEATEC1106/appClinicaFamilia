import React, { useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    let active = true;

    const startScan = async () => {
      try {
        // Solicitar permisos nativos
        const permissions = await BarcodeScanner.requestPermissions();
        if (permissions.camera !== 'granted') {
          alert('Se requiere permiso de la cámara.');
          onCancel();
          return;
        }

        // Ocultar elementos web para dejar ver la cámara nativa de fondo
        document.querySelector('body').style.background = 'transparent';
        
        // Escuchar el evento de escaneo nativo
        BarcodeScanner.addListener('barcodeScanned', async event => {
          if (event.barcode && active) {
            active = false;
            await BarcodeScanner.stopScan();
            BarcodeScanner.removeAllListeners();
            onScanSuccess(event.barcode.displayValue);
          }
        });

        // Iniciar el visor nativo de Google MLKit
        await BarcodeScanner.startScan();
      } catch (e) {
        console.error(e);
        onCancel();
      }
    };

    startScan();

    return () => {
      active = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
      document.querySelector('body').style.background = '';
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
          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
