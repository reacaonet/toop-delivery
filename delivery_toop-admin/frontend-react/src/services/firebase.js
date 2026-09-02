import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

/**
 * Config Firebase Web SDK (projeto GoJaDelivery — enduring-honor-419212).
 * Preenchido via variáveis VITE_ (ver .env.example).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || undefined,
};

export const firebaseEnabled =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app = null;
let messaging = null;
const handlers = [];

export function getFirebaseApp() {
  if (!firebaseEnabled) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getMessagingInstance() {
  if (!firebaseEnabled) return null;
  if (!messaging) {
    messaging = getMessaging(getFirebaseApp());
  }
  return messaging;
}

/**
 * Solicita permissão de notificação e obtém o token FCM do navegador/painel.
 * DEGRADA: retorna null quando o Firebase não está configurado, o browser não
 * suporta messaging, ou o usuário nega a permissão.
 */
export async function requestPushToken() {
  try {
    if (!firebaseEnabled) return null;
    if (!('Notification' in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) return null;

    const currentToken = await getToken(messagingInstance, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined,
    });
    return currentToken || null;
  } catch (err) {
    console.warn('Falha ao obter token FCM', err);
    return null;
  }
}

/** Registra um listener para notificações recebidas com o app em foco. */
export function onForegroundMessage(listener) {
  if (!firebaseEnabled) return () => {};
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) return () => {};
    handlers.push(listener);
    onMessage(messagingInstance, (payload) => {
      handlers.forEach((h) => h(payload));
    });
    return () => {
      const idx = handlers.indexOf(listener);
      if (idx >= 0) handlers.splice(idx, 1);
    };
  } catch (err) {
    console.warn('onForegroundMessage indisponível', err);
    return () => {};
  }
}

export default firebaseConfig;
