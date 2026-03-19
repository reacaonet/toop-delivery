package br.com.toopdelivery.motorista.service;

import android.content.Context;
import android.content.SharedPreferences;


public class ServiceTracker {
    private static final String name = "SPYSERVICE_KEY";
    private static final String key = "SPYSERVICE_STATE";

    public static void setServiceState(Context context, ServiceState state) {
        SharedPreferences sharedPrefs = getPreferences(context);
        SharedPreferences.Editor editor = sharedPrefs.edit();
        editor.putString(key, state.name());
        editor.apply();
    }

    public static ServiceState getServiceState(Context context) {
        SharedPreferences sharedPrefs = getPreferences(context);
        String value = sharedPrefs.getString(key, ServiceState.STOPPED.name());
        return ServiceState.valueOf(value);
    }

    private static SharedPreferences getPreferences(Context context) {
        return context.getSharedPreferences(name, 0);
    }
}
