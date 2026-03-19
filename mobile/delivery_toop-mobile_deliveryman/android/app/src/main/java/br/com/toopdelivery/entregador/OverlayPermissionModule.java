package br.com.toopdelivery.entregador;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;
import com.facebook.react.bridge.Promise;


public class OverlayPermissionModule extends ReactContextBaseJavaModule {
  OverlayPermissionModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "OverlayPermissionModule";
  }

  @ReactMethod
  public  void isPermission(final Promise promise) {
    try {
      if (Build.VERSION.SDK_INT < 23) {
        Log.e(
          "OverlayPermissionModule",
          "Menor que a 23 "
        );
        promise.resolve(true);
      }

      ReactApplicationContext context = getReactApplicationContext();

      if (!Settings.canDrawOverlays(context)) {
        Log.d(
          "OverlayPermissionModule",
          "isPermission: Nao "
        );

        promise.resolve(false);
      }

      Log.d(
        "OverlayPermissionModule",
        "isPermission: SIM "
      );

      promise.resolve(true);
    } catch (Exception e) {
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void sendSettings() {
    try {
      ReactApplicationContext context = getReactApplicationContext();
      Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
      Uri.parse("package:" + context.getPackageName());

      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(intent);

    } catch (Exception e) {
      Log.e(
        "OverlayPermissionModule",
        "Falha sendSettings " + e.getMessage()
      );
    }
  }
}
