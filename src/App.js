import React, { useState } from 'react';
import QrScannerScreen from './components/QrScannerScreen';

export default function App() {
  const [pantalla, setPantalla] = useState('inicio'); // 'inicio' | 'escaner' | 'menu'
  const [datosQR, setDatosQR] = useState(null);

  // Validación automática al detectar el código QR
  const handleScanSuccess = (codigoLeido) => {
    console.log("QR Detectado y validado:", codigoLeido);
    setDatosQR(codigoLeido);
    
    // Validación exitosa, pasamos automáticamente a la pantalla de menú:
    setPantalla('menu');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. PANTALLA INICIAL CON BOTÓN DE ESCANEAR */}
      {pantalla === 'inicio' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: '#f4f6f8' }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Clínica Familia</h2>
          <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>Escanee el código QR para iniciar sesión o validar acceso</p>
          
          <button 
            onClick={() => setPantalla('escaner')}
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              padding: '16px 32px',
              fontSize: '18px',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            Escanear QR
          </button>
        </div>
      )}

      {/* 2. PANTALLA DE ESCANEO NATIVO */}
      {pantalla === 'escaner' && (
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#000' }}>
          <QrScannerScreen 
            onScanSuccess={handleScanSuccess} 
            onCancel={() => setPantalla('inicio')} 
          />
        </div>
      )}

      {/* 3. SEGUNDA PANTALLA: MENÚ DE OPCIONES */}
      {pantalla === 'menu' && (
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#28a745' }}>¡Validación Exitosa!</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>Código: <b>{datosQR}</b></p>
          </div>

          <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>Menú de Opciones</h2>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <button style={menuButtonStyle}>Consultar Pacientes</button>
            <button style={menuButtonStyle}>Registrar Triaje</button>
            <button style={menuButtonStyle}>Historial Clínico</button>
            <button style={menuButtonStyle}>Configuración</button>
          </div>

          <button 
            onClick={() => { setDatosQR(null); setPantalla('inicio'); }}
            style={{ marginTop: 'auto', padding: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Cerrar Sesión / Nuevo Escaneo
          </button>
        </div>
      )}

    </div>
  );
}

const menuButtonStyle = {
  padding: '16px',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '8px',
  textAlign: 'left',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  cursor: 'pointer',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};
