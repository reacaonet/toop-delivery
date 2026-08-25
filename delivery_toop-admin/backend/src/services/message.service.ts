import { MessageModel } from "../models/Message";
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

export class MessageService {
  async send(data: {
    bookingId: string;
    senderId: string;
    senderModel: 'User' | 'Driver';
    content: string;
  }) {
    const message = await MessageModel.create({
      booking: data.bookingId,
      sender: data.senderId,
      senderModel: data.senderModel,
      content: data.content,
    });

    return MessageModel.findById(message._id)
      .populate('sender', 'name avatar');
  }

  async getByBooking(
    bookingId: string,
    query: PaginationQuery
  ): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      MessageModel.find({ booking: bookingId })
        .populate('sender', 'name avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      MessageModel.countDocuments({ booking: bookingId }),
    ]);

    return {
      data: data.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async markAsRead(bookingId: string, userId: string) {
    await MessageModel.updateMany(
      {
        booking: bookingId,
        sender: { $ne: userId },
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );
  }

  async getUnreadCount(bookingId: string, userId: string) {
    const count = await MessageModel.countDocuments({
      booking: bookingId,
      sender: { $ne: userId },
      read: false,
    });

    return { unreadCount: count };
  }
}

export default new MessageService();
