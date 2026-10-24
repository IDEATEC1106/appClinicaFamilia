import React, { useRef } from 'react';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  const fileInputRef = useRef(null);

  // Esta función abre directamente la cámara nativa del celular para tomar foto o escanear
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        // Pasa el resultado de la imagen capturada para procesarla
        onScanSuccess(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      onCancel();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Botón Volver */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 100000 }}>
        <button 
          onClick={onCancel}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ← Volver
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: '#fff', fontSize: '18px', marginBottom: '20px' }}>
          Pulsa el botón para abrir la cámara y capturar el código:
        </p>

        {/* Input nativo de tipo file con captura de cámara directa */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          onChange={handleCapture}
          style={{ display: 'none' }} 
          id="cameraInput"
        />

        <label 
          htmlFor="cameraInput" 
          style={{ 
            backgroundColor: '#007bff', 
            color: '#fff', 
            padding: '16px 32px', 
            borderRadius: '12px', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            display: 'inline-block',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}
        >
          Abrir Cámara / Escanear
        </label>
      </div>

    </div>
  );
}
