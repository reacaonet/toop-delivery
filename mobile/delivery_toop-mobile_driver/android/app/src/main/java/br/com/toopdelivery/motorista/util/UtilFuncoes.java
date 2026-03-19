package br.com.toopdelivery.motorista.util;

import android.app.AppOpsManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;


import org.json.JSONObject;

import java.lang.reflect.Method;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import br.com.toopdelivery.motorista.MainActivity;
import br.com.toopdelivery.motorista.R;



public class UtilFuncoes {

    private static final String TAG = UtilFuncoes.class.getSimpleName();

    public static final int NOTIFICATION_ID_PADRAO = 10;
    public static final String NOTIFICATION_CHANNEL_ID_PADRAO = "NOTIFICATION_CHANNEL_NOTIFICATION_CHANNEL_ID_PADRAO";
    public static NotificationCompat.Builder notificationBuilder;

    public static final int NOTIFICATION_ID_CHAT = 11;
    public static final String NOTIFICATION_CHANNEL_ID_CHAT = "NOTIFICATION_CHANNEL_ID_CHAT";

    public static final int NOTIFICATION_ID_NOVA_MENSAGEM_CORRIDA = 12;
    public static final String NOTIFICATION_CHANNEL_ID_NOVA_MENSAGEM_CORRIDA = "NOTIFICATION_CHANNEL_ID__NOVA_CORRIDA";

    public static final int NOTIFICATION_ID_NOVA_MENSAGEM = 14;
    public static final String NOTIFICATION_CHANNEL_ID_NOVA_MENSAGEM = "NOTIFICATION_CHANNEL_ID_NOVA_MENSAGEM";

    public static final int NOTIFICATION_ID_CORRIDA_CANCELAMENTO = 15;
    public static final String NOTIFICATION_CHANNEL_ID_CORRIDA_CANCELAMENTO = "NOTIFICATION_CHANNEL_ID_CORRIDA_CANCELAMENTO";


    // Notificação padrão que será usada em todos os serviços, exceto no Servico Chat
    public static Notification sendNotificationPadrao(Context context) {

        String titulo = "Toop Motorista";
        String texto = "Motorista";
        String textoBig = "";
     /*   if (Usuario.getLogado(context)) {
            texto = Local.getMessageNotificationLocation(context);
            textoBig = Local.getMessageNotificationBigLocation(context);
        }*/
        Log.i(TAG, "sendNotificationPadrao = " + texto);
        PendingIntent pendingIntent = PendingIntent.getActivity(
          context,
          0,
          new Intent(context, MainActivity.class),
          android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S ? PendingIntent.FLAG_MUTABLE : PendingIntent.FLAG_UPDATE_CURRENT
        );

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        int color = ContextCompat.getColor(context, R.color.orchid);

        // if (notificationBuilder == null) {
        notificationBuilder = new NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID_PADRAO);
        notificationBuilder
                .setContentTitle(titulo)
                .setContentText(texto)
                .setAutoCancel(false)
                .setTicker(titulo)
                .setOngoing(false)
                .setOnlyAlertOnce(true)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setColor(color)
                .setStyle(new NotificationCompat.BigTextStyle().setBigContentTitle(texto).bigText(textoBig))
                .setSound(defaultSoundUri)
                .setContentIntent(pendingIntent);
       /* } else {
            notificationBuilder
                    .setContentTitle(titulo)
                    .setContentText(texto)
                    .setTicker(titulo);
        }*/

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel notificationChannel = new NotificationChannel(NOTIFICATION_CHANNEL_ID_PADRAO, "Localização Toop", importance);
            notificationChannel.enableLights(true);
            notificationChannel.setLightColor(color);
            assert notificationManager != null;
            notificationBuilder.setChannelId(NOTIFICATION_CHANNEL_ID_PADRAO);
            notificationManager.createNotificationChannel(notificationChannel);
        }

        assert notificationManager != null;
        notificationManager.notify(NOTIFICATION_ID_PADRAO, notificationBuilder.build());
        return notificationBuilder.build();


    }

   @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    public static boolean canDrawOverlaysUsingReflection(Context context) {

        try {

            AppOpsManager manager = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
            Class clazz = AppOpsManager.class;
            Method dispatchMethod = clazz.getMethod("ExibeMensagensAvisoActivity", new Class[] { int.class, int.class, String.class });
            //AppOpsManager.OP_SYSTEM_ALERT_WINDOW = 24
            int mode = (Integer) dispatchMethod.invoke(manager, new Object[] { 24, Binder.getCallingUid(), context.getApplicationContext().getPackageName() });

            return AppOpsManager.MODE_ALLOWED == mode;

        } catch (Exception e) {  return false;  }

    }
    // Notificação para Nova Mensagem de corrida que chega da Classe MyFireBaseMessagingService


    public static JSONObject converterDatatoJsonCorridaSocket(String dadosRetorno, String titulo) {
        JSONObject jsonRetorno = new JSONObject();

        try {
            String latitude = "0";
            String longitude = "0";

            JSONObject jsonBody = new JSONObject(dadosRetorno);
            String value = "";
            JSONObject jsonBodyObject = null;

            Log.i("DADOS", "JSON = " + jsonBody.toString());

            jsonRetorno.put("title", titulo);

            value = "";
            try {
                jsonBody = new JSONObject(dadosRetorno);
                value = (String) jsonBody.get("company_phone");
                Log.i("DADOS", " company_phone = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("company_phone", value);

            value = "";
            try {
                jsonBody = new JSONObject(dadosRetorno);
                value = (String) jsonBody.get("originAddresses");
                Log.i("DADOS", "originAddresses = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("originAddresses", value);
            jsonRetorno.put("addresses", value);

            value = "";
            try {
                jsonBody = new JSONObject(dadosRetorno);
                value = (String) jsonBody.get("destinationAddresses");
                Log.i("DADOS", "destinationAddresses = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("destinationAddresses", value);

            int valueInt = -1;
            try {
                jsonBody = new JSONObject(dadosRetorno);
                valueInt = jsonBody.getInt("running_delivery_id");
                Log.i("DADOS", "running_deliverys = " + valueInt);
            } catch (Exception e) {
                Log.i("DADOS", "ERRO running_deliverys = " + e);
            }
            jsonRetorno.put("running_delivery_id", valueInt);


            valueInt = -1;
            try {
                jsonBody = new JSONObject(dadosRetorno);
                valueInt = jsonBody.getInt("request_taxi_id");
                Log.i("DADOS", "request_taxi_id = " + valueInt);
            } catch (Exception e) {
                Log.i("DADOS", "ERRO request_taxi_id = " + e);
            }
            jsonRetorno.put("request_taxi_id", valueInt);

            valueInt = -1;
            try {
                jsonBody = new JSONObject(dadosRetorno);
                valueInt = jsonBody.getInt("running_taxi_id");
                Log.i("DADOS", "running_taxi_id = " + valueInt);
            } catch (Exception e) {
                Log.i("DADOS", "ERRO running_taxi_id = " + e);
            }
            jsonRetorno.put("running_taxi_id", valueInt);

            value = "";
            try {
                jsonBody = new JSONObject(dadosRetorno);
                value = (String) jsonBody.get("kilometers");
                Log.i("DADOS", "kilometers = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("kilometerss", value);

            value = "";
            try {
                jsonBody = new JSONObject(dadosRetorno);
                value = (String) jsonBody.get("totalOrder");
                Log.i("DADOS", "totalOrder = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("totalOrder", value);

            value = "";
            try {
                jsonBody = new JSONObject(dadosRetorno);
                value = (String) jsonBody.get("user_phone");
                Log.i("DADOS", "user_phone = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("user_phone", value);

            value = "";
            latitude = "0";
            longitude = "0";

            JSONObject jsonBodyObjectFinal = null;
            try {
                jsonBodyObjectFinal = jsonBody.getJSONObject("pointFinish");
                Log.i("DADOS", "pointFinish = " + jsonBodyObjectFinal.toString());
            } catch (Exception e) {
            }

            JSONObject jsonObjectLocation = null;
            Object valueObject;

            try {
                jsonObjectLocation = new JSONObject(jsonBodyObjectFinal.toString());
                Log.i("DADOS", "jsonObjectLocation= " + jsonObjectLocation.toString());
                valueObject = jsonObjectLocation.get("coordinates");
                Log.i("DADOS", "coordinates = " + valueObject.toString());

                if (valueObject != null) {
                    String localidade = valueObject.toString().replace("[", "").replace("]", "");
                    String[] ponto = localidade.split(",");
                    if (ponto != null && ponto.length > 1) {
                        latitude = ponto[0];
                        longitude = ponto[1];
                    } else if (ponto != null && ponto.length > 0) {
                        latitude = ponto[0];
                    }
                }
            } catch (Exception e) {
            }
            jsonRetorno.put("pFinishLat", latitude);
            jsonRetorno.put("pFinishLong", longitude);

            value = "";
            latitude = "0";
            longitude = "0";

            JSONObject jsonBodyObjectInicial = null;

            try {
                jsonBodyObjectInicial = jsonBody.getJSONObject("pointInit");
                Log.i("DADOS", "pointInit = " + jsonBodyObjectInicial.toString());
            } catch (Exception e) {
            }


            try {
                jsonObjectLocation = new JSONObject(jsonBodyObjectInicial.toString());
                valueObject = jsonObjectLocation.get("coordinates");
                Log.i("DADOS", "coordinates = " + valueObject);

                if (valueObject != null) {
                    String localidade = valueObject.toString().replace("[", "").replace("]", "");
                    String[] ponto = localidade.split(",");
                    if (ponto != null && ponto.length > 1) {
                        latitude = ponto[0];
                        longitude = ponto[1];
                    } else if (ponto != null && ponto.length > 0) {
                        latitude = ponto[0];
                    }
                }
            } catch (Exception e) {
            }
            jsonRetorno.put("pInitLat", latitude);
            jsonRetorno.put("pInitLong", longitude);

            value = "";
            try {
                jsonBody = new JSONObject(dadosRetorno);
                value = (String) jsonBody.get("company");
                Log.i("DADOS", "company = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("company", value);

            valueInt = -1;
            try {
                jsonBody = new JSONObject(dadosRetorno);
                valueInt = jsonBody.getInt("request_id");
                Log.i("DADOS", "request_id = " + value);
            } catch (Exception e) {
            }
            jsonRetorno.put("request_id", valueInt);

            try {
                jsonBody = new JSONObject(dadosRetorno);
                valueInt = jsonBody.getInt("typePayment");
                Log.i("DADOS", "typePayment = " + valueInt);
            } catch (Exception e) {
            }
            jsonRetorno.put("typePayment", valueInt);
        } catch (Exception e) {
        }


        Log.i("DADOS", "jsonRetorno = " + jsonRetorno.toString());

        return jsonRetorno;
    }

    public static String getDateTime(){
      try {
        DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        Date date = new Date();
        return (dateFormat.format(date))+"";
      } catch (Exception e) {
        return "---";
      }
    }

    public static void log(String message){
      Log.i("DADOS", "TESTE -> message " + message);
    }
}