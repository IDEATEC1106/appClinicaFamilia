import React from 'react';
import jsQR from 'jsqr';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code) {
          onScanSuccess(code.data);
        } else {
          alert('No se pudo leer el código QR. Intente nuevamente.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      {/* Botón Volver */}
      <div style={{ position: 'absolute', top: '40px', left: '20px' }}>
        <button 
          onClick={onCancel}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ← Volver
        </button>
      </div>

      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h2 style={{ marginBottom: '10px' }}>Escanear Código QR</h2>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '14px', maxWidth: '300px' }}>
          Presione el botón para abrir la cámara de su dispositivo y enfocar el código QR.
        </p>

        {/* Botón que abre la cámara nativa del celular */}
        <label style={{
          backgroundColor: '#007bff',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'inline-block',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          Abrir Cámara
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleCapture} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>
    </div>
  );
}
