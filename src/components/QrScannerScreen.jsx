import React, { useEffect, useState } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const [permisoConcedido, setPermisoConcedido] = useState(false);

  // Solicitar permisos explícitamente mediante un botón de activación para evitar bloqueos del sistema
  const solicitarPermisoYEscanear = async () => {
    try {
      const status = await BarcodeScanner.requestPermissions();
      if (status.camera === 'granted' || status.camera === 'limited') {
        setPermisoConcedido(true);
      } else {
        alert('Se requiere conceder acceso a la cámara para escanear el código QR.');
      }
    } catch (e) {
      console.error('Error al pedir permisos:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const iniciarEscaneo = async () => {
      if (!permisoConcedido) return;

      try {
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';

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

        await BarcodeScanner.startScan();
      } catch (error) {
        console.error('Error al iniciar el escáner:', error);
        if (isMounted) {
          document.body.style.background = '';
          document.documentElement.style.background = '';
          onCancel();
        }
      }
    };

    iniciarEscaneo();

    return () => {
      isMounted = false;
      BarcodeScanner.stopScan().catch(() => {});
      BarcodeScanner.removeAllListeners().catch(() => {});
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, [permisoConcedido, onScanSuccess, onCancel]);

  if (!permisoConcedido) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>
          Autorización de Cámara
        </div>
        <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '30px' }}>
          Para activar el visor en tiempo real y leer códigos QR, necesitamos tu autorización de acceso a la cámara.
        </p>
        <button 
          onClick={solicitarPermisoYEscanear}
          style={{ background: '#28a745', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', width: '80%' }}
        >
          Permitir Cámara y Escanear
        </button>
        <button 
          onClick={onCancel}
          style={{ background: 'transparent', color: '#aaa', border: '1px solid #555', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: '80%' }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999 }}>
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
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: '2px solid #fff', padding: '10px 20px', borderRadius: '20px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ✕ Cancelar
        </button>
      </div>
    </div>
  );
}
