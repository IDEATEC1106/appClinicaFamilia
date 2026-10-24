import React from 'react';
import jsQR from 'jsqr';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {

  // Función que procesa la foto tomada por la cámara del teléfono
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          onScanSuccess(code.data);
        } else {
          alert('No se detectó ningún código QR válido en la imagen. Intente nuevamente.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: '#000', color: '#fff', height: '100vh' }}>
      <div style={{ position: 'absolute', top: '40px', left: '20px' }}>
        <button 
          onClick={onCancel}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ← Volver
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>Escanear Código QR</h2>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '14px' }}>
          Presione el botón para abrir la cámara de su dispositivo, capture el código QR y el sistema lo validará de inmediato.
        </p>

        {/* Input nativo que abre la cámara del celular directamente */}
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
          Abrir Cámara / Capturar QR
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>
    </div>
  );
}
