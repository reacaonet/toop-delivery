import { NotificationModel } from "../models/Notification";
import { AppError } from "../middleware/errorHandler";

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
}

export default new NotificationService();
