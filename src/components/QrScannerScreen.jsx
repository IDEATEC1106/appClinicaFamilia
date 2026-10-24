import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const qrRegionId = "reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        html5QrCode.stop().then(() => {
          onScanSuccess(decodedText);
        }).catch(() => {
          onScanSuccess(decodedText);
        });
      },
      (errorMessage) => {
        // Ignora errores de fotogramas vacíos mientras busca el QR
      }
    ).catch(err => {
      console.error("No se pudo iniciar la cámara en vivo:", err);
      alert("No se pudo acceder a la cámara. Verifique los permisos en su dispositivo.");
      onCancel();
    });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess, onCancel]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
      
      {/* Botón Volver flotante arriba */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000 }}>
        <button 
          onClick={async () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop().catch(() => {});
            }
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

      {/* Visor de la cámara en tiempo real */}
      <div id="reader" style={{ width: '100%', height: '100%', backgroundColor: '#000' }}></div>
    </div>
  );
}
