package br.com.toopdelivery.motorista.bubble;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.PixelFormat;
import android.os.AsyncTask;
import android.os.Build;
import android.os.CountDownTimer;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;


import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

import br.com.toopdelivery.motorista.OpenApp;
import br.com.toopdelivery.motorista.R;


public class FloatingWindowNewRun extends  Service  {//extends Service {

  // The reference variables for the
  // ViewGroup, WindowManager.LayoutParams,
  // WindowManager, Button, EditText classes are created
  private ViewGroup floatView;
  private int LAYOUT_TYPE;
  private WindowManager.LayoutParams floatWindowLayoutParam;
  private WindowManager windowManager;
  private Context context;
  private Map<String, String> map;
  private  DecimalFormat df;
  private  MyCountDownTimer myCountDownTimer;
  private  ValueEventListener  valueEventListener;

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    super.onStartCommand(intent, flags, startId);
try {
  String data = intent.getStringExtra("message").replace("{", "").replace("}", "");
  obterDados(data,this);
}catch (Exception e){
  onDestroy();
}
    return START_STICKY;
  }


  private void obterDados(String message, final Context context){
    map = new HashMap<String, String>();
    String messages[] = message.split("\",");
    for (String m : messages) {
      String string1[] = m.split(":");
      String string2 = string1[0].replace("\"", "").trim();
      String string3 = string1[1].replace("\"", "").trim();
      map.put(string2, string3);
    }

    FirebaseDatabase database = FirebaseDatabase.getInstance();
    DatabaseReference myRef = database.getReference(map.get("path").trim());

    valueEventListener =   myRef.orderByValue().addValueEventListener(new ValueEventListener() {
      @Override
      public void onDataChange(@NonNull DataSnapshot snapshot) {
        // Caso o app apresente algum erro no retorno de dados do Firebase, o app não prosseguirá com exibição nova corrida.
        try {
          map.put("limitSeconds", getFirebaseValue("limitSeconds", snapshot.getValue(true).toString()));
          map.put("routeTime", getFirebaseValue("routeTime=", snapshot.getValue(true).toString()));
          map.put("routeTimePassenger", getFirebaseValue("routeTimePassenger", snapshot.getValue(true).toString()));
          map.put("distancePassenger", getFirebaseValue("distancePassenger", snapshot.getValue(true).toString()));
          map.put("distance", getFirebaseValue("distance=", snapshot.getValue(true).toString()));
          map.put("passengerName", getFirebaseValue("passengerName", snapshot.getValue(true).toString()));
          map.put("passengerImage", getFirebaseValue("passengerImage", snapshot.getValue(true).toString()));
          map.put("service", snapshot.child("service").getValue() != null ? snapshot.child("service").getValue().toString() : "");
          map.put("typePaymentTxt", snapshot.child("typePaymentTxt").getValue() != null ? snapshot.child("typePaymentTxt").getValue().toString() : "");
          configWindowGFG(context);
          open();
          myRef.orderByValue().removeEventListener(valueEventListener);
        }catch (Exception e){
          onDestroy();
         Log.d("Teste","erro valueEventListener = "+e);
        }
      }

      @Override
      public void onCancelled(@NonNull DatabaseError error) {
        onDestroy();
      }
    });
  }

  private String getFirebaseValue(String key, String array){
    try {
      return array.substring(array.indexOf(key)).split(",")[0].split("=")[1].trim();
    }catch (Exception e){
      Log.d("getFirebaseValue","key: "+ key + array, e);
      return "";
    }
  }
  public void configWindowGFG(Context context) {
    this.context = context;

    // The screen height and width are calculated, cause
    // the height and width of the floating window is set depending on this
    DisplayMetrics metrics = getApplicationContext().getResources().getDisplayMetrics();
    int width = metrics.widthPixels;
    int height = metrics.heightPixels;

    // To obtain a WindowManager of a different Display,
    // we need a Context for that display, so WINDOW_SERVICE is used
    windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

    // A LayoutInflater instance is created to retrieve the
    // LayoutInflater for the floating_layout xml
    LayoutInflater inflater = (LayoutInflater) getBaseContext().getSystemService(LAYOUT_INFLATER_SERVICE);

    // inflate a new view hierarchy from the floating_layout xml
    floatView = (ViewGroup) inflater.inflate(R.layout.new_race_layout, null);
    df = new DecimalFormat("0.00");
    if(map != null){
      try {
      ((TextView) floatView.findViewById(R.id.txt_end_origem)).setText(map.get("address").toString());
      ((TextView) floatView.findViewById(R.id.txt_end_dest)).setText(map.get("addressDestiny").toString());
      ((TextView) floatView.findViewById(R.id.txt_formato)).setText(map.get("currencySymbol").toString());
      ((TextView) floatView.findViewById(R.id.txt_info_tempo)).setText(map.get("routeTimePassenger").toString());
      ((TextView) floatView.findViewById(R.id.txt_info_dest_tempo)).setText(map.get("routeTime").toString());
      ((TextView) floatView.findViewById(R.id.txt_info_km)).setText(map.get("distancePassenger").toString());
      ((TextView) floatView.findViewById(R.id.txt_info_dest_km)).setText(map.get("distance").toString());
      ((TextView) floatView.findViewById(R.id.txt_nome)).setText(map.get("passengerName").toString());
      ((TextView) floatView.findViewById(R.id.txt_valor)).setText(df.format(new Double(map.get("price").toString())));

      ((TextView) floatView.findViewById(R.id.txt_servico)).setText(map.get("service").toString());
      ((TextView) floatView.findViewById(R.id.txt_formapagamento)).setText(map.get("typePaymentTxt").toString());

      myCountDownTimer = new MyCountDownTimer(Integer.parseInt(map.get("limitSeconds").toString()) * 1000, 1000);
      myCountDownTimer.start();

     }catch (Exception e){
        onDestroy();
        e.printStackTrace();
        return;
     }

      ((ImageButton)  floatView.findViewById(R.id.imb_close)).setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View view) {
          sendBroadcast(true);
         /// Toast.makeText(context, "Refused",Toast.LENGTH_LONG).show();

        }
      });

      floatView.findViewById(R.id.llgeral).setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View view) {
          sendBroadcast(false);
         // Toast.makeText(context, "AcceptRace",Toast.LENGTH_LONG).show();
        }
      });

   //   new DownloadImageFromTherad().execute();
     }
    // The Buttons and the EditText are connected with

    // WindowManager.LayoutParams takes a lot of parameters to set the
    // the parameters of the layout. One of them is Layout_type.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // If API Level is more than 26, we need TYPE_APPLICATION_OVERLAY
      LAYOUT_TYPE = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
    } else {
      // If API Level is lesser than 26, then we can
      // use TYPE_SYSTEM_ERROR,
      // TYPE_SYSTEM_OVERLAY, TYPE_PHONE, TYPE_PRIORITY_PHONE.
      // But these are all
      // deprecated in API 26 and later. Here TYPE_TOAST works best.
      LAYOUT_TYPE = WindowManager.LayoutParams.TYPE_TOAST;
    }

    // Now the Parameter of the floating-window layout is set.
    // 1) The Width of the window will be 55% of the phone width.
    // 2) The Height of the window will be 58% of the phone height.
    // 3) Layout_Type is already set.
    // 4) Next Parameter is Window_Flag. Here FLAG_NOT_FOCUSABLE is used. But
    // problem with this flag is key inputs can't be given to the EditText.
    // This problem is solved later.
    // 5) Next parameter is Layout_Format. System chooses a format that supports
    // translucency by PixelFormat.TRANSLUCENT
    floatWindowLayoutParam = new WindowManager.LayoutParams(
      (int) (width * (0.95f)),
      (int) (height * (0.99f)),
      LAYOUT_TYPE,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    );

    // The Gravity of the Floating Window is set.
    // The Window will appear in the center of the screen
    floatWindowLayoutParam.gravity = Gravity.BOTTOM;

    // X and Y value of the window is set
    floatWindowLayoutParam.x = 0;
    floatWindowLayoutParam.y = 0;

    // The ViewGroup that inflates the floating_layout.xml is
    // added to the WindowManager with all the parameters
    windowManager.addView(floatView, floatWindowLayoutParam);

    // The button that helps to maximize the app

    // The EditText string will be stored
    // in currentDesc while writing

    // Another feature of the floating window is, the window is movable.
    // The window can be moved at any position on the screen.
   /* floatView.setOnTouchListener(new View.OnTouchListener() {
      final WindowManager.LayoutParams floatWindowLayoutUpdateParam = floatWindowLayoutParam;
      double x;
      double y;
      double px;
      double py;

      @Override
      public boolean onTouch(View v, MotionEvent event) {

        switch (event.getAction()) {
          // When the window will be touched,
          // the x and y position of that position
          // will be retrieved
          case MotionEvent.ACTION_DOWN:
            x = floatWindowLayoutUpdateParam.x;
            y = floatWindowLayoutUpdateParam.y;

            // returns the original raw X
            // coordinate of this event
            px = event.getRawX();

            // returns the original raw Y
            // coordinate of this event
            py = event.getRawY();
            break;
          // When the window will be dragged around,
          // it will update the x, y of the Window Layout Parameter
          case MotionEvent.ACTION_MOVE:
            floatWindowLayoutUpdateParam.x = (int) ((x + event.getRawX()) - px);
            floatWindowLayoutUpdateParam.y = (int) ((y + event.getRawY()) - py);

            // updated parameter is applied to the WindowManager
            windowManager.updateViewLayout(floatView, floatWindowLayoutUpdateParam);
            break;
        }
        return false;
      }
    });
*/
    // Floating Window Layout Flag is set to FLAG_NOT_FOCUSABLE,
    // so no input is possible to the EditText. But that's a problem.
    // So, the problem is solved here. The Layout Flag is
    // changed when the EditText is touched.

  }


  @Override
  public void onDestroy() {
    super.onDestroy();
    close(this);
  }

  public void open() {
    try {
      close(context);
      // check if the view is already
      // inflated or present in the window
      if (floatView.getWindowToken() == null) {
        if (floatView.getParent() == null) {
          windowManager.addView(floatView, floatWindowLayoutParam);
        }
      }
    } catch (Exception e) {
      Log.d("Error1", e.toString());
    }
  }


  public void close(Context context) {
    try {
      // remove the view from the window
      ((WindowManager) context.getSystemService(WINDOW_SERVICE)).removeView(floatView);
      // invalidate the view
      floatView.invalidate();
      // remove all views
      ((ViewGroup) floatView.getParent()).removeAllViews();
      windowManager.removeView(floatView);
    } catch (Exception e) {
      Log.d("Error2", e.toString());
    }

  }


  public class MyCountDownTimer extends CountDownTimer {

    public MyCountDownTimer(long millisInFuture, long countDownInterval) {
      super(millisInFuture, countDownInterval);
    }

    @Override
    public void onTick(long millisUntilFinished) {

      long sec = (millisUntilFinished / 1000) % 60;
      try {
        ((TextView) floatView.findViewById(R.id.txt_cronometro)).setText(sec+"");
      }catch (Exception e){}

      if(sec <= 0) {
        onDestroy();
      }
    }

    @Override
    public void onFinish() {

    }
  }


  private void remove(){
    FirebaseDatabase database = FirebaseDatabase.getInstance();
    DatabaseReference myRef = database.getReference(map.get("path").trim());

    myRef.orderByValue().addValueEventListener(new ValueEventListener() {
      @Override
      public void onDataChange(@NonNull DataSnapshot snapshot) {
        snapshot.getRef().removeValue();
        onDestroy();
      }

      @Override
      public void onCancelled(@NonNull DatabaseError error) {
        onDestroy();
      }
    });
  }


  private void sendBroadcast(boolean isRefused) {
    Intent new_intent = new Intent();
    new_intent.setAction(OpenApp.ACTION_STRING_ACTIVITY);
    new_intent.putExtra("isRefused", isRefused);
    if(isRefused){
      myCountDownTimer.onFinish();
      myCountDownTimer.cancel();
    }
    sendBroadcast(new_intent);
    onDestroy();
  }

  private class DownloadImageFromTherad extends AsyncTask<String,Integer,String>{
Bitmap bitmap;
    @Override

    protected String doInBackground(String... params) {

      bitmap = getBitmapFromURL(params[0]);

      return null;

    }

    public Bitmap getBitmapFromURL(String src) {

      try {

        URL url = new URL(src);

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        connection.setDoInput(true);

        connection.connect();

        InputStream input = connection.getInputStream();

        Bitmap myBitmap = BitmapFactory.decodeStream(input);

        return myBitmap;

      } catch (IOException e) {

        e.printStackTrace();

        return null;

      }

    }
    @Override

    protected void onPostExecute(String s) {

      super.onPostExecute(s);
      try {

        ((ImageView) floatView.findViewById(R.id.img_user)).setImageBitmap(bitmap);
      }catch (Exception e){}
    }

  }
}
