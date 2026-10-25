import React, { useEffect, useState } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const [iniciado, setIniciado] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const iniciarEscanerNativo = async () => {
      try {
        // 1. Solicitar formalmente permisos de cámara al sistema Android
        const permissionStatus = await BarcodeScanner.checkPermissions();
        let granted = permissionStatus.camera === 'granted';

        if (!granted) {
          const req = await BarcodeScanner.requestPermissions();
          granted = req.camera === 'granted';
        }

        if (!granted) {
          alert('Se requiere habilitar el permiso de la cámara para el escaneo en vivo.');
          onCancel();
          return;
        }

        if (!isMounted) return;

        // 2. Hacer transparente el fondo para que el visor nativo de la cámara se proyecte correctamente
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
        setIniciado(true);

        // 3. Escuchar la lectura del código QR en tiempo real
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

        // 4. Iniciar el motor de escaneo nativo
        await BarcodeScanner.startScan();

      } catch (error) {
        console.error('Error en el escáner nativo:', error);
        if (isMounted) {
          document.body.style.background = '';
          document.documentElement.style.background = '';
          onCancel();
        }
      }
    };

    iniciarEscanerNativo();

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
      
      {/* Botón flotante para cancelar y regresar */}
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
            background: 'rgba(0,0,0,0.8)', 
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

      {iniciado && (
        <div style={{ position: 'absolute', bottom: '60px', width: '100%', textAlign: 'center', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontSize: '16px', pointerEvents: 'none' }}>
          Enfoque el código QR dentro del recuadro
        </div>
      )}
    </div>
  );
}
