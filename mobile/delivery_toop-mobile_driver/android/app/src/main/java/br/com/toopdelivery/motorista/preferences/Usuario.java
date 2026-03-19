package br.com.toopdelivery.motorista.preferences;

import android.content.Context;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import br.com.toopdelivery.motorista.gen.ReadWriter;


public class Usuario {

    public static void setLocationLatLng(Context context, String location) throws JSONException {
      try {
          Log.i("setLocationLatLng:", location);
          JSONArray jsonArray = new JSONArray();

          String locLatLng = ReadWriter.lerArray(ReadWriter.KEY_USUARIO_LOCATION_LAT_LNG, context);
          if (locLatLng != null && !locLatLng.isEmpty()) {
            jsonArray = new JSONArray(locLatLng);
          }

         if (location == null || location.isEmpty()) {
            // ReadWriter.gravaArray(ReadWriter.KEY_USUARIO_LOCATION_LAT_LNG, null, context);
           return;
         }

         // JSONObject jsonObject = new JSONObject(location);
         // jsonObject.put("latlng", location);

        jsonArray.put(location);
        String jsonString = jsonArray.toString();

        Log.i("jsonString", jsonString);

        ReadWriter.gravaArray(ReadWriter.KEY_USUARIO_LOCATION_LAT_LNG, jsonString, context);
      } catch (Exception e) {
        Log.i("xxxxxDADOS", " LOCALIZACAO_ATUAL LOCATION LAT / LNG = ", e);
      }
    }

    public static String getLocationLatLng(Context context) {
        Log.i("DADOS", " LOCALIZACAO_ATUAL LOCATION LAT / LNG = " + ReadWriter.lerArray(ReadWriter.KEY_USUARIO_LOCATION_LAT_LNG, context));

        return ReadWriter.lerArray(ReadWriter.KEY_USUARIO_LOCATION_LAT_LNG, context);
    }

    public static String getUsuarioJson(Context context) {
        return ReadWriter.ler(ReadWriter.KEY_USUARIO_JSON, context, "");
    }

    public static void setUsuarioJson(Context context, String usuarioJson) {
        ReadWriter.grava(ReadWriter.KEY_USUARIO_JSON, usuarioJson, context);
    }

  public static boolean getLogado(Context context) {
    return ReadWriter.lerBoolean(ReadWriter.KEY_LOGADO, context, false);
  }

  public static void setLogado(Context context, boolean usuarioJson) {
    ReadWriter.gravaBoolean(ReadWriter.KEY_LOGADO, usuarioJson, context);
  }

    public static String getLatitude(Context context) {
        Log.i("DADOS", " LOCALIZACAO_ATUAL LATITUDE = " + ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE, context, "0"));

        try{
            Double.parseDouble(ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE, context, "0"));
        }catch (Exception e){
            return "0";
        }
        return ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE, context, "0");
    }

    public static void setLatitude(Context context, String latitude) {
        ReadWriter.grava(ReadWriter.KEY_USUARIO_LATITUDE, latitude, context);
    }

    public static String getLatitudeOrigemRealCorrida(Context context) {
        Log.i("DADOS", " LOCALIZACAO_ATUAL REAL LATITUDE = " + ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE_REAL, context, "0"));
       try{
           Double.parseDouble(ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE_REAL, context, "0"));
       }catch (Exception e){
           return "0";
       }
        return ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE_REAL, context, "0");
    }

    public static void setLatitudeOrigemRealCorrida(Context context, String latitude) {
        ReadWriter.grava(ReadWriter.KEY_USUARIO_LATITUDE_REAL, latitude, context);
    }

    public static String getLongitudeOrigemRealCorrida(Context context) {
        Log.i("DADOS", " LOCALIZACAO_ATUAL REAL Longitude = " + ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE_REAL, context, "0"));

        try{
            Double.parseDouble(ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE_REAL, context, "0"));
        }catch (Exception e){
            return "0";
        }
        return ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE_REAL, context, "0");
    }

    public static void setLongitudeOrigemRealCorrida(Context context, String latitude) {
        ReadWriter.grava(ReadWriter.KEY_USUARIO_LONGITUDE_REAL, latitude, context);
    }


    public static String getLatitudeDestinoRealCorrida(Context context) {
        Log.i("DADOS", " LOCALIZACAO_ATUAL REAL LATITUDE = " + ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE_REAL_DESTINO, context, "0"));
        try{
            Double.parseDouble(ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE_REAL_DESTINO, context, "0"));
        }catch (Exception e){
            return "0";
        }
        return ReadWriter.ler(ReadWriter.KEY_USUARIO_LATITUDE_REAL_DESTINO, context, "0");
    }

    public static void setLatitudeDestinoRealCorrida(Context context, String latitude) {
        ReadWriter.grava(ReadWriter.KEY_USUARIO_LATITUDE_REAL_DESTINO, latitude, context);
    }

    public static String getLongitudeDestinoRealCorrida(Context context) {
        Log.i("DADOS", " LOCALIZACAO_ATUAL REAL Longitude = " + ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE_REAL_DESTINO, context, "0"));
        try{
            Double.parseDouble(ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE_REAL_DESTINO, context, "0"));
        }catch (Exception e){
            return "0";
        }
        return ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE_REAL_DESTINO, context, "0");
    }

    public static void setLongitudeDestinoRealCorrida(Context context, String latitude) {
        ReadWriter.grava(ReadWriter.KEY_USUARIO_LONGITUDE_REAL_DESTINO, latitude, context);
    }

    public static boolean isNotLocalidadeDestinoReal(Context context){
        return (getLatitudeDestinoRealCorrida(context).trim().equals("0") || getLatitudeDestinoRealCorrida(context).trim().equals(""));
    }

    public static String getLongitude(Context context) {
        Log.i("DADOS", " LOCALIZACAO_ATUAL LONGITUDE = " + ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE, context, "0"));
        try{
            Double.parseDouble(ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE, context, "0"));
        }catch (Exception e){
            return "0";
        }
        return ReadWriter.ler(ReadWriter.KEY_USUARIO_LONGITUDE, context, "0");
    }

    public static void setLongitude(Context context, String longitude) {
        ReadWriter.grava(ReadWriter.KEY_USUARIO_LONGITUDE, longitude, context);
    }
}

