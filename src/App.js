import React, { useState } from 'react';
import QrScannerScreen from './components/QrScannerScreen';
import HomeScreen from './components/HomeScreen';

function App() {
  const [authData, setAuthData] = useState(null);

  const handleLoginSuccess = (resultado) => {
    setAuthData(resultado);
  };

  const handleLogout = () => {
    setAuthData(null);
  };

  return (
    <div>
      {!authData ? (
        <QrScannerScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <HomeScreen
          razonSocial={authData.razonSocial}
          ruc={authData.ruc}
          nombrePadre={authData.nombrePadre}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
