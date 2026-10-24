import React, { useState, useRef, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import './QrScannerScreen.css'; // Tus estilos limpios

export default function QrScannerScreen({ onLoginSuccess }) {
  const [codigo, setCodigo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  // Mantiene el foco listo para recibir la lectura automática de la pistola láser
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  const handleProcesarCodigo = async (e) => {
    if (e) e.preventDefault();
    const qrLimpio = codigo.trim();

    if (!qrLimpio || isProcessing) return;

    if (qrLimpio.length < 10) {
      setErrorMessage("El código ingresado no tiene un formato válido.");
      setCodigo('');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const resultado = await ApiService.validarQr(qrLimpio);

    setIsProcessing(false);
    setCodigo('');

    if (resultado.success) {
      onLoginSuccess(resultado); // Cambia a la pantalla HomeScreen
    } else {
      setErrorMessage(resultado.message);
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-card">
        <div className="scanner-icon">📱</div>
        <h2>Control de Acceso / Validación</h2>
        <p>Escanee con su pistola láser o ingrese el código QR:</p>

        {isProcessing ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Validando código en el sistema...</p>
          </div>
        ) : (
          <form onSubmit={handleProcesarCodigo}>
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Esperando código QR..."
                autoFocus
                autoComplete="off"
              />
            </div>
            <button type="submit" className="btn-primary">
              Validar Código
            </button>
          </form>
        )}

        {errorMessage && <div className="alert-error">{errorMessage}</div>}
      </div>
    </div>
  );
}
