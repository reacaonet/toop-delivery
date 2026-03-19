package br.com.toopdelivery.motorista.service;

import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;
//import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;
//import com.github.kittinunf.fuel.Fuel;
//import com.github.kittinunf.fuel.core.extensions.jsonBody;
import android.os.Handler;

import java.util.Timer;
import java.util.TimerTask;

import br.com.toopdelivery.motorista.MainActivity;
import br.com.toopdelivery.motorista.OpenApp;
import br.com.toopdelivery.motorista.Util;
import br.com.toopdelivery.motorista.preferences.Local;
import br.com.toopdelivery.motorista.preferences.Usuario;
import br.com.toopdelivery.motorista.util.LocationUtil;
import br.com.toopdelivery.motorista.util.UtilFuncoes;


public class SendLocationService extends Service {
  private PowerManager.WakeLock wakeLock;
  private boolean isServiceStarted = false;

  @Override
  public IBinder onBind(Intent intent) {
    UtilFuncoes.log("Some component want to bind with the service");
    // We don't provide binding, so return null
    return null;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    UtilFuncoes.log("onStartCommand executed with startId: " + startId);
    if (intent != null) {
      String action = intent.getAction();
      UtilFuncoes.log("using an intent with action " + action);

      try {
        switch (action) {
          case "START":
            startService();
            break;
          case "STOP":
            stopService();
            break;
          default:
            UtilFuncoes.log("This should never happen. No action in the received intent");
            break;
        }
      }catch (Exception e){
        startService();
      }
    } else {
      UtilFuncoes.log("with a null intent. It has been probably restarted by the system.");
    }
    // by returning this we make sure the service is restarted if the system kills the service
    return START_STICKY;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    UtilFuncoes.log("The service has been created".toUpperCase());
    Notification notification = createNotification();
    startForeground(1, notification);
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    UtilFuncoes.log("ENVIANDO LOCALIZAÇÃO onDestroy() ");
    final SendLocationService activity = this;

    new Thread(new Runnable() {
      @Override
      public void run() {
        Looper.prepare();
        Handler handler = new Handler();

        handler.post(new Runnable() {
          public void run() {
            try {
              UtilFuncoes.log("The service has been destroyed".toUpperCase());
              // Toast.makeText(activity, "Service destroyed", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
              Log.e("sendLocation", e.getMessage(), e);
            }
          }
        });
        Looper.loop();
      }
    }).start();
  }

  @Override
  public void onTaskRemoved(Intent rootIntent) {
    try {
      Intent restartServiceIntent = new Intent(getApplicationContext(), SendLocationService.class);
      restartServiceIntent.setPackage(getPackageName());

      PendingIntent restartServicePendingIntent = PendingIntent.getService(this, 1, restartServiceIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_ONE_SHOT);
      getApplicationContext().getSystemService(Context.ALARM_SERVICE);
      AlarmManager alarmService = (AlarmManager) getApplicationContext().getSystemService(Context.ALARM_SERVICE);
      alarmService.set(AlarmManager.ELAPSED_REALTIME, SystemClock.elapsedRealtime() + 1000, restartServicePendingIntent);
    }catch (Exception e){}
  }

  private void startService() {
    if (isServiceStarted) return;
    UtilFuncoes.log("Starting the foreground service task");
    // Toast.makeText(this, "Service starting its task", Toast.LENGTH_SHORT).show();
    isServiceStarted = true;
    ServiceTracker.setServiceState(this, ServiceState.STARTED);

    // we need this lock so our service gets not affected by Doze Mode
    PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
    if (powerManager != null) {
      wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "EndlessService::lock");
      wakeLock.acquire();
    }

    // we're starting a loop in a coroutine
    //new Thread(() -> {

    startTimer();
    UtilFuncoes.log("End of the loop for the service");
    // }).start();
  }

  private void stopService() {
    UtilFuncoes.log("Stopping the foreground service");
    // Toast.makeText(this, "Service stopping", Toast.LENGTH_SHORT).show();
    try {
      if (wakeLock != null) {
        if (wakeLock.isHeld()) {
          wakeLock.release();
        }
      }
      stopForeground(true);
      stoptimertask();
      stopSelf();
    } catch (Exception e) {
      UtilFuncoes.log("Service stopped without being started: " + e.getMessage());
    }
    isServiceStarted = false;
    ServiceTracker.setServiceState(this, ServiceState.STOPPED);
  }

  private void pingServer() {
    if (!Util.isMyServiceRunning(this, GpsLocation.class)) {
      UtilFuncoes.log("ENVIANDO LOCALIZAÇÃO 2 ");
      LocationUtil.actionOnGPSService(Actions.START, this);
    }

    UtilFuncoes.log("ENVIANDO LOCALIZAÇÃO 1 ");
    Intent new_intent = new Intent();
    new_intent.setAction(OpenApp.ACTION_STRING_ACTIVITY_LOCATION);
    UtilFuncoes.log("ENVIANDO LOCALIZAÇÃO " + Usuario.getLatitude(this) + "," + Usuario.getLongitude(this));
    UtilFuncoes.log("ENVIANDO LOCATION LAT/LNG " + Usuario.getLocationLatLng(this));
    new_intent.putExtra("LOCATION_LAT_LNG", Usuario.getLocationLatLng(this));
    Intent intent = new_intent.putExtra("LOCATION", Usuario.getLatitude(this) + "," + Usuario.getLongitude(this));

    // if(Usuario.getLocationLatLng(this)  != null)
    sendBroadcast(new_intent);

    //  onDestroy();
    UtilFuncoes.log("ENVIANDO LOCALIZAÇÃO ");
  }

  private Notification createNotification() {
    String notificationChannelId = "ENDLESS SERVICE CHANNEL";

    // Depending on the Android API that we're dealing with, we will have to use a specific method to create the notification.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager notificationManager = getSystemService(NotificationManager.class);
      NotificationChannel channel = new NotificationChannel(
        notificationChannelId,
        "Endless Service notifications channel",
        NotificationManager.IMPORTANCE_HIGH
      );
      channel.setDescription("Endless Service channel");
      channel.enableLights(true);
      channel.setLightColor(Color.RED);
      channel.enableVibration(true);
      channel.setVibrationPattern(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});
      notificationManager.createNotificationChannel(channel);
    }

    Intent notificationIntent = new Intent(this, MainActivity.class);

    PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent,
      android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S ? PendingIntent.FLAG_MUTABLE : 0);

    Notification.Builder builder;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      builder = new Notification.Builder(this, notificationChannelId);
    } else {
      builder = new Notification.Builder(this);
    }

    return builder
      .setContentTitle("Service Send Location Toop")
      .setContentText("This is your favorite endless service working")
      .setContentIntent(pendingIntent)
      .setTicker("Ticker text")
      .setPriority(Notification.PRIORITY_HIGH) // for under Android 26 compatibility
      .build();
  }

  private Timer timer;
  private TimerTask timerTask;
  long oldTime=0;
  Context context;
  public void startTimer() {
    //set a new Timer
    timer = new Timer();
    //initialize the TimerTask's job
    initializeTimerTask();
    timer.schedule(timerTask, Local.getTimeLocation(this,60000), Local.getTimeLocation(this,60000)); //schedule the timer, to wake up every 1 second

    context = this;
    oldTime = Local.getTimeLocation(this,60000);
  }

  public void initializeTimerTask() {
    timerTask = new TimerTask() {
      public void run() {
        if(oldTime != Local.getTimeLocation(context,60000)){
          timer.cancel();
          startTimer();
        }else {
          pingServer();
        }
      }
    };
  }

  public void stoptimertask() {
    //stop the timer, if it's not already null
    if (timer != null) {
      timer.cancel();
      timer = null;
    }
  }
}