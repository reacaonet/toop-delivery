import mongoose from 'mongoose';
import { MobilityNotificationModel } from '../models/MobilityNotification';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class MobilityNotificationService {
  async listAll() {
    return MobilityNotificationModel.find();
  }

  async list(id?: string, query?: any) {
    const filter: any = {};

    if (id) {
      if (!isObjectId(id)) throw new AppError('Id inválido', 400);
      filter._id = id;
    }

    if (query?.type) filter.type = query.type;
    if (query?.franchise) filter.franchise = query.franchise;

    filter.deletedAt = { $exists: false };

    return MobilityNotificationModel.find(filter);
  }

  async listById(id: string) {
    if (!isObjectId(id)) throw new AppError('Id inválido', 400);
    const doc = await MobilityNotificationModel.findById(id);
    if (!doc) throw new AppError('Registro não encontrado', 404);
    return doc;
  }

  async paginator(query: any) {
    const { pageIn, pageOut, type, franchise } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = {};

    if (type) filter.type = type;
    if (franchise) filter.franchise = new mongoose.Types.ObjectId(franchise);
    filter.deletedAt = { $exists: false };

    const [list, total] = await Promise.all([
      MobilityNotificationModel.aggregate([
        { $match: filter },
        { $lookup: { from: 'franchise', localField: 'franchise', foreignField: '_id', as: 'franchise' } },
        { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
        { $skip: from * size },
        { $limit: size },
      ]),
      MobilityNotificationModel.countDocuments(filter),
    ]);

    return { list, total };
  }

  async graph() {
    const timezone = 'America/Sao_Paulo';

    const list = await MobilityNotificationModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: { date: '$createdAt', timezone } },
            day: { $dayOfMonth: { date: '$createdAt', timezone } },
            year: { $year: { date: '$createdAt', timezone } },
          },
          enable: { $sum: { $cond: ['$status', 1, 0] } },
          disabled: { $sum: { $cond: ['$status', 0, 1] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]).limit(14);

    const total = await MobilityNotificationModel.aggregate([
      {
        $group: {
          _id: 'id',
          enable: { $sum: { $cond: ['$status', 1, 0] } },
          disabled: { $sum: { $cond: ['$status', 0, 1] } },
          total: { $sum: 1 },
        },
      },
    ]);

    const newList: any[] = [];
    let setEnable = total[0]?.enable || 0;
    let setDisabled = total[0]?.disabled || 0;
    let setTotal = total[0]?.total || 0;

    list.forEach((graph: any, i: number) => {
      if (i === 0) {
        newList.push({
          _id: { month: graph._id.month, day: graph._id.day, year: graph._id.year },
          enable: setEnable,
          disabled: setDisabled,
          total: setTotal,
        });
      } else {
        setEnable = setEnable - graph.enable;
        setDisabled = setDisabled - graph.disabled;
        setTotal = setTotal - graph.total;
        newList.push({
          _id: { month: graph._id.month, day: graph._id.day, year: graph._id.year },
          enable: setEnable,
          disabled: setDisabled,
          total: setTotal,
        });
      }
    });

    return newList;
  }

  async search(query: any) {
    const { search } = query;
    if (!search || typeof search !== 'string') return [];

    return MobilityNotificationModel.find(
      {
        description: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' },
        deletedAt: { $exists: false },
      },
      { description: 1, type: 1 }
    );
  }

  async create(data: any) {
    data.status = true;
    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach((item: any) => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }
    delete data.file;
    delete data.url;
    return MobilityNotificationModel.create(data);
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) throw new AppError('Id inválido', 400);
    const updated = await MobilityNotificationModel.findOneAndUpdate({ _id: id }, data, { new: true });
    if (!updated) throw new AppError('Registro não encontrado', 404);
    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) throw new AppError('Id inválido', 400);
    const updated = await MobilityNotificationModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!updated) throw new AppError('Registro não encontrado', 404);
    return updated;
  }
}

export default new MobilityNotificationService();
