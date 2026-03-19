package br.com.toopdelivery.motorista.bubble;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;

import br.com.toopdelivery.motorista.MainActivity;
import br.com.toopdelivery.motorista.R;


public class FloatingWindowGFG  extends  Service {//extends Service {

  // The reference variables for the
  // ViewGroup, WindowManager.LayoutParams,
  // WindowManager, Button, EditText classes are created
  private ViewGroup floatView;
  private int LAYOUT_TYPE;
  private WindowManager.LayoutParams floatWindowLayoutParam;
  private WindowManager windowManager;
  private Context context;


  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    super.onStartCommand(intent, flags, startId);
    configWindowGFG(this);
    open();
    return START_STICKY;
  }

  public void configWindowGFG(Context context) {
    this.context = context;

    // The screen height and width are calculated, cause
    // the height and width of the floating window is set depending on this
    DisplayMetrics metrics = context.getApplicationContext().getResources().getDisplayMetrics();
    int width = metrics.widthPixels;
    int height = metrics.heightPixels;

    // To obtain a WindowManager of a different Display,
    // we need a Context for that display, so WINDOW_SERVICE is used
    windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);

    // A LayoutInflater instance is created to retrieve the
    // LayoutInflater for the floating_layout xml
    LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);

    // inflate a new view hierarchy from the floating_layout xml
    floatView = (ViewGroup) inflater.inflate(R.layout.floating_layout, null);

    // The Buttons and the EditText are connected with
    // the corresponding component id used in floating_layout xml file
    // maximizeBtn = floatView.findViewById(R.id.buttonMaximize);

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


    floatWindowLayoutParam = new WindowManager.LayoutParams(
      (int) 116,
      (int) 116,
      LAYOUT_TYPE,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT);
    floatWindowLayoutParam.gravity = Gravity.TOP;


    // The ViewGroup that inflates the floating_layout.xml is
    // added to the WindowManager with all the parameters
    windowManager.addView(floatView, floatWindowLayoutParam);

    // The button that helps to maximize the app
    // maximizeBtn.setOnClickListener(new View.OnClickListener() {
    // 	@Override
    // 	public void onClick(View v) {
    // 		// stopSelf() method is used to stop the service if
    // 		// it was previously started
    // 		// stopSelf();

    // 		// // The window is removed from the screen
    // 		// windowManager.removeView(floatView);

    // 		// // The app will maximize again. So the MainActivity
    // 		// // class will be called again.
    // 		// Intent backToHome = new Intent(FloatingWindowGFG.this, br.com.toopdelivery.motorista.MainActivity.class);

    // 		// // 1) FLAG_ACTIVITY_NEW_TASK flag helps activity to start a new task on the history stack.
    // 		// // If a task is already running like the floating window service, a new activity will not be started.
    // 		// // Instead the task will be brought back to the front just like the MainActivity here
    // 		// // 2) FLAG_ACTIVITY_CLEAR_TASK can be used in the conjunction with FLAG_ACTIVITY_NEW_TASK. This flag will
    // 		// // kill the existing task first and then new activity is started.
    // 		// backToHome.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
    // 		// startActivity(backToHome);
    // 	}
    // });

    // Another feature of the floating window is, the window is movable.
    // The window can be moved at any position on the screen.
    floatView.setOnTouchListener(new View.OnTouchListener() {
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
          case MotionEvent.ACTION_UP:
            // Click Effect
            if ((event.getEventTime() - event.getDownTime()) < 300 && (event.getEventTime() - event.getDownTime()) > 50) {
              // stopSelf() method is used to stop the service if
              // it was previously started
              close(context);

              // The app will maximize again. So the MainActivity
              // class will be called again.
              Intent backToHome = new Intent(context, MainActivity.class);

              // 1) FLAG_ACTIVITY_NEW_TASK flag helps activity to start a new task on the history stack.
              // If a task is already running like the floating window service, a new activity will not be started.
              // Instead the task will be brought back to the front just like the MainActivity here
              // 2) FLAG_ACTIVITY_CLEAR_TASK can be used in the conjunction with FLAG_ACTIVITY_NEW_TASK. This flag will
              // kill the existing task first and then new activity is started.
              //  backToHome.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
              backToHome.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                | Intent.FLAG_ACTIVITY_CLEAR_TOP);

              context.startActivity(backToHome);
            }
            break;
        }
        return false;
      }
    });

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
}
