import mongoose from 'mongoose';
import { EvaluationModel } from '../models/Evaluation';
import { DriverModel } from '../models/Driver';
import { PassengerModel } from '../models/Passenger';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function paginator(from: number, size: number) {
  return { from, size };
}

export class MobilityEvaluationService {
  async create(data: {
    typeEvaluator: string;
    typeRated: string;
    idEvaluator: string;
    idRated: string;
    paymentDriver?: string;
    stars: number;
    description?: string;
  }) {
    if (!data.typeEvaluator || !data.typeRated || !data.idEvaluator || !data.idRated || !data.stars) {
      throw new AppError('Campos obrigatórios não informados', 400);
    }
    if (!['passenger', 'driver'].includes(data.typeEvaluator) || !['passenger', 'driver'].includes(data.typeRated)) {
      throw new AppError('Tipo inválido para evaluator/rated', 400);
    }
    if (data.stars < 1 || data.stars > 5) {
      throw new AppError('Estrelas devem ser entre 1 e 5', 400);
    }

    const evaluation = await EvaluationModel.create({
      typeEvaluator: data.typeEvaluator,
      typeRated: data.typeRated,
      idEvaluator: data.idEvaluator,
      idRated: data.idRated,
      paymentDriver: data.paymentDriver || undefined,
      stars: data.stars,
      description: data.description || '',
    });

    if (!evaluation || !evaluation._id) {
      throw new AppError('Não foi possível registrar a avaliação', 400);
    }

    if (data.typeEvaluator === 'passenger') {
      await this.updateDriverRating(data.idRated, data.stars);
    }
    if (data.typeEvaluator === 'driver') {
      await this.updatePassengerRating(data.idRated, data.stars);
    }

    return evaluation;
  }

  private async updateDriverRating(idDriver: string, star: number) {
    const driver = await DriverModel.findById(idDriver).select('rating').lean();
    if (!driver) return;

    const totalRating = (driver as any).rating?.totalRating || 0;
    const totalStars = (driver as any).rating?.totalStars || 0;
    const nextTotalRating = totalRating + 1;
    const nextTotalStars = totalStars + star;
    const nextStars = nextTotalStars / nextTotalRating;

    await DriverModel.updateOne(
      { _id: idDriver },
      {
        rating: Math.round(nextStars * 10) / 10,
      }
    );
  }

  private async updatePassengerRating(idPassenger: string, star: number) {
    const passenger = await PassengerModel.findById(idPassenger).select('rating').lean();
    if (!passenger) return;

    const totalRating = (passenger as any).rating?.totalRating || 0;
    const totalStars = (passenger as any).rating?.totalStars || 0;
    const nextTotalRating = totalRating + 1;
    const nextTotalStars = totalStars + star;
    const nextStars = nextTotalStars / nextTotalRating;

    await PassengerModel.updateOne(
      { _id: idPassenger },
      {
        stars: Math.round(nextStars * 10) / 10,
        rating: {
          totalRating: nextTotalRating,
          totalStars: nextTotalStars,
        },
      }
    );
  }

  async listEvaluationsByPassenger(query: any) {
    const pageIn = parseInt(query.pageIn) || 1;
    const pageOut = parseInt(query.pageOut) || 20;

    const filter: any = {
      typeEvaluator: 'passenger',
      typeRated: 'driver',
    };

    const pipeline: any[] = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'passenger',
          let: { id: '$idEvaluator' },
          as: 'passenger',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $project: { person: 1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'person',
                let: { id: '$person' },
                as: 'person',
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
                  { $project: { name: 1, phone: 1, email: 1 } },
                  { $limit: 1 },
                ],
              },
            },
            { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $unwind: { path: '$passenger', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'driver',
          let: { id: '$idRated' },
          as: 'driver',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      { $skip: (pageIn < 1 ? 1 : pageIn - 1) * pageOut },
      { $limit: pageOut > 150 ? 150 : pageOut },
    ];

    const list = await EvaluationModel.aggregate(pipeline);
    const total = await EvaluationModel.countDocuments(filter);
    return { list, total };
  }

  async getAverageRating(idRated: string) {
    if (!isObjectId(idRated)) {
      throw new AppError('ID inválido', 400);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startOfDay = new Date(sixMonthsAgo);
    startOfDay.setHours(0, 0, 0, 0);

    const result = await EvaluationModel.aggregate([
      {
        $match: {
          idRated: new mongoose.Types.ObjectId(idRated),
          createdAt: { $gte: startOfDay },
        },
      },
      {
        $group: {
          _id: '$idRated',
          totalRating: { $sum: '$stars' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          totalRating: 1,
          count: 1,
          mediaRating: { $divide: ['$totalRating', '$count'] },
        },
      },
    ]);

    return result && result.length > 0 ? result[0] : null;
  }

  async paginateEvaluationsByDriver(query: any) {
    const pageIn = parseInt(query.pageIn) || 1;
    const pageOut = parseInt(query.pageOut) || 20;
    const limit = parseInt(query.limit) || 20;
    const { driver, passenger } = query;

    const filter: any = {
      typeEvaluator: 'driver',
      typeRated: 'passenger',
    };

    const matchExtra: any = {};

    if (driver && isObjectId(driver)) {
      matchExtra['driver._id'] = new mongoose.Types.ObjectId(driver);
    }
    if (passenger && isObjectId(passenger)) {
      matchExtra['passenger._id'] = new mongoose.Types.ObjectId(passenger);
    }

    const pipeline: any[] = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'passenger',
          let: { id: '$idRated' },
          as: 'passenger',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $project: { person: 1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'person',
                let: { id: '$person' },
                as: 'person',
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
                  { $project: { name: 1, phone: 1, email: 1 } },
                  { $limit: 1 },
                ],
              },
            },
            { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $unwind: { path: '$passenger', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'driver',
          let: { id: '$idEvaluator' },
          as: 'driver',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    ];

    if (Object.keys(matchExtra).length > 0) {
      pipeline.push({ $match: matchExtra });
    }

    pipeline.push({ $skip: (pageIn - 1) * pageOut });
    pipeline.push({ $limit: limit });

    const list = await EvaluationModel.aggregate(pipeline);
    const total = await EvaluationModel.countDocuments(filter);
    return { list, total };
  }
}

export default new MobilityEvaluationService();
