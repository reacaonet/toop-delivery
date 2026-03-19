package br.com.toopdelivery.motorista.preferences;

import android.content.Context;
import android.util.Log;


import org.json.JSONArray;
import org.json.JSONObject;

import br.com.toopdelivery.motorista.gen.ReadWriter;

/**
 * Created by OTAVIO on 15/10/2017.
 */

public class Local {

    public static int getSocketLocation(Context contex) {
        return ReadWriter.lerInt(ReadWriter.KEY_SOCKET_LOCATION_JSON, contex);
    }

    public static String getMessageNotificationLocation(Context contex) {
        return ReadWriter.ler(ReadWriter.KEY_LOCATION_MESSAGE_NOTIFICATION, contex);
    }

    public static void setMessageNotificationLocation(Context contex, String value) {
        ReadWriter.grava(ReadWriter.KEY_LOCATION_MESSAGE_NOTIFICATION, value, contex);
    }

    public static String getMessageNotificationBigLocation(Context contex) {
        return ReadWriter.ler(ReadWriter.KEY_LOCATION_MESSAGE_BIG_NOTIFICATION, contex);
    }

    public static void setMessageNotificationBigLocation(Context contex, String value) {
        ReadWriter.grava(ReadWriter.KEY_LOCATION_MESSAGE_BIG_NOTIFICATION, value, contex);
    }
    public static void setSocketLocation(Context contex, int value) {
        ReadWriter.grava(ReadWriter.KEY_SOCKET_LOCATION_JSON, value, contex);
    }

    public static void setLatitudeLongitude(Context context, String latitude, String longitude) {
        String json = ReadWriter.ler(ReadWriter.KEY_COLETANDO_LOCAL_JSON, context, "");
        try {
            JSONArray jsonResposta = null;
            Log.i("DADOS", "LatitudeLongitude  ANTES   jsonResposta " + jsonResposta);
            if (json != null && !json.trim().equals(""))
                jsonResposta = new JSONArray(getLocalJson(context));
            else
                jsonResposta = new JSONArray();

            JSONObject jsonBody = new JSONObject();
            jsonBody.put("latitude", latitude);
            jsonBody.put("longitude", latitude);
            jsonResposta.put(jsonBody);
            setLocalJson(context, jsonResposta.toString());
            Log.i("DADOS", "LatitudeLongitude DEPOIS    jsonResposta " + getLocalJson(context));
        } catch (Exception e) {
        }
        return;
    }

  public static void setTimeLocation(Context context, int time) {
    ReadWriter.grava(ReadWriter.KEY_TIME_LOCATION_JSON, time, context);
  }

  public static int getTimeLocation(Context context, int def) {
    return ReadWriter.lerInt(ReadWriter.KEY_TIME_LOCATION_JSON, context,def);
  }


  public static void setDistanceLocation(Context context, int din) {
    ReadWriter.grava(ReadWriter.KEY_DISTANCE_LOCATION_JSON, din, context);
  }

  public static int getDistanceLocation(Context context,int def) {
    return ReadWriter.lerInt(ReadWriter.KEY_DISTANCE_LOCATION_JSON, context, def);
  }



  public static void setAtivarColeta(Context context, boolean ativar) {
        ReadWriter.gravaBoolean(ReadWriter.KEY_ATIVAR_LOCAL_JSON, ativar, context);
    }

    public static boolean getAtivarColeta(Context context) {
        return ReadWriter.lerBoolean(ReadWriter.KEY_ATIVAR_LOCAL_JSON, context, false);
    }

    public static String getLocalJson(Context contex) {
        return ReadWriter.ler(ReadWriter.KEY_COLETANDO_LOCAL_JSON, contex);
    }

    public static void setLocalJson(Context contex, String json) {
        ReadWriter.grava(ReadWriter.KEY_COLETANDO_LOCAL_JSON, json, contex);
    }
}

