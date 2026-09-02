import { NotificationModel, INotification } from "../models/Notification";
import { AppError } from "../middleware/errorHandler";
import firebaseTopicService from "./notification-topic.service";

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type?: INotification["type"];
  target?: INotification["target"];
  targetId?: string;
  data?: Record<string, unknown>;
  topic?: string;
  franchise?: string | number;
}

export class NotificationService {
  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      NotificationModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      NotificationModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      throw new AppError("Notificação não encontrada", 404);
    }
    return notification;
  }

  async create(input: CreateNotificationInput) {
    if (!input.title || !input.message) {
      throw new AppError("Informe título e mensagem da notificação", 400);
    }

    const notification = await NotificationModel.create({
      title: input.title,
      message: input.message,
      type: input.type || "info",
      target: input.target || "all",
      targetId: input.targetId,
      data: input.data,
    });

    return notification;
  }

  async update(id: string, input: Partial<CreateNotificationInput>) {
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      throw new AppError("Notificação não encontrada", 404);
    }

    if (input.title !== undefined) notification.title = input.title;
    if (input.message !== undefined) notification.message = input.message;
    if (input.type !== undefined) notification.type = input.type;
    if (input.target !== undefined) notification.target = input.target;
    if (input.targetId !== undefined) notification.targetId = input.targetId as any;
    if (input.data !== undefined) notification.data = input.data;

    await notification.save();
    return notification;
  }

  async remove(id: string) {
    const notification = await NotificationModel.findByIdAndDelete(id);
    if (!notification) {
      throw new AppError("Notificação não encontrada", 404);
    }
    return notification;
  }

  /**
   * Cria uma notificação e (opcionalmente) envia push FCM por tópico.
   * O envio degrada quando o Firebase Admin não está configurado.
   */
  async createAndSend(input: CreateNotificationInput) {
    const notification = await this.create(input);

    let push: { response?: string; condition?: string; error?: string } | null = null;

    if (input.topic) {
      try {
        const result = await firebaseTopicService.send({
          topic: input.topic,
          title: input.title,
          subject: input.message,
          franchise: input.franchise,
        });
        push = { response: result.response, condition: result.condition };
      } catch (err: any) {
        push = { error: err?.message || "falha ao enviar push" };
      }
    }

    return { notification, push };
  }
}

export default new NotificationService();
