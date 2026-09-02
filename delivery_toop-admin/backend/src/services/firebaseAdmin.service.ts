import {
  initializeApp,
  cert,
  getApp,
  App,
  deleteApp,
} from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import { env } from "../config";
import { isFirebaseAdminEnabled } from "../config/firebase.config";

const APP_NAME = "adminFirebase-Notification";

let cachedApp: App | null = null;
let cachedMessaging: Messaging | null = null;

/**
 * Retorna o app do Firebase Admin (para envio de push FCM).
 * Requer um Service Account configurado em FIREBASE_ADMIN_*. Sem ele retorna
 * null (degradação graciosa — o chamador deve responder "FCM não configurado").
 */
export async function getFirebaseAdmin(): Promise<{
  app: App;
  messaging: Messaging;
} | null> {
  if (!isFirebaseAdminEnabled()) {
    return null;
  }

  if (cachedApp && cachedMessaging) {
    return { app: cachedApp, messaging: cachedMessaging };
  }

  try {
    const existing = getApp(APP_NAME);
    if (existing) {
      cachedApp = existing;
      cachedMessaging = getMessaging(existing);
      return { app: existing, messaging: cachedMessaging };
    }
  } catch {
    // app ainda não inicializado
  }

  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");

  const app = initializeApp(
    {
      credential: cert({
        projectId: env.FIREBASE_ADMIN_PROJECT_ID.trim(),
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
        privateKey: privateKey.trim(),
      }),
      databaseURL:
        env.FIREBASE_ADMIN_DATABASE_URL || env.FIREBASE_DATABASE_URL || undefined,
    },
    APP_NAME,
  );

  cachedApp = app;
  cachedMessaging = getMessaging(app);
  return { app, messaging: cachedMessaging };
}

/** Força a re-inicialização (útil em testes/recarga de credenciais). */
export async function resetFirebaseAdmin(): Promise<void> {
  if (cachedApp) {
    try {
      await deleteApp(cachedApp);
    } catch {
      // ignore
    }
  }
  cachedApp = null;
  cachedMessaging = null;
}

export default getFirebaseAdmin;
