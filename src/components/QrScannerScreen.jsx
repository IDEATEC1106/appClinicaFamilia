import { useEffect } from 'react';
import { registerPlugin } from '@capacitor/core';

// Registramos nuestro puente nativo personalizado en Kotlin
const QrScannerNativo = registerPlugin('QrScannerNativo');

export default function QrScannerScreen({ onScanSuccess, onCancel }) {
  useEffect(() => {
    let isMounted = true;

    const iniciarVisorNativo = async () => {
      try {
        // Llama directamente al motor nativo de Google Play Services
        const response = await QrScannerNativo.abrirVisor();
        
        if (response && response.resultado && isMounted) {
          onScanSuccess(response.resultado);
        } else if (isMounted) {
          onCancel();
        }
      } catch (error) {
        console.log("Escaneo cancelado o cerrado:", error);
        if (isMounted) {
          onCancel();
        }
      }
    };

    iniciarVisorNativo();

    return () => {
      isMounted = false;
    };
  }, [onScanSuccess, onCancel]);

  return null; // No renderiza nada en HTML; el visor nativo toma el control completo de la pantalla.
}
