import { env } from "./index";

/**
 * Firebase Web SDK config (client-side), origin: arquivo raiz `firebase.txt`
 * (projeto GoJaDelivery — enduring-honor-419212, número 52044825836).
 *
 * Obs.: este é o config do Web SDK (apiKey/authDomain/appId...), usado pelo
 * app/painel para se registrar no FCM e obter tokens de dispositivo. O envio
 * de push pelo servidor exige um Service Account (FIREBASE_ADMIN_*) — sem ele
 * os métodos de envio degradam para uma mensagem clara de "FCM não configurado".
 */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
}

export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  if (!env.FIREBASE_API_KEY || !env.FIREBASE_PROJECT_ID) {
    return null;
  }
  return {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    databaseURL: env.FIREBASE_DATABASE_URL || undefined,
  };
}

export function isFirebaseAdminEnabled(): boolean {
  return (
    env.FIREBASE_ADMIN_ENABLED === 'true' &&
    !!env.FIREBASE_ADMIN_PROJECT_ID &&
    !!env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    !!env.FIREBASE_ADMIN_PRIVATE_KEY
  );
}

export default getFirebaseWebConfig;
