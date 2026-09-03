import firebaseTopicService from './notification-topic.service';
import getFirebaseAdmin from './firebaseAdmin.service';
import { AppError } from '../middleware/errorHandler';

export class MobilityTopicService {
  async create(params: { token: string; topics: any[]; unsubscribeTopic?: any[] }) {
    return firebaseTopicService.create(params);
  }

  async send(params: { topic: string; title: string; subject: string; franchise?: string | number; priority?: string }) {
    return firebaseTopicService.send(params);
  }

  async linkUserTopics() {
    const fcm = await getFirebaseAdmin();
    if (!fcm) throw new AppError('FCM não configurado', 400);
    const { messaging } = fcm;

    const DriverModel = (await import('../models/Driver')).DriverModel;
    const driverList = await (DriverModel as any).aggregate([
      {
        $match: {
          franchise: { $exists: true },
          token: { $exists: true },
          $or: [{ topics: { $exists: false } }, { topics: { $eq: [] } }],
        },
      },
      { $project: { _id: 1, franchise: 1, token: 1 } },
    ]);

    const driverErr = await this.addUsersToTopic(driverList, 'driver', DriverModel, messaging);

    const PassengerModel = (await import('../models/Passenger')).PassengerModel;
    const passengerList = await (PassengerModel as any).aggregate([
      {
        $match: {
          franchise: { $exists: true },
          token: { $exists: true },
          $or: [{ topics: { $exists: false } }, { topics: { $eq: [] } }],
        },
      },
      { $project: { _id: 1, franchise: 1, token: 1 } },
    ]);

    const passengerErr = await this.addUsersToTopic(passengerList, 'passenger', PassengerModel, messaging);

    return { driverErr, passengerErr };
  }

  private async addUsersToTopic(users: any[], mainTopic: string, userModel: any, messaging: any) {
    const userErrors: any[] = [];
    if (!mainTopic || !users || !Array.isArray(users) || users.length === 0) return userErrors;

    for (const user of users) {
      try {
        if (Array.isArray(user.topics) && user.topics.length > 0) continue;
        await this.addUserToTopic(user, mainTopic, userModel, messaging);
      } catch {
        userErrors.push(user._id);
      }
    }

    return userErrors;
  }

  private async addUserToTopic(user: any, mainTopic: string, userModel: any, messaging: any) {
    await messaging.subscribeToTopic(user.token, mainTopic);
    await messaging.subscribeToTopic(user.token, 'application_root');
    await messaging.subscribeToTopic(user.token, `franchise_${user.franchise}`);
    await userModel.updateOne(
      { _id: user._id },
      { topics: [mainTopic, 'application_root', `franchise_${user.franchise}`] }
    );
  }
}

export default new MobilityTopicService();
