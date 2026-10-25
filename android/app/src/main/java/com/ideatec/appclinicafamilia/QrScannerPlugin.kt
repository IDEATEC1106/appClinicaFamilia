package com.ideatec.appclinicafamilia

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

@CapacitorPlugin(name = "QrScannerNativo") // <--- Este nombre debe coincidir con el de React
class QrScannerPlugin : Plugin() {

    @PluginMethod
    fun abrirVisor(call: PluginCall) {
        val activity = activity
        if (activity == null) {
            call.reject("Actividad no disponible")
            return
        }

        val options = GmsBarcodeScannerOptions.Builder()
            .enableAutoZoom()
            .build()

        val scanner = GmsBarcodeScanning.getClient(activity, options)

        scanner.startScan()
            .addOnSuccessListener { barcode ->
                val rawValue = barcode.rawValue ?: ""
                val res = JSObject()
                res.put("resultado", rawValue)
                call.resolve(res)
            }
            .addOnCanceledListener {
                call.reject("CANCELADO")
            }
            .addOnFailureListener { e ->
                call.reject("Error nativo: ${e.localizedMessage}")
            }
    }
}
