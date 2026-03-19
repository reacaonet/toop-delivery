package br.com.toopdelivery.motorista;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.widget.Toast;
import android.provider.Settings;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import br.com.toopdelivery.motorista.bubble.BubbleActivity;
import br.com.toopdelivery.motorista.bubble.FloatingWindowGFG;
import br.com.toopdelivery.motorista.bubble.FloatingWindowNewRun;
import br.com.toopdelivery.motorista.bubble.NewRaceActivity;
import br.com.toopdelivery.motorista.gen.ReadWriter;
import br.com.toopdelivery.motorista.preferences.Local;
import br.com.toopdelivery.motorista.service.Actions;
import br.com.toopdelivery.motorista.util.LocationUtil;
import br.com.toopdelivery.motorista.util.UtilFuncoes;

public class OpenApp extends ReactContextBaseJavaModule {
  public static final String ACTION_STRING_ACTIVITY = "ToActivity";
  public static final String ACTION_STRING_ACTIVITY_LOCATION = "LocationActivity";
  public static final int time = 60000;
  public static final int timeTravel = 15000;
  private Boolean backgroundLocationServiceRunning = false;
  private Boolean isTravel = false;
  private int currentTime = time;
  public static ReactApplicationContext contextReact = null;

  public OpenApp(ReactApplicationContext context) {
    super(context);
    contextReact = getReactApplicationContext();
  }

  @ReactMethod
  public static void sendLocationToReactNative(Double latitude, Double longitude)  {
    UtilFuncoes.log("sendLocationToReactNative latitude:" +latitude);
    UtilFuncoes.log("sendLocationToReactNative longitude:" +longitude);

    String latlng = latitude.toString()+","+longitude.toString();
    contextReact.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onCoordinate", latlng);
  }

  private BroadcastReceiver activityReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      try {
        if(intent.getBooleanExtra("isRefused",true)){
          getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onSessionRefused", "refused");
        } else {
          getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onSessionAcceptRace", "acceptRace");
        }
      } catch (Exception e) {
        Log.e(
          "BroadcastRec-onReceive",
          e.getMessage().toString()
        );
      }
    }
  };

  private BroadcastReceiver activityReceiverLocation = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      UtilFuncoes.log("ENVIANDO LOCALIZAÇÃO activityReceiverLocation");

      String locationLatLng = intent.getStringExtra("LOCATION_LAT_LNG");
      UtilFuncoes.log("ENVIANDO LOCALIZAÇÃO activityReceiverLocation location LAT/LNG: "+locationLatLng);
      getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onSessionLocation", locationLatLng);

      // limpar coordenadas
      ReadWriter.gravaArray(ReadWriter.KEY_USUARIO_LOCATION_LAT_LNG, null, context);
    }
  };

  @Override
  public String getName() {
    return "OpenApp";
  }

  @ReactMethod
  public void invokeApp(Promise promise) {
    try {
      ReactApplicationContext context = getReactApplicationContext();
      Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage("br.com.toopdelivery.motorista");

      if (launchIntent != null) {
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(launchIntent);//null pointer check in case package name was not found
      }

      Log.d(
        "OpenApp",
        "Aplicação chamada"
      );
    } catch (Exception e) {
      Log.e(
        "OpenApp",
        e.getMessage().toString()
      );
    }

  }

  @ReactMethod
  public void invokeAppNewRace(Promise promise) {
    try {
      ReactApplicationContext context = getReactApplicationContext();
      try {
        getCurrentActivity().finish();
      }catch (Exception e){
        Log.e(
          "OpenApp",
          e.getMessage().toString()
        );
      }

      Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage("br.com.toopdelivery.motorista");

      if (launchIntent != null) {
        context.startActivity(launchIntent);//null pointer check in case package name was not found
      }

      Log.d(
        "OpenApp",
        "Aplicação chamada"
      );
    } catch (Exception e) {
      Log.e(
        "OpenApp",
        e.getMessage().toString()
      );
    }
  }


  @ReactMethod
  public void floatingWindow() {
    try {
      ReactApplicationContext context = getReactApplicationContext();

      if (Build.VERSION.SDK_INT <= 25 || !Settings.canDrawOverlays(context)) {
        return;
      }

      Intent intent = new Intent(context, BubbleActivity.class);
      Uri.parse("package:" + context.getPackageName());

      intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
        | Intent.FLAG_ACTIVITY_CLEAR_TOP);
      context.startActivity(intent);
    } catch (Exception e) {
      Log.e(
        "floatingWindow",
        e.getMessage().toString()
      );
    }
  }

  @ReactMethod
  public void closeWindow() {
    try {
      if (Build.VERSION.SDK_INT > 25) {
        ReactApplicationContext context = getReactApplicationContext();
        if (Util.isMyServiceRunning(context, FloatingWindowGFG.class)) {
          // onDestroy() method in FloatingWindowGFG - class will be called here
          context.stopService(new Intent(context,  FloatingWindowGFG.class));
        }

        if (Util.isMyServiceRunning(context, FloatingWindowNewRun.class)) {
          // onDestroy() method in FloatingWindowGFG - class will be called here
          context.stopService(new Intent(context,  FloatingWindowNewRun.class));
        }
      }
    } catch (Exception e) {
      Log.e(
        "closeWindow",
        e.getMessage().toString()
      );
    }
  }

  @ReactMethod
  public void newRaceWindow(String  message) {
     try {
      ReactApplicationContext context = getReactApplicationContext();

      if (Build.VERSION.SDK_INT <= 25 || !Settings.canDrawOverlays(context)) {
        try {
          try {
            getCurrentActivity().finish();
          }catch (Exception e){
            Log.e(
              "OpenApp",
              e.getMessage().toString()
            );
          }

          Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage("br.com.toopdelivery.motorista");

          if (launchIntent != null) {
            context.startActivity(launchIntent);//null pointer check in case package name was not found
          }

          return;
        } catch (Exception e) {
          Log.e(
            "OpenApp",
            e.getMessage().toString()
          );
          return;
        }
      }

       Intent intent = new Intent(context, NewRaceActivity.class);
       intent.putExtra("message", message);
       intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
         | Intent.FLAG_ACTIVITY_CLEAR_TOP);
       context.startActivity(intent);
       if (activityReceiver != null) {
         //Create an intent filter to listen to the broadcast sent with the action "ACTION_STRING_ACTIVITY"
         IntentFilter intentFilter = new IntentFilter(ACTION_STRING_ACTIVITY);
         //Map the intent filter to the receiver
         getReactApplicationContext().registerReceiver(activityReceiver, intentFilter);
       }
     } catch (Exception e) {
       Log.e(
         "closeWindow",
         e.getMessage().toString()
       );
     }
  }


  @ReactMethod
  public void startLocation() {

    if(this.backgroundLocationServiceRunning) {
      this.stopLocation();
    }

    ReactApplicationContext context = getReactApplicationContext();
    LocationUtil.actionOnService(Actions.START, context);
    UtilFuncoes.log("started location BG services");

    if (activityReceiverLocation != null) {
      //Create an intent filter to listen to the broadcast sent with the action "ACTION_STRING_ACTIVITY"
      IntentFilter intentFilter = new IntentFilter(ACTION_STRING_ACTIVITY_LOCATION);
      getReactApplicationContext().registerReceiver(activityReceiverLocation, intentFilter); //Map the intent filter to the receiver
    }

    this.backgroundLocationServiceRunning = true;
  }

  @ReactMethod
  public void updateTimeLocation(boolean travel, int minD) {
    UtilFuncoes.log("TIME LOCATION A travel= "+travel);
    ReactApplicationContext context = getReactApplicationContext();
    UtilFuncoes.log("TIME LOCATION B");
    Local.setTimeLocation(context, travel?timeTravel:time);
    Local.setDistanceLocation(context,minD);
    UtilFuncoes.log("TIME LOCATION C");

    this.isTravel = travel;
    this.currentTime = travel ? timeTravel:time;
  }

  @ReactMethod
  public void getBackgroundLocationServiceRunning(Promise promise) {
    try {
      promise.resolve(this.backgroundLocationServiceRunning);
    } catch(Exception e) {
      promise.reject("Create Event Error", e);
    }
  }

  @ReactMethod
  public void getCurrentSettings(Promise promise) {
    try {
      JSONObject payload = new JSONObject();

      payload.put("isTravel,", this.isTravel);
      payload.put("currentTime",this.currentTime);

      promise.resolve(payload.toString());
    } catch(Exception e) {
      promise.reject("getTime Error", e);
    }
  }

  @ReactMethod
  public void stopLocation() {
    ReactApplicationContext context = getReactApplicationContext();
    LocationUtil.actionOnService(Actions.STOP, context);
    UtilFuncoes.log("stop location BG services");
  }
}
