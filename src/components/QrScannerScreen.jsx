import React from 'react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  
  const iniciarEscaneo = async () => {
    try {
      // Solicitar permisos nativos de forma explícita
      const permissionStatus = await BarcodeScanner.requestPermissions();
      if (permissionStatus.camera !== 'granted') {
        alert('Se necesitan permisos de cámara para escanear el código QR.');
        onCancel();
        return;
      }

      // Abrir el visor nativo de Google Play Services / ML Kit
      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (result.barcodes && result.barcodes.length > 0) {
        onScanSuccess(result.barcodes[0].rawValue);
      } else {
        onCancel();
      }
    } catch (error) {
      console.error("Error al abrir el escáner nativo:", error);
      alert("No se pudo iniciar la cámara: " + (error.message || error));
      onCancel();
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
        onClick={iniciarEscaneo}
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
