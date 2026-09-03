import mongoose from 'mongoose';
import { PeakHourModel } from '../models/PeakHour';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class PeakHourService {
  async listAll() {
    return PeakHourModel.find();
  }

  async paginator(query: any) {
    const { pageIn, pageOut, franchise, start, end, status } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = { deletedAt: { $exists: false } };

    if (start) filter.start = start;
    if (end) filter.end = end;
    if (franchise) filter.franchise = franchise;

    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== 'all') {
      filter.status = { $eq: true };
    }

    const list = await PeakHourModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'franchise',
          localField: 'franchise',
          foreignField: '_id',
          as: 'franchise',
        },
      },
      { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
      { $skip: from * size },
      { $limit: size },
    ]);
    const total = await PeakHourModel.find(filter).countDocuments();

    return { list, total };
  }

  async listById(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const item = await PeakHourModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!item) {
      throw new AppError('Registro não encontrado', 404);
    }
    return item;
  }

  async listFiltered(query: any) {
    const { id, franchise, start, end, status } = query;

    if (id && !isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }

    const filter: any = { deletedAt: { $exists: false } };

    if (id) {
      filter._id = id;
    }

    if (start) filter.start = start;
    if (end) filter.end = end;
    if (franchise) filter.franchise = franchise;

    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== 'all') {
      filter.status = { $eq: true };
    }

    return PeakHourModel.find(filter);
  }

  async create(data: any) {
    if (!data.franchise || !isObjectId(data.franchise)) {
      throw new AppError('Id da Franquia é inválido', 400);
    }
    if (!data.start || !data.end) {
      throw new AppError('Informe os horários start e end', 400);
    }
    data.status = true;
    return PeakHourModel.create(data);
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    data.status = (typeof data.status === 'string' && data.status === '') || data.status === null ? false : data.status;
    const updated = await PeakHourModel.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true });
    if (!updated) {
      throw new AppError('Registro não encontrado', 404);
    }
    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const removed = await PeakHourModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!removed) {
      throw new AppError('Registro não encontrado', 404);
    }
    return removed;
  }
}

export default new PeakHourService();
