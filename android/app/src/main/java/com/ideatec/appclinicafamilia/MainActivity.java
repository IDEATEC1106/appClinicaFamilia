package com.ideatec.appclinicafamilia;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.ideatec.appclinicafamilia.QrScannerPlugin; // <--- 1. Importa tu plugin nativo aquí

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // <--- 2. Registra el plugin para que Capacitor lo reconozca
        registerPlugin(QrScannerPlugin.class);
    }
}
