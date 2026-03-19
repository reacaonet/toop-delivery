package br.com.toopdelivery.motorista.bubble;

import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.WindowManager;

import androidx.appcompat.app.AlertDialog;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import br.com.toopdelivery.motorista.R;
import br.com.toopdelivery.motorista.Util;

// import android.widget.Button;

public class NewRaceActivity extends ReactActivity {

  //The reference variables for the
  //Button, AlertDialog, EditText classes are created
  // private Button minimizeBtn;
  private AlertDialog dialog;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL, WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL);
    setContentView(R.layout.activity_new_race);

    getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onSessionConnect", "CLOSE");


    // The Buttons and the EditText are connected with
    // the corresponding component id used in layout file
    // minimizeBtn = findViewById(R.id.buttonMinimize);

    // If the app is started again while the
    // floating window service is running
    // then the floating window service will stop
    if (Util.isMyServiceRunning(this,  FloatingWindowNewRun.class)) {
      // onDestroy() method in FloatingWindowGFG
      // class will be called here
      stopService(new Intent(this,  FloatingWindowNewRun.class));
    }

    if (Util.isMyServiceRunning(this,  FloatingWindowGFG.class)) {
      // onDestroy() method in FloatingWindowGFG
      // class will be called here
      stopService(new Intent(this,  FloatingWindowGFG.class));
    }

    if (checkOverlayDisplayPermission()) {
      // FloatingWindowGFG service is started
      Log.i("teste","TESTE -- newRace data ="+ this.getIntent().getStringExtra("message"));

      Intent i = new Intent(this,  FloatingWindowNewRun.class);
      i.putExtra("message", this.getIntent().getStringExtra("message"));
      startService(i);

      startService( new Intent(this,  FloatingWindowGFG.class));
      //FloatingWindowGFG floatingWindowGFG = new FloatingWindowGFG(this);
      // floatingWindowGFG.open();
      // The MainActivity closes here
      finish();
    } else {
      // If permission is not given,
      // it shows the AlertDialog box and
      // redirects to the Settings
      requestOverlayDisplayPermission();
    }
  }

  private void requestOverlayDisplayPermission() {
    ReactContext context = getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
    // An AlertDialog is created
    AlertDialog.Builder builder = new AlertDialog.Builder(this);

    // This dialog can be closed, just by
    // taping outside the dialog-box
    builder.setCancelable(true);

    // The title of the Dialog-box is set
    builder.setTitle("Screen Overlay Permission Needed");

    // The message of the Dialog-box is set
    builder.setMessage("Enable 'Display over other apps' from System Settings.");

    // The event of the Positive-Button is set
    builder.setPositiveButton("Open Settings", new DialogInterface.OnClickListener() {
      @Override
      public void onClick(DialogInterface dialog, int which) {
        // The app will redirect to the 'Display over other apps' in Settings.
        // This is an Implicit Intent. This is needed when any Action is needed
        // to perform, here it is
        // redirecting to an other app(Settings).
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + context.getPackageName()));

        // This method will start the intent. It takes two parameter,
        // one is the Intent and the other is
        // an requestCode Integer. Here it is -1.
        startActivityForResult(intent, RESULT_OK);
      }
    });
    dialog = builder.create();
    // The Dialog will show in the screen
    dialog.show();
  }

  private boolean checkOverlayDisplayPermission() {
    // Android Version is lesser than Marshmallow
    // or the API is lesser than 23
    // doesn't need 'Display over other apps' permission enabling.
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.M) {
      // If 'Display over other apps' is not enabled it
      // will return false or else true
      if (!Settings.canDrawOverlays(this)) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

}