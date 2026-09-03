import mongoose from 'mongoose';
import { ChatRaceModel } from '../models/ChatRace';
import { AppError } from '../middleware/errorHandler';

export class MobilityMessageService {
  async listByBooking(booking: string) {
    if (!booking) return [];

    const response = await ChatRaceModel.aggregate([
      { $match: { booking: new mongoose.Types.ObjectId(booking) } },
      {
        $lookup: {
          from: 'passenger',
          let: { passenger: '$passenger' },
          as: 'passenger',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$passenger'] } } },
            { $project: { _id: 1, person: 1, stars: 1, rating: 1, franchise: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$passenger', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: 1 } },
    ]);

    return response;
  }

  async conversations(query: any) {
    const { passenger, driver } = query;

    if (passenger) {
      return this.conversationPassenger(passenger);
    }
    if (driver) {
      return this.conversationDriver(driver);
    }

    return [];
  }

  private async conversationPassenger(passengerId: string) {
    return ChatRaceModel.aggregate([
      { $match: { passenger: new mongoose.Types.ObjectId(passengerId) } },
      {
        $group: {
          _id: '$booking',
          driver: { $first: '$driver' },
          booking: { $first: '$booking' },
        },
      },
      {
        $lookup: {
          from: 'driver',
          let: { driver: '$driver' },
          as: 'driver',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$driver'] } } },
            {
              $project: {
                name: 1, timeZone: 1, selfiePhoto: 1, rating: 1, stars: 1,
                vehicleModel: 1, vehicleNameplate: 1, vehicleManufacturer: 1, vehicleColor: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    ]);
  }

  private async conversationDriver(driverId: string) {
    return ChatRaceModel.aggregate([
      { $match: { driver: new mongoose.Types.ObjectId(driverId) } },
      {
        $group: {
          _id: '$booking',
          passenger: { $first: '$passenger' },
          booking: { $first: '$booking' },
        },
      },
      {
        $lookup: {
          from: 'passenger',
          let: { id: '$passenger' },
          as: 'passenger',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'person',
                let: { id: '$person' },
                as: 'person',
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
                  { $project: { name: 1, phone: 1, email: 1, image: 1 } },
                  { $limit: 1 },
                ],
              },
            },
            { $project: { person: 1 } },
            { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $unwind: { path: '$passenger', preserveNullAndEmptyArrays: true } },
    ]);
  }

  async create(data: any) {
    if (!data.message || !data.booking) {
      throw new AppError('Informe mensagem e booking', 400);
    }
    return ChatRaceModel.create(data);
  }
}

export default new MobilityMessageService();
