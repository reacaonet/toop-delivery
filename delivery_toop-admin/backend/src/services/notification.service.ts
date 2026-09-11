import { NotificationModel, INotification } from "../models/Notification";
import { UserModel } from "../models/User";
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

  private async resolveCompanyId(userId: string): Promise<string | null> {
    const user = await UserModel.findById(userId).lean();
    if (!user?.company) return null;
    return user.company.toString();
  }

  private buildVisibilityFilter(role: string, userId: string, companyId?: string | null): any {
    if (["admin", "manager", "operator"].includes(role)) {
      return {};
    }
    const or: any[] = [];
    if (role === "customer") {
      or.push({ target: "all" });
      or.push({ target: "users" });
      or.push({ targetId: userId });
    } else if (role === "deliveryman") {
      or.push({ target: "all" });
      or.push({ target: "deliverymen" });
      or.push({ targetId: userId });
    } else if (role === "store") {
      or.push({ target: "all" });
      or.push({ target: "companies" });
      if (companyId) or.push({ targetId: companyId });
      or.push({ targetId: userId });
    }
    return or.length > 0 ? { $or: or } : {};
  }

  async listForUser(userId: string, role: string, query: PaginationQuery): Promise<PaginatedResult> {
    const companyId = role === "store" ? await this.resolveCompanyId(userId) : null;
    const visibility = this.buildVisibilityFilter(role, userId, companyId);
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {
      ...visibility,
      dismissedBy: { $ne: userId },
    };

    const [rawData, total] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NotificationModel.countDocuments(filter),
    ]);

    const data = rawData.map((n) => {
      const obj = n.toObject();
      return { ...obj, read: (n.readBy || []).some((id) => id.toString() === userId) };
    });

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async unreadCount(userId: string, role: string): Promise<number> {
    const companyId = role === "store" ? await this.resolveCompanyId(userId) : null;
    const visibility = this.buildVisibilityFilter(role, userId, companyId);
    return NotificationModel.countDocuments({
      ...visibility,
      readBy: { $ne: userId },
      dismissedBy: { $ne: userId },
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
    if (!notification) throw new AppError("Notificação não encontrada", 404);
    return { ...notification.toObject(), read: true };
  }

  async markAllRead(userId: string, role: string) {
    const companyId = role === "store" ? await this.resolveCompanyId(userId) : null;
    const visibility = this.buildVisibilityFilter(role, userId, companyId);
    await NotificationModel.updateMany(
      { ...visibility, readBy: { $ne: userId }, dismissedBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    return { success: true };
  }

  async dismiss(id: string, userId: string) {
    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { $addToSet: { dismissedBy: userId } },
      { new: true }
    );
    if (!notification) throw new AppError("Notificação não encontrada", 404);
    return notification;
  }
}

export default new NotificationService();
