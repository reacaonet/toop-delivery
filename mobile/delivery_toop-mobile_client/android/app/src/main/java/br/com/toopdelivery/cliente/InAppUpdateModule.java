package br.com.toopdelivery.cliente;

import android.content.IntentSender;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;

import com.google.android.gms.tasks.Task;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.common.IntentSenderForResultStarter;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;


public class InAppUpdateModule extends ReactContextBaseJavaModule {
  InAppUpdateModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "InAppUpdateModule";
  }

  @ReactMethod
  public void verifyUpdate(Promise promise) {
    try {
      ReactApplicationContext context = getReactApplicationContext();
      AppUpdateManager appUpdateManager = AppUpdateManagerFactory.create(context);

      Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();

      // Checks that the platform will allow the specified type of update.
      appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
        // This example applies an immediate update. To apply a flexible update
        // instead, pass in AppUpdateType.FLEXIBLE

        if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
          // Request the update.
          Log.d(
            "InAppUpdateModule",
            "Nova Atualização na loja"
          );

          try {
            appUpdateManager.startUpdateFlowForResult(
              appUpdateInfo,
              AppUpdateType.IMMEDIATE,
              getCurrentActivity(),
              15
            );
          } catch (IntentSender.SendIntentException e) {
            Log.d(
              "InAppUpdateModule",
              e.getMessage().toString()
            );
          }
        } else {
          Log.d(
            "InAppUpdateModule",
            "Sem nova atualização"
          );
        }
      });
    } catch (Exception e) {
      Log.d(
        "InAppUpdateModule",
        e.getMessage().toString()
      );
    }
  }

  @ReactMethod
  public void testVerify() {
    Log.d("InAppUpdateModule", "testVerify");
  }
}
