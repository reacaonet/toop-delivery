import mongoose from 'mongoose';
import { PackingModel } from '../models/Packing';
import { AppError } from '../middleware/errorHandler';

interface PaginationQuery {
  page?: string;
  limit?: string;
  name?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export class PackingService {
  async list(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);
    if (query.name && query.name.trim()) filter.name = { $regex: query.name.trim(), $options: 'i' };

    const [data, total] = await Promise.all([
      PackingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PackingModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async listAll() {
    return PackingModel.find({ deletedAt: { $exists: false } }).sort({ name: 1 });
  }

  async listByName(name: string) {
    if (!name || typeof name !== 'string') return [];
    return PackingModel.find(
      { name: { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' }, deletedAt: { $exists: false } },
      { name: 1 }
    );
  }

  async get(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Embalagem inválida', 400);
    const doc = await PackingModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!doc) throw new AppError('Embalagem não encontrada', 404);
    return doc;
  }

  async create(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido', 400);
    if (typeof data.status === 'string' && (data.status === '' || data.status === null)) data.status = false;
    return PackingModel.create(data);
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Embalagem inválida', 400);
    if (typeof data.status === 'string' && (data.status === '' || data.status === null)) data.status = false;
    const doc = await PackingModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError('Embalagem não encontrada', 404);
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Embalagem inválida', 400);
    const doc = await PackingModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) throw new AppError('Embalagem não encontrada', 404);
    return doc;
  }
}

export default new PackingService();
