package com.ideatec.appclinicafamilia;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.ideatec.appclinicafamilia.QrScannerPlugin; // Importa tu plugin

public class MainActivity extends BridgeActivity {
    @Option
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(QrScannerPlugin.class); // Registra el plugin aquí
    }
}
