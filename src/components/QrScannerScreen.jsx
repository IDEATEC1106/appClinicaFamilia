import React from 'react';
import { registerPlugin } from '@capacitor/core';

// Registramos nuestro puente nativo personalizado
const QrScannerNativo = registerPlugin('QrScannerNativo');

export default function QrScannerScreen({ onScanSuccess, onCancel }) {

  const iniciarEscaneoNativo = async () => {
    try {
      const response = await QrScannerNativo.abrirVisor();
      if (response && response.resultado) {
        onScanSuccess(response.resultado);
      }
    } catch (error) {
      console.log("Escaneo cancelado o con error:", error);
      onCancel();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#0a0a0a', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      <div style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
        Escáner QR Nativo
      </div>
      <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '35px', textAlign: 'center', maxWidth: '320px', lineHeight: '1.4' }}>
        Presiona el botón para abrir el visor nativo en tiempo real.
      </p>

      <button 
        onClick={iniciarEscaneoNativo}
        style={{ background: '#007bff', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', width: '85%', maxWidth: '300px', boxShadow: '0 4px 12px rgba(0,123,255,0.4)' }}
      >
        📷 Abrir Visor
      </button>

      <button 
        onClick={onCancel}
        style={{ background: 'transparent', color: '#888', border: '1px solid #444', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '85%', maxWidth: '300px' }}
      >
        Regresar
      </button>
    </div>
  );
}
