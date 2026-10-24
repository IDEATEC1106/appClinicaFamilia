import React, { useEffect, useState } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const [escaneando, setEscaneando] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const iniciarVisorReal = async () => {
      try {
        // 1. Comprobar permisos nativos de cámara
        const status = await BarcodeScanner.checkPermissions();
        let granted = status.camera === 'granted';

        if (!granted) {
          const req = await BarcodeScanner.requestPermissions();
          granted = req.camera === 'granted';
        }

        if (!granted) {
          alert('Se requieren permisos de cámara para el escaneo en vivo.');
          onCancel();
          return;
        }

        if (!isMounted) return;

        // 2. Hacer transparente el fondo de la app para ver el visor nativo de la cámara debajo
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
        setEscaneando(true);

        // 3. Registrar el detector de códigos en tiempo real (modo Yape)
        await BarcodeScanner.addListener('barcodeScanned', async event => {
          if (event.barcode && isMounted) {
            isMounted = false;
            await BarcodeScanner.stopScan();
            BarcodeScanner.removeAllListeners();
            document.body.style.background = '';
            document.documentElement.style.background = '';
            onScanSuccess(event.barcode.displayValue);
          }
        });

        // 4. Iniciar el escáner nativo en vivo de Google ML Kit
        await BarcodeScanner.startScan();

      } catch (error) {
        console.error('Error al iniciar el visor en vivo:', error);
        if (isMounted) {
          document.body.style.background = '';
          document.documentElement.style.background = '';
          onCancel();
        }
      }
    };

    iniciarVisorReal();

    return () => {
      isMounted = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999 }}>
      {/* Botón flotante para cerrar el visor en cualquier momento */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', pointerEvents: 'auto', zIndex: 100000 }}>
        <button 
          onClick={async () => {
            try {
              await BarcodeScanner.stopScan();
              BarcodeScanner.removeAllListeners();
            } catch (e) {}
            document.body.style.background = '';
            document.documentElement.style.background = '';
            onCancel();
          }}
          style={{ 
            background: 'rgba(0,0,0,0.7)', 
            color: '#fff', 
            border: '2px solid #fff', 
            padding: '10px 20px', 
            borderRadius: '20px', 
            fontSize: '15px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          ✕ Cancelar
        </button>
      </div>

      {escaneando && (
        <div style={{ position: 'absolute', bottom: '60px', width: '100%', textAlign: 'center', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontSize: '16px' }}>
          Enfoque el código QR dentro del recuadro
        </div>
      )}
    </div>
  );
}
