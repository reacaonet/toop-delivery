import getFirebaseAdmin from "./firebaseAdmin.service";
import { AppError } from "../middleware/errorHandler";

export interface TopicItem {
  name: string;
  value?: string;
}

/**
 * Serviço de push FCM por tópicos (migrado de _legacy_src/services/firebase e
 * controllers/Mobility/Topic/*). Degrada com AppError claro quando o Firebase
 * Admin (Service Account) não está configurado.
 */
export class FirebaseTopicService {
  private topicKey(name: string, value?: string): string {
    if (!value || name === value) {
      return name;
    }
    return `${name}_${value}`;
  }

  /**
   * Inscreve/desinscreve um token de dispositivo em tópicos.
   * Body: { token, topics: [{name, value}], unsubscribeTopic?: [{name, value}] }
   */
  async create(params: {
    token: string;
    topics: TopicItem[];
    unsubscribeTopic?: TopicItem[];
  }) {
    const fcm = await getFirebaseAdmin();
    if (!fcm) {
      throw new AppError(
        "FCM não configurado: adicione um Service Account em FIREBASE_ADMIN_*",
        400,
      );
    }

    const { token, topics = [], unsubscribeTopic = [] } = params || {};
    if (!token) {
      throw new AppError("Informe o token do dispositivo", 400);
    }
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new AppError("Informe ao menos um tópico", 400);
    }

    const { messaging } = fcm;

    if (Array.isArray(unsubscribeTopic) && unsubscribeTopic.length > 0) {
      for (const item of unsubscribeTopic) {
        try {
          if (item.name) {
            await messaging.unsubscribeFromTopic(token, this.topicKey(item.name, item.value));
          }
        } catch {
          // falha de unsubscribe não bloqueia
        }
      }
    }

    const listTopics: string[] = [];
    for (const item of topics) {
      try {
        if (item.name) {
          const response = await messaging.subscribeToTopic(token, this.topicKey(item.name, item.value));
          if (response && response.successCount === 1) {
            listTopics.push(this.topicKey(item.name, item.value));
          }
        }
      } catch {
        // falha de subscribe não bloqueia
      }
    }

    return { topics: listTopics };
  }

  /**
   * Envia push por tópico/condição (migrado de Mobility/Topic/SendController).
   * Body: { topic, title, subject, franchise?, priority? }
   */
  async send(params: {
    topic: string;
    title: string;
    subject: string;
    priority?: string;
    franchise?: string | number;
  }) {
    const fcm = await getFirebaseAdmin();
    if (!fcm) {
      throw new AppError(
        "FCM não configurado: adicione um Service Account em FIREBASE_ADMIN_*",
        400,
      );
    }

    const { topic, title, subject, priority = "max", franchise } = params || {};
    if (!topic) {
      throw new AppError("Informe o tópico de envio", 400);
    }
    if (!title || !subject) {
      throw new AppError("Informe título e mensagem da notificação", 400);
    }

    const { messaging } = fcm;

    let conditional = `'${topic}' in topics && 'application_root' in topics`;
    if (franchise) {
      conditional += ` && 'franchise_${franchise}' in topics`;
    }

    const message: any = {
      data: {},
      notification: {
        title,
        body: subject,
      },
      android: {
        data: {},
        priority: "high",
        notification: {
          title,
          body: subject,
          priority,
          visibility: "public",
          notificationCount: 1,
          defaultVibrateTimings: true,
        },
      },
      condition: conditional,
    };

    let response: string;
    try {
      response = await messaging.send(message);
    } catch (err: any) {
      throw new AppError(`Falha ao enviar push: ${err?.message || "erro FCM"}`, 400);
    }

    return { response, condition: conditional };
  }
}

export default new FirebaseTopicService();
