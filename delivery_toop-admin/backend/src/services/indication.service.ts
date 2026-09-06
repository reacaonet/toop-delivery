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

  async paginator(query: any) {
    const page = parseInt(String(query.page ?? 0), 10);
    const limit = parseInt(String(query.limit ?? 20), 10);

    const lookup = (field: string) => ({
      $lookup: {
        from: 'person',
        let: { id: '$' + field },
        as: field,
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
          { $limit: 1 },
          { $project: { name: 1, email: 1, image: 1 } },
        ],
      },
    });

    const list = await IndicationModel.aggregate([
      lookup('person'),
      { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } },
      lookup('personReceive'),
      { $unwind: { path: '$personReceive', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: page * limit },
      { $limit: limit },
    ]);

    const total = await IndicationModel.estimatedDocumentCount();

    return { list, total };
  }
}

export default new IndicationService();
