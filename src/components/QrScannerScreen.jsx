import React from 'react';
import { registerPlugin } from '@capacitor/core';

const QrScannerNativo = registerPlugin('QrScannerNativo');

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  
  const iniciarEscaneoNativo = async () => {
    try {
      alert("Paso 1: Botón presionado, llamando al plugin nativo..."); // Alerta de prueba
      
      const response = await QrScannerNativo.abrirVisor();
      
      alert("Paso 2: Respuesta recibida del nativo"); // Alerta si funcionó
      
      if (response && response.resultado) {
        onScanSuccess(response.resultado);
      } else {
        onCancel();
      }
    } catch (error) {
      // Esto nos dirá exactamente el error real en la pantalla del celular
      alert("Error capturado: " + JSON.stringify(error));
      console.error("Error nativo detallado:", error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#fff', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      <div style={{ color: '#333', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
        Clínica Familia
      </div>
      <p style={{ color: '#666', fontSize: '15px', marginBottom: '40px', textAlign: 'center', maxWidth: '320px' }}>
        Escanee el código QR para iniciar sesión o validar acceso
      </p>

      <button 
        onClick={iniciarEscaneoNativo}
        style={{ background: '#007bff', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', width: '100%', maxWidth: '300px', boxShadow: '0 4px 12px rgba(0,123,255,0.4)' }}
      >
        Escanear QR
      </button>

      <button 
        onClick={onCancel}
        style={{ background: 'transparent', color: '#888', border: '1px solid #ddd', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '100%', maxWidth: '300px' }}
      >
        Cancelar
      </button>
    </div>
  );
}
