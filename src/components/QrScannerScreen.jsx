import React, { useEffect, useRef } from 'react';
import jsQR from 'jsqr';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let isScanning = true;

    const iniciarCamaraEnVivo = async () => {
      try {
        // Esto invoca directamente el permiso nativo del sistema operativo Android
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
          
          // Bucle de lectura de fotogramas en tiempo real (Estilo Yape)
          const escanearFotograma = () => {
            if (!isScanning) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imgData.data, imgData.width, imgData.height);

              if (code) {
                isScanning = false;
                detenerCamara();
                onScanSuccess(code.data);
                return;
              }
            }
            animationFrameId = requestAnimationFrame(escanearFotograma);
          };

          animationFrameId = requestAnimationFrame(escanearFotograma);
        }
      } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        alert('Debe permitir el acceso a la cámara en los ajustes de su dispositivo.');
        onCancel();
      }
    };

    iniciarCamaraEnVivo();

    return () => {
      isScanning = false;
      cancelAnimationFrame(animationFrameId);
      detenerCamara();
    };
  }, [onScanSuccess, onCancel]);

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
      
      {/* Botón superior Volver */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000 }}>
        <button 
          onClick={() => {
            detenerCamara();
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
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <video 
          ref={videoRef} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Guía visual de escaneo */}
      <div style={{ position: 'absolute', bottom: '60px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
        Enfoque el código QR dentro del recuadro
      </div>
    </div>
  );
}
