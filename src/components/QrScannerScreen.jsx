import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '@capacitor/camera';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const videoRef = useRef(null);
  const [errorPermiso, setErrorPermiso] = useState(false);

  useEffect(() => {
    let streamActive = null;
    let isMounted = true;

    const iniciarVisorConPermisos = async () => {
      try {
        // 1. Solicitar formalmente el permiso nativo al sistema operativo primero
        const permStatus = await Camera.requestPermissions({ permissions: ['camera'] });
        
        if (permStatus.camera !== 'granted' && permStatus.camera !== 'limited') {
          if (isMounted) setErrorPermiso(true);
          return;
        }

        if (!isMounted) return;

        // 2. Una vez concedido por el sistema, abrir el flujo de video de la cámara trasera
        streamActive = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = streamActive;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Error al iniciar la cámara tras permisos:', err);
        if (isMounted) {
          setErrorPermiso(true);
        }
      }
    };

    iniciarVisorConPermisos();

    return () => {
      isMounted = false;
      if (streamActive) {
        streamActive.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Botón Cancelar */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000 }}>
        <button 
          onClick={onCancel}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ✕ Cancelar
        </button>
      </div>

      {errorPermiso ? (
        <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '18px', marginBottom: '15px' }}>No se pudo acceder a la cámara.</p>
          <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '20px' }}>Por favor, otorga el permiso de cámara cuando la app lo solicite o actívalo en los Ajustes de tu teléfono.</p>
          <button onClick={onCancel} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '16px' }}>
            Regresar
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <video 
            ref={videoRef} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ position: 'absolute', border: '2px solid #00ff00', width: '250px', height: '250px', borderRadius: '12px', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' }}>
          </div>
          <div style={{ position: 'absolute', bottom: '80px', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '8px' }}>
            Enfoque el código QR dentro del recuadro
          </div>
        </div>
      )}
    </div>
  );
}
