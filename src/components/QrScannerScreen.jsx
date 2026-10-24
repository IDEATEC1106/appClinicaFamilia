import React, { useEffect, useState } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const iniciarEscaner = async () => {
      try {
        // Verificar y solicitar permisos de forma segura
        const permissions = await BarcodeScanner.checkPermissions();
        let granted = permissions.camera === 'granted';

        if (!granted) {
          const req = await BarcodeScanner.requestPermissions();
          granted = req.camera === 'granted';
        }

        if (!granted) {
          if (isMounted) {
            alert('Debe permitir el acceso a la cámara en los ajustes de su dispositivo.');
            onCancel();
          }
          return;
        }

        // Listener para capturar el código QR escaneado en vivo
        BarcodeScanner.addListener('barcodeScanned', async event => {
          if (event.barcode && isMounted) {
            await BarcodeScanner.stopScan();
            BarcodeScanner.removeAllListeners();
            onScanSuccess(event.barcode.displayValue);
          }
        });

        // Iniciar el visor de escaneo nativo
        setCargando(false);
        await BarcodeScanner.startScan();

      } catch (error) {
        console.error('Error al iniciar el visor:', error);
        if (isMounted) {
          onCancel();
        }
      }
    };

    iniciarEscaner();

    return () => {
      isMounted = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Botón Volver */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000 }}>
        <button 
          onClick={async () => {
            try {
              await BarcodeScanner.stopScan();
              BarcodeScanner.removeAllListeners();
            } catch (e) {}
            onCancel();
          }}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ← Volver
        </button>
      </div>

      {cargando && (
        <div style={{ color: '#fff', fontSize: '16px', textAlign: 'center' }}>
          Iniciando visor de cámara...
        </div>
      )}
    </div>
  );
}
