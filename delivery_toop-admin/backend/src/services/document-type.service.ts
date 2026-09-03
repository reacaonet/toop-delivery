import mongoose from 'mongoose';
import { DocumentTypeModel } from '../models/DocumentType';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

const TIMEZONE = 'America/Sao_Paulo';

export class DocumentTypeService {
  async listAll() {
    return DocumentTypeModel.find();
  }

  async graphic() {
    const list = await DocumentTypeModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: { date: '$createdAt', timezone: TIMEZONE } },
            day: { $dayOfMonth: { date: '$createdAt', timezone: TIMEZONE } },
            year: { $year: { date: '$createdAt', timezone: TIMEZONE } },
          },
          enable: { $sum: { $cond: ['$status', 1, 0] } },
          disabled: { $sum: { $cond: ['$status', 0, 1] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]).limit(14);

    const total = await DocumentTypeModel.aggregate([
      {
        $group: {
          _id: 'id',
          enable: { $sum: { $cond: ['$status', 1, 0] } },
          disabled: { $sum: { $cond: ['$status', 0, 1] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    if (!total.length) return [];

    const newList: any[] = [];
    let setEnable = total[0].enable;
    let setDisabled = total[0].disabled;
    let setTotal = total[0].total;

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

  async paginator(query: any) {
    const { pageIn, pageOut, type, name, status } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = { deletedAt: { $exists: false } };

    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = { $regex: '.*' + decodeName.toLowerCase() + '.*', $options: 'i' };
    }

    if (type) {
      const decodeType = decodeURIComponent(type);
      filter.type = { $regex: '.*' + decodeType.toLowerCase() + '.*', $options: 'i' };
    }

    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== 'all') {
      filter.status = { $eq: true };
    }

    const list = await DocumentTypeModel.aggregate([
      { $match: filter },
      { $limit: size },
      { $skip: from * size },
    ]);
    const total = await DocumentTypeModel.find(filter).countDocuments();

    return { list, total };
  }

  async search(query: any) {
    const search = query.search;
    if (search && typeof search === 'string') {
      return DocumentTypeModel.find(
        {
          name: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' },
          deletedAt: { $exists: false },
        },
        { name: 1, type: 1 },
      );
    }
    return [];
  }

  async list(query: any) {
    const { id } = query;
    const { name, type, status } = query;

    if (id && !isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }

    const filter: any = { deletedAt: { $exists: false } };

    if (id) {
      filter._id = id;
    }

    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = { $regex: '.*' + decodeName.toLowerCase() + '.*', $options: 'i' };
    }

    if (type) {
      const decodeType = decodeURIComponent(type);
      filter.type = { $regex: '.*' + decodeType.toLowerCase() + '.*', $options: 'i' };
    }

    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== 'all') {
      filter.status = { $eq: true };
    }

    return DocumentTypeModel.find(filter);
  }

  async listById(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const item = await DocumentTypeModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!item) {
      throw new AppError('Registro não encontrado', 404);
    }
    return item;
  }

  async create(data: any) {
    if (!data.name) {
      throw new AppError('Informe o nome do tipo de documento', 400);
    }
    data.status = true;
    return DocumentTypeModel.create(data);
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    data.status = (typeof data.status === 'string' && data.status === '') || data.status === null ? false : data.status;
    const updated = await DocumentTypeModel.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true });
    if (!updated) {
      throw new AppError('Registro não encontrado', 404);
    }
    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const removed = await DocumentTypeModel.findByIdAndUpdate(
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

export default new DocumentTypeService();
