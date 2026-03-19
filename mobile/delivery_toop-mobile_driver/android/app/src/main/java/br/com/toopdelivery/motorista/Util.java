package br.com.toopdelivery.motorista;

import android.app.ActivityManager;
import android.content.Context;

public class Util {

  public static  boolean isMyServiceRunning(Context context, Class classs) {
    //The ACTIVITY_SERVICE is needed to retrieve a ActivityManager for interacting with the global system
    //It has a constant String value "activity".
    ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
    //A loop is needed to get Service information that are currently running in the System.
    //So ActivityManager.RunningServiceInfo is used. It helps to retrieve a
    //particular service information, here its this service.
    //getRunningServices() method returns a list of the services that are currently running
    //and MAX_VALUE is 2147483647. So at most this many services can be returned by this method.
    for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
      //If this service is found as a running, it will return true or else false.
      if (classs.getName().equals(service.service.getClassName())) {
        return true;
      }
    }
    return false;
  }
}
