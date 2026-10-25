. Iniciar el escaneo en tiempo real
        BarcodeScanner.hideBackground(); // Hace transparente el WebView
        const result = await BarcodeScanner.startScan(); // Comienza a buscar el QR en vivo

        if (result.hasContent && isMounted) {
          await cerrarEscanner();
          onScanSuccess(result.content);
        }
      } catch (error) {
        console.error('Error en el visor:', error);
        await cerrarEscanner();
        if (isMounted) onCancel();
      }
    };

    iniciarVisorYape();

    return () => {
      isMounted = false;
      cerrarEscanner();
    };
  }, [onScanSuccess, onCancel]);

  const cerrarEscanner = async () => {
    try {
      await BarcodeScanner.stopScan();
      BarcodeScanner.showBackground();
      document.body.style.background = '';
      document.documentElement.style.background = '';
      const rootEl = document.querySelector('#root');
      if (rootEl) rootEl.style.display = 'block';
    } catch (e) {}
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999 }}>
      {/* Botón flotante idéntico a Yape para salir del visor */}
      <div style={{ position: 'absolute', top: '40px', left: '20px', pointerEvents: 'auto', zIndex: 100000 }}>
        <button 
          onClick={async () => {
            await cerrarEscanner();
            onCancel();
          }}
          style={{ 
            background: 'rgba(0,0,0,0.7)', 
            color: '#fff', 
            border: '2px solid #fff', 
            padding: '10px 20px', 
            borderRadius: '20px', 
            fontSize: '15px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          ✕ Cancelar
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: '80px', width: '100%', textAlign: 'center', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontSize: '16px', pointerEvents: 'none' }}>
        Enfoque el código QR dentro del recuadro
      </div>
    </div>
  );
}
