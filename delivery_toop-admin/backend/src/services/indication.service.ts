import mongoose from 'mongoose';
import { IndicationModel } from '../models/Indication';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class IndicationService {
  async list(query: any) {
    const { personReceive } = query;

    if (!personReceive || !isObjectId(personReceive)) {
      throw new AppError('Informe uma pessoa válida', 400);
    }

    const filter = { personReceive: new mongoose.Types.ObjectId(personReceive) };

    const response = await IndicationModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'person',
          let: { person: '$person' },
          as: 'person',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$person'] } } },
            { $limit: 1 },
            { $project: { name: 1, image: 1 } },
          ],
        },
      },
      { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 40 },
    ]);

    return response;
  }
}

export default new IndicationService();
