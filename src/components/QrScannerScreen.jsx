import React, { useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    let isScanningActive = true;

    const iniciarEscaneoReal = async () => {
      try {
        // 1. Solicitar permisos de cámara nativos del sistema
        const permission = await BarcodeScanner.requestPermissions();
        if (permission.camera !== 'granted') {
          alert('Se necesita permiso de la cámara para escanear el código QR.');
          onCancel();
          return;
        }

        // 2. Ocultar los elementos web de React para permitir ver la cámara nativa debajo
        document.querySelector('body').style.background = 'transparent';
        const rootEl = document.getElementById('root');
        if (rootEl) rootEl.style.background = 'transparent';

        // 3. Escuchar la lectura automática del código en tiempo real
        BarcodeScanner.addListener('barcodeScanned', async event => {
          if (event.barcode && isScanningActive) {
            isScanningActive = false;
            await BarcodeScanner.stopScan();
            BarcodeScanner.removeAllListeners();
            onScanSuccess(event.barcode.displayValue);
          }
        });

        // 4. Iniciar el motor de escaneo nativo de Google MLKit
        await BarcodeScanner.startScan();

      } catch (error) {
        console.error('Error al iniciar el escáner nativo:', error);
        onCancel();
      }
    };

    iniciarEscaneoReal();

    return () => {
      isScanningActive = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
      document.querySelector('body').style.background = '';
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.style.background = '';
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99999, pointerEvents: 'none' }}>
      {/* Botón flotante superior para cancelar y volver */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000, pointerEvents: 'auto' }}>
        <button 
          onClick={async () => {
            try {
              await BarcodeScanner.stopScan();
              BarcodeScanner.removeAllListeners();
            } catch (e) {}
            onCancel();
          }}
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
