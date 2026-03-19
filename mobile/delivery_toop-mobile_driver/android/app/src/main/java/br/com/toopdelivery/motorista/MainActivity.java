package br.com.toopdelivery.motorista;

import com.facebook.react.ReactActivity;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;

import br.com.toopdelivery.motorista.bubble.FloatingWindowGFG;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Toop Motorista";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
    if (Util.isMyServiceRunning(this, FloatingWindowGFG.class)) {
      // onDestroy() method in FloatingWindowGFG
      // class will be called here
      stopService(new Intent(this, FloatingWindowGFG.class));
    }
  }
}
