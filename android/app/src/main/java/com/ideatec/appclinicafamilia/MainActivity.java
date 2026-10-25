package com.ideatec.appclinicafamilia;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // ESTA LÍNEA ES LA CLAVE PARA QUE CAPACITOR RECONOZCA EL VISOR NATIVO:
        registerPlugin(QrScannerPlugin.class);
    }
}
