package br.com.toopdelivery.motorista.service;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import br.com.toopdelivery.motorista.util.UtilFuncoes;

public class StartReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) &&
          ServiceTracker.getServiceState(context) == ServiceState.STARTED) {
            Intent serviceIntent = new Intent(context, SendLocationService.class);
            serviceIntent.setAction(Actions.START.name());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                UtilFuncoes.log("Starting the service in >=26 Mode from a BroadcastReceiver");
                context.startForegroundService(serviceIntent);
                return;
            }
            UtilFuncoes.log("Starting the service in < 26 Mode from a BroadcastReceiver");
            context.startService(serviceIntent);
        }
    }
}
