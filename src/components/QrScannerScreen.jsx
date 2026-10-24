import React, { useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    let isMounted = true;

    const startNativeScan = async () => {
      try {
        // Solicitar permiso nativo directamente a Android
        const status = await BarcodeScanner.checkPermission({ force: true });
        
        if (!status.granted) {
          alert('Se requiere permiso de la cámara para escanear el código QR.');
          onCancel();
          return;
        }

        // Ocultar el fondo web para que se vea la cámara nativa detrás
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
        const rootElement = document.getElementById('root');
        if (rootElement) rootElement.style.background = 'transparent';

        await BarcodeScanner.hideBackground(); // Oculta la vista web
        
        // Iniciar el escaneo nativo en tiempo real
        const result = await BarcodeScanner.startScan();
        
        if (result.hasContent && isMounted) {
          await BarcodeScanner.showBackground();
          onScanSuccess(result.content);
        }
      } catch (err) {
        console.error('Error en escáner nativo:', err);
        await BarcodeScanner.showBackground().catch(() => {});
        onCancel();
      }
    };

    startNativeScan();

    return () => {
      isMounted = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.showBackground().catch(() => {});
      document.body.style.background = '';
      document.documentElement.style.background = '';
      const rootElement = document.getElementById('root');
      if (rootElement) rootElement.style.background = '';
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
              await BarcodeScanner.showBackground();
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
