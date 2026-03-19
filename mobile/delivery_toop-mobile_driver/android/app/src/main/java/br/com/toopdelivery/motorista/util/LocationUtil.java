package br.com.toopdelivery.motorista.util;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import br.com.toopdelivery.motorista.service.Actions;
import br.com.toopdelivery.motorista.service.GpsLocation;
import br.com.toopdelivery.motorista.service.SendLocationService;
import br.com.toopdelivery.motorista.service.ServiceState;

public class LocationUtil {

    public static void actionOnService(Actions action, Context context) {
        if (action == Actions.STOP) {
          Intent intent = new Intent(context, SendLocationService.class);
          intent.setAction(action.name());
          UtilFuncoes.log("location() stop A ForegroundService");
          context.stopService(intent);
          actionOnGPSService(Actions.STOP,context);
          return;
        }
        Intent intent = new Intent(context, SendLocationService.class);
        intent.setAction(action.name());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            UtilFuncoes.log("Starting the service in >=26 Mode");
            UtilFuncoes.log("location() startForegroundService ");
            context.startForegroundService(intent);
            return;
        }
        UtilFuncoes.log("location() startService");
        UtilFuncoes.log("Starting the service in < 26 Mode");
        context.startService(intent);
    }

    public static void actionOnGPSService(Actions action, Context context) {
      if (action == Actions.STOP) {
        Intent intent = new Intent(context, GpsLocation.class);
        intent.setAction(action.name());
        UtilFuncoes.log("location() stop A GpsLocation ForegroundService");
        context.stopService(intent);
        return;
      }
        Intent intent = new Intent(context, GpsLocation.class);
        intent.setAction(action.name());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            UtilFuncoes.log("Starting the  GpsLocation GpsLocationservice in >=26 Mode");
            UtilFuncoes.log("location() startForegroundService ");
            context.startForegroundService(intent);
            return;
        }
        UtilFuncoes.log("location() startService");
        UtilFuncoes.log("Starting the service in < 26 Mode");
        context.startService(intent);
    }

    private static ServiceState getServiceState(Context context) {
        // implementation for getServiceState() is not provided in the given Kotlin code
        // please provide the implementation if required
        return null;
    }
}