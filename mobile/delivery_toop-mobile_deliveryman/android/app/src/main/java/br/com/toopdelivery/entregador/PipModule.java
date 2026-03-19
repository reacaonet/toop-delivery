package br.com.toopdelivery.entregador;

import android.app.PictureInPictureParams;
import android.app.RemoteAction;
import android.os.Build;
import android.util.Rational;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;

import android.app.Activity;


public class PipModule extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;
  public static boolean inPipMode = false;

  PipModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
     return "PipModule";
  }

  @ReactMethod
  public void setPipMode(boolean isPipMode, Promise promise) {
    try {
      if (Build.VERSION.SDK_INT >= 26 && isPipMode == true) {
          final Boolean status = getReactApplicationContext().getCurrentActivity().isInPictureInPictureMode();

          if (status == false) {
            Activity activity = getReactApplicationContext().getCurrentActivity();
            if (activity != null) {
              Rational rational = new Rational(150, 100);
              PictureInPictureParams params = new PictureInPictureParams.Builder()
                .setAspectRatio(rational).build();
              activity.enterPictureInPictureMode(params);
            }
            inPipMode = true;
          }
        }

        promise.resolve(true);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

}

