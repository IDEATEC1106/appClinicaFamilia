import React, { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    const scannerId = 'reader-container';
    const html5QrCode = new Html5Qrcode(scannerId);
    let isScanning = true;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (isScanning) {
              isScanning = false;
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(() => {
                onScanSuccess(decodedText);
              });
            }
          },
          (errorMessage) => {
            // Ignora errores de escaneo continuo mientras busca el código
          }
        );
      } catch (err) {
        console.error('Error al iniciar la cámara:', err);
        alert('No se pudo acceder a la cámara. Por favor, asegúrese de otorgar los permisos necesarios en la configuración de su teléfono.');
        onCancel();
      }
    };

    startScanner();

    return () => {
      isScanning = false;
      html5QrCode.stop().catch(() => {});
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      {/* Botón superior para volver */}
      <div style={{ padding: '20px', zIndex: 10000 }}>
        <button 
          onClick={onCancel}
          style={{
            background: 'rgba(255,255,255,0.2)',
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

      {/* Contenedor donde se dibuja la cámara */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div id="reader-container" style={{ width: '100%', maxWidth: '400px' }}></div>
      </div>
    </div>
  );
}
