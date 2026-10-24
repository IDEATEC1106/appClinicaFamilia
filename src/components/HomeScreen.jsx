import React from 'react';
import './HomeScreen.css';

export default function HomeScreen({ razonSocial, ruc, nombrePadre, onLogout }) {
  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h1>Detalle del Registro</h1>
          <span className="success-badge">Validación Exitosa</span>
        </div>

        <div className="info-section">
          <div className="info-item">
            <span className="info-label">Razón Social / Titular</span>
            <span className="info-value">{razonSocial || 'No disponible'}</span>
          </div>

          <div className="info-item">
            <span className="info-label">RUC / Código de Identificación</span>
            <span className="info-value">{ruc || 'No disponible'}</span>
          </div>

          {nombrePadre && (
            <div className="info-item">
              <span className="info-label">Información Adicional</span>
              <span className="info-value">{nombrePadre}</span>
            </div>
          )}
        </div>

        <button onClick={onLogout} className="btn-secondary">
          Escanear Nuevo Código
        </button>
      </div>
    </div>
  );
}
