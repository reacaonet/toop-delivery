package br.com.toopdelivery.motorista.service;

import android.Manifest;
import android.app.ActivityManager;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationRequest;
import java.util.Calendar;

import br.com.toopdelivery.motorista.OpenApp;
import br.com.toopdelivery.motorista.preferences.Usuario;
import br.com.toopdelivery.motorista.util.UtilFuncoes;

public class GpsLocation extends Service implements GoogleApiClient.ConnectionCallbacks,
    GoogleApiClient.OnConnectionFailedListener, com.google.android.gms.location.LocationListener {

  NotificationCompat.Builder notificationBuilder;
  private static final String TAG = GpsLocation.class.getSimpleName();
  /// private LocationManager mLocationManager = null;
  private GoogleApiClient mGoogleApiClient;
  // A request to connect to Location Services
  public LocationRequest mLocationRequest;
  private Context context;
  public static final String STOPSERVICE = "stopservice";
  public static final String RECONECT_LOCATION = "RECONECT_LOCATION";
  private PendingIntent pendingIntent;
  public static int TIME = 120000; // 120 seconds
  public static Boolean isRunning = false;
  public LocationUpdaterListener mLocationListener;

  @Override
  public void onLocationChanged(Location location) {
    try {
      UtilFuncoes.log("onLocationChanged 2: ");
      if (location != null) {
        String date = UtilFuncoes.getDateTime();

        // speed gps
        float speed = location.getSpeed();
        float speedKmH = speed * 3.6f;
        String strSpeed = String.format("%.3f", speedKmH).replace(",", ".");

        Usuario.setLatitude(getApplicationContext(), location.getLatitude() + "");
        Usuario.setLongitude(getApplicationContext(), location.getLongitude() + "");
        Usuario.setLocationLatLng(getApplicationContext(), location.getLongitude()+","+location.getLatitude()+","+date+","+strSpeed);

        OpenApp.sendLocationToReactNative(location.getLatitude(), location.getLongitude());
      }
    } catch (Exception e) {
      UtilFuncoes.log("Exception 2 onLocationChanged location.getLatitude() LocationUpdaterListener = ");
    }
  }

  @Override
  public IBinder onBind(Intent arg0) {
    return null;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    UtilFuncoes.log("GPSLocation onStartCommand(= ");

    super.onStartCommand(intent, flags, startId);

    if (Build.VERSION.SDK_INT >= 26)
      startForeground(UtilFuncoes.NOTIFICATION_ID_PADRAO, UtilFuncoes.sendNotificationPadrao(getApplicationContext()));

    boolean stopService = false;
    boolean reconectar = false;

    if (intent != null) {
      try {
        stopService = intent.getBooleanExtra(STOPSERVICE, false);
      } catch (Exception e) {
      }

      try {
        reconectar = intent.getBooleanExtra(RECONECT_LOCATION, false);
      } catch (Exception e) {
      }
    }

    Log.d(TAG, "stopService  = " + stopService);
    Log.d(TAG, "reconectar  = " + reconectar);

    if (stopService) {
      stopListening();
      stopLocationUpdates();
      stopSelf();
    } else {
      UtilFuncoes.log("GPSLocation mGoogleApiClient.isConnected()= " + mGoogleApiClient.isConnected());
      if (!mGoogleApiClient.isConnected()) {
        connect();
        UtilFuncoes.sendNotificationPadrao(this);
      }
    }
    return START_STICKY;
  }

  @Override
  public void onCreate() {
    Log.d(TAG, "onCreate()");

    context = this.getApplicationContext();

    mGoogleApiClient = new GoogleApiClient.Builder(this)
        .addApi(LocationServices.API).addConnectionCallbacks(this)
        .addOnConnectionFailedListener(this).build();
    mLocationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    mLocationListener = new LocationUpdaterListener();

    startListening();

    super.onCreate();

    if (Build.VERSION.SDK_INT >= 26)
      startForeground(UtilFuncoes.NOTIFICATION_ID_PADRAO, UtilFuncoes.sendNotificationPadrao(context));
  }

  @Override
  public void onDestroy() {
    Log.i(TAG, "onDestroy");
    super.onDestroy();
    Log.e(TAG, "A pós onDestroy");
    if (Build.VERSION.SDK_INT >= 26)
      stopForeground(false);
    Log.e(TAG, "B pós onDestroy");
  }

  public void stopLocationUpdates() {
    Log.d(TAG, "stopLocationUpdates()");

    NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    mNotificationManager.cancelAll();
    try {
      if (mGoogleApiClient != null)
        LocationServices.FusedLocationApi.removeLocationUpdates(
            mGoogleApiClient, this);

      if (mGoogleApiClient != null && mGoogleApiClient.isConnected())
        mGoogleApiClient.disconnect();
    } catch (Exception e) {
    }

  }

  @Override
  public void onConnected(Bundle arg0) {
    Log.d(TAG, "onConnected");
    initLocationRequests();
    if (ContextCompat.checkSelfPermission(this,
        Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
      Location l = LocationServices.FusedLocationApi.getLastLocation(mGoogleApiClient);
      if (mGoogleApiClient != null && mGoogleApiClient.isConnected())
        LocationServices.FusedLocationApi.requestLocationUpdates(mGoogleApiClient, mLocationRequest, this);
      else {
        connect();
      }
    }
  }

  @Override
  public void onConnectionFailed(ConnectionResult connectionResult) {
  }

  @Override
  public void onConnectionSuspended(int i) {
  }

  private synchronized void connect() {
    mGoogleApiClient = new GoogleApiClient.Builder(this)
        .addOnConnectionFailedListener(this)
        .addConnectionCallbacks(this)
        .addApi(LocationServices.API)
        .build();
    mGoogleApiClient.connect();
  }

  private void startListening() {
    Log.d(TAG, "onLocationChanged startListening 10");
    if (ContextCompat.checkSelfPermission(this,
        Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        || ContextCompat.checkSelfPermission(this,
            Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {

      Log.d(TAG, "onLocationChanged startListening 11");
      if (mLocationManager.getAllProviders().contains(LocationManager.GPS_PROVIDER)) {
        Log.d(TAG, "onLocationChanged startListening 12");
        // mLocationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,
        // LOCATION_INTERVAL, Local.getDistanceLocation(this,0), mLocationListener);
        mLocationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, LOCATION_INTERVAL, 10, mLocationListener);
      }

      Log.d(TAG, "onLocationChanged startListening 16");
      getLatLngMelhorProvedor();
    }
    isRunning = true;
  }

  private void stopListening() {
    Log.d(TAG, "onLocationChanged startListening 1 stop");
    if (ContextCompat.checkSelfPermission(this,
        Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        || ContextCompat.checkSelfPermission(this,
            Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
      mLocationManager.removeUpdates(mLocationListener);
    }
    isRunning = false;
  }

  public void getLatLngMelhorProvedor() {
    try {
      UtilFuncoes.log("getLatLngMelhorProvedor");
      if (ContextCompat.checkSelfPermission(this,
          Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
          || ContextCompat.checkSelfPermission(this,
              Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {

        Location location = mLocationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);

        if (location != null) {
          String date = UtilFuncoes.getDateTime();

          // speed gps
          float speed = location.getSpeed();
          float speedKmH = speed * 3.6f;
          String strSpeed = String.format("%.3f", speedKmH).replace(",", ".");

          Usuario.setLatitude(getApplicationContext(), location.getLatitude() + "");
          Usuario.setLongitude(getApplicationContext(), location.getLongitude() + "");
          Usuario.setLocationLatLng(getApplicationContext(), location.getLongitude()+","+location.getLatitude()+","+date +","+strSpeed);

          OpenApp.sendLocationToReactNative(location.getLatitude(), location.getLongitude());
        }
      }
    } catch (Exception e) {
    }
  }

  private void initLocationRequests() {
    // so eh feito novamento o request qdo a localização muda ou pelo chamado de
    // outro app qualquer
    mLocationRequest = new LocationRequest();
    mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
  }

  private LocationManager mLocationManager = null;
  private static final int LOCATION_INTERVAL = 0;

  public class LocationUpdaterListener implements android.location.LocationListener {
    @Override
    public void onLocationChanged(Location location) {
      try {
        UtilFuncoes.log("onLocationChanged 1: ");
        if (location != null) {
          String date = UtilFuncoes.getDateTime();

          float speed = location.getSpeed();
          float speedKmH = speed * 3.6f;
          String strSpeed = String.format("%.3f", speedKmH).replace(",", ".");

          Usuario.setLatitude(getApplicationContext(), location.getLatitude() + "");
          Usuario.setLongitude(getApplicationContext(), location.getLongitude() + "");
          Usuario.setLocationLatLng(getApplicationContext(), location.getLongitude()+","+location.getLatitude()+","+date+","+strSpeed);

          OpenApp.sendLocationToReactNative(location.getLatitude(), location.getLongitude());
        }
      } catch (Exception e) {
        UtilFuncoes.log("Exception onLocationChanged location.getLatitude() LocationUpdaterListener = ");
      }
    }

    @Override
    public void onProviderDisabled(String provider) {
      // stopListening();
    }

    @Override
    public void onProviderEnabled(String provider) {
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {
    }
  }

  @Override
  public void onTaskRemoved(Intent rootIntent) {
    // Log.i(TAG, "onTaskRemoved ");
    try {
      stopSelf();
      PendingIntent service = PendingIntent.getService(
          getApplicationContext(),
          1001,
          new Intent(getApplicationContext(), GpsLocation.class),
          PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_ONE_SHOT);

      AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
      alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, 1000, service);
    } catch (Exception e) {
    }
    super.onTaskRemoved(rootIntent);
  }

  @Override
  public boolean onUnbind(Intent intent) {
    // Log.i(TAG, " onUnbind ");
    return super.onUnbind(intent);
  }

  public static void startService(Context context) {
    Intent intentSocketGpsLocation = new Intent(context, GpsLocation.class);
    if (Build.VERSION.SDK_INT >= 26)
      context.startForegroundService(intentSocketGpsLocation);
    else
      context.startService(intentSocketGpsLocation);

  }

}