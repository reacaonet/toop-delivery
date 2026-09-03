import mongoose from 'mongoose';
import { PushNotificationModel } from '../models/PushNotification';
import { AppError } from '../middleware/errorHandler';

export class MobilityPushNotificationService {
  async paginator(query: any, auth: any) {
    const { pageIn, pageOut, topic, franchise } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = {};

    if (auth?.isFranchise && auth?.franchise) {
      filter.franchise = new mongoose.Types.ObjectId(auth.franchise);
    }
    if (topic) filter.topic = topic;
    if (franchise) filter.franchise = new mongoose.Types.ObjectId(franchise);

    const [list, total] = await Promise.all([
      PushNotificationModel.aggregate([
        { $match: filter },
        { $lookup: { from: 'franchise', localField: 'franchise', foreignField: '_id', as: 'franchise' } },
        { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        { $skip: from * size },
        { $limit: size },
      ]),
      PushNotificationModel.countDocuments(filter),
    ]);

    return { list, total };
  }

  async create(data: any) {
    const { franchise, title, message, user = null, topic = null } = data;

    if (!topic && !user) {
      throw new AppError('Insira um tópico de envio ou um usuário', 400);
    }

    const payload: any = { franchise, title, message };
    if (user) payload.user = user;
    if (topic) payload.topic = topic;

    const response = await PushNotificationModel.create(payload);

    if (topic) {
      try {
        const notificationTopicService = (await import('./notification-topic.service')).default;
        await notificationTopicService.send({ franchise, topic, title, subject: message });
        await PushNotificationModel.updateOne({ _id: response._id }, { status: 'success' });
      } catch (err: any) {
        await PushNotificationModel.updateOne({ _id: response._id }, { status: 'error', errMessage: err.message });
      }
      return { message: 'Push Notification Tópico enviado' };
    }

    if (!user || !user.token) {
      throw new AppError('Insira um usuário para envio da notificação', 400);
    }

    return { message: 'Push Notification Registrado' };
  }
}

export default new MobilityPushNotificationService();
