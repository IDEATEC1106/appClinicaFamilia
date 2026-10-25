import React, { useEffect, useRef, useState } from 'react';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const videoRef = useRef(null);
  const [iniciarStream, setIniciarStream] = useState(false);
  const [errorPermiso, setErrorPermiso] = useState(false);

  useEffect(() => {
    if (!iniciarStream) return;

    let streamActive = null;
    let isMounted = true;

    const abrirCamara = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamActive = stream;

        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Error de permisos en cámara:', err);
        if (isMounted) setErrorPermiso(true);
      }
    };

    abrirCamara();

    return () => {
      isMounted = false;
      if (streamActive) {
        streamActive.getTracks().forEach(track => track.stop());
      }
    };
  }, [iniciarStream]);

  if (!iniciarStream) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>
          Activar Escáner QR
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '30px' }}>
          Presiona el botón para conceder acceso a la cámara y abrir el visor en tiempo real.
        </p>
        <button 
          onClick={() => setIniciarStream(true)}
          style={{ background: '#007bff', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', width: '80%' }}
        >
          Iniciar Cámara
        </button>
        <button 
          onClick={onCancel}
          style={{ background: 'transparent', color: '#888', border: '1px solid #444', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: '80%' }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      
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
          <p style={{ fontSize: '18px', marginBottom: '15px' }}>Permiso de cámara denegado.</p>
          <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '20px' }}>Por favor, habilita el permiso manualmente en los Ajustes de aplicaciones de tu teléfono.</p>
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
          <div style={{ position: 'absolute', border: '2px solid #00ff00', width: '250px', height: '250px', borderRadius: '12px', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)', pointerEvents: 'none' }}>
          </div>
          <div style={{ position: 'absolute', bottom: '80px', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '8px', pointerEvents: 'none' }}>
            Enfoque el código QR dentro del recuadro
          </div>
        </div>
      )}
    </div>
  );
}
