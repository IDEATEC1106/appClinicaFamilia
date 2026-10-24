import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import './QrScannerScreen.css';

export default function QrScannerScreen({ onScanSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream = null;
    let animationFrameId;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Utiliza la cámara trasera automáticamente
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        setError('No se pudo acceder a la cámara del dispositivo.');
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const canvasContext = canvas.getContext('2d');
        
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        
        canvasContext.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          // ¡Código detectado! Se detiene la cámara y salta a la siguiente pantalla automáticamente
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          onScanSuccess(code.data);
          return;
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [onScanSuccess]);

  return (
    <div className="qr-scanner-container">
      <h3>Enfoque el Código QR</h3>
      {error && <p className="error-text">{error}</p>}
      <div className="video-wrapper">
        <video ref={videoRef} className="qr-video" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      <p className="hint-text">Validación automática en curso...</p>
    </div>
  );
}
