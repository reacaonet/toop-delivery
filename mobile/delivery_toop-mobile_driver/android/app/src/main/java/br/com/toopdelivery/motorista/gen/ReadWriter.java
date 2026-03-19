package br.com.toopdelivery.motorista.gen;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

import java.math.BigDecimal;

public class ReadWriter {
    public static final String APP_PREFS = "br.com.toopdelivery.motorista";
    public static final String KEY_DATA_ULTIMO_SOCKET_LOCATION = "KEY_DATA_ULTIMO_SOCKET_LOCATIONN";
    public static final String KEY_LOGADO = "KEY_LOGADO";
    public static final String KEY_LOCATION_MESSAGE_NOTIFICATION = "KEY_LOCATION_MESSAGE_NOTIFICATION";
    public static final String KEY_LOCATION_MESSAGE_BIG_NOTIFICATION = "KEY_LOCATION_MESSAGE_BIG_NOTIFICATION";

    public static final String KEY_USUARIO_LATITUDE = "KEY_USUARIO_LATITUDE";
    public static final String KEY_USUARIO_LOCATION_LAT_LNG = "KEY_USUARIO_LOCATION_LAT_LNG";
    public static final String KEY_USUARIO_LONGITUDE = "KEY_USUARIO_LONGITUDE";
    public static final String KEY_USUARIO_LATITUDE_REAL = "KEY_USUARIO_LATITUDE_REAL";
    public static final String KEY_USUARIO_LONGITUDE_REAL = "KEY_USUARIO_LONGITUDE_REAL";
    public static final String KEY_USUARIO_LATITUDE_REAL_DESTINO = "KEY_USUARIO_LATITUDE_REAL_DESTINO";
    public static final String KEY_USUARIO_LONGITUDE_REAL_DESTINO = "KEY_USUARIO_LONGITUDE_REAL_DESTINO";
    public static final String KEY_USUARIO_JSON = "KEY_USUARIO_JSON";
    public static final String KEY_COLETANDO_LOCAL_JSON = "KEY_COLETANDO_LOCAL_JSON";
    public static final String KEY_SOCKET_LOCATION_JSON = "KEY_SOCKET_LOCATION_JSON";
    public static final String KEY_ATIVAR_LOCAL_JSON = "KEY_ATIVAR_LOCAL_JSON";
    public static final String KEY_TIME_LOCATION_JSON = "KEY_TIME_LOCATION_JSON";
    public static final String KEY_DISTANCE_LOCATION_JSON = "KEY_DISTANCE_LOCATION_JSON";

    public static void gravaArray(String chave, String valor, Context ctx) {
      if (ctx != null) {
          SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                  Context.MODE_PRIVATE);

          Editor edit = prefs.edit();
          edit.putString(chave, valor);
          edit.commit();
      }
    }

    public static String lerArray(String chave, Context ctx) {
      String ret = null;
      if (ctx != null) {
          SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                  Context.MODE_PRIVATE);
          ret = prefs.getString(chave, null);
      }
      return ret;
    }

   public static void grava(String chave, String valor, Context ctx) {
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);

            Editor edit = prefs.edit();
            edit.putString(chave, valor);
            edit.commit();
        }
    }

    public static void grava(String chave, int valor, Context ctx) {
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);

            Editor edit = prefs.edit();
            edit.putInt(chave, valor);
            edit.commit();
        }
    }

    public static void grava(String chave, long valor, Context ctx) {
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);

            Editor edit = prefs.edit();
            edit.putLong(chave, valor);
            edit.commit();
        }
    }

    public static void gravaBigDecimal(String chave, BigDecimal valor,
                                       Context ctx) {
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);

            Editor edit = prefs.edit();
            if (valor != null)
                edit.putString(chave, valor.toString());
            else
                edit.putString(chave, null);
            edit.commit();
        }
    }

    public static String ler(String chave, Context ctx) {
        String ret = null;
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getString(chave, null);
        }
        return ret;
    }

    public static String ler(String chave, Context ctx, String def) {
        String ret = null;
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getString(chave, def);
        }
        return ret;
    }


    public static int lerInt(String chave, Context ctx) {
        int ret = 0;
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getInt(chave, 0);
        }
        return ret;
    }


    public static int lerInt(String chave, Context ctx, int defValue) {
        int ret = 0;
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getInt(chave, defValue);
        }
        return ret;
    }


    public static long lerLong(String chave, Context ctx, long defValue) {
        long ret = 0;
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getLong(chave, defValue);
        }
        return ret;
    }

    public static long lerLong(String chave, Context ctx) {
        long ret = 0;
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            try {
                ret = prefs.getLong(chave, 0);
            } catch (Exception e) {
                ret = 0;
            }
        }
        return ret;
    }


    public static long lerLong(String chave, Context ctx, int defValue) {
        long ret = 0;
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getLong(chave, defValue);
        }
        return ret;
    }

    public static BigDecimal lerBigDecimal(String chave, Context ctx) {
        BigDecimal ret = new BigDecimal("0");
        if (ctx != null) {
            SharedPreferences prefs = ctx.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            String obs = prefs.getString(chave, null);
            if (obs != null)
                return new BigDecimal(obs);
        }
        return ret;
    }

    public static void gravaBoolean(String chave, boolean valor, Context context) {
        if (context != null) {
            SharedPreferences prefs = context.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);

            Editor edit = prefs.edit();
            edit.putBoolean(chave, valor);
            edit.commit();
        }

    }

    public static boolean lerBoolean(String chave, Context context) {
        boolean ret = false;
        if (context != null) {
            SharedPreferences prefs = context.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getBoolean(chave, false);
        }

        return ret;
    }

    public static boolean lerBoolean(String chave, Context context, boolean def) {
        boolean ret = def;
        if (context != null) {
            SharedPreferences prefs = context.getSharedPreferences(APP_PREFS,
                    Context.MODE_PRIVATE);
            ret = prefs.getBoolean(chave, def);
        }

        return ret;
    }
}
