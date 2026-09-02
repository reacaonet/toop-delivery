import mongoose from 'mongoose';
import { GroupModel } from '../models/Group';
import { AppError } from '../middleware/errorHandler';

interface GroupQuery {
  page?: string;
  limit?: string;
  pageIn?: string;
  pageOut?: string;
  listPorNome?: string;
  franchise?: string;
}

function buildFilter(query: GroupQuery) {
  const filter: any = { deletedAt: { $exists: false } };
  if (query.franchise && query.franchise.trim()) filter.franchise = query.franchise;
  return filter;
}

export class GroupService {
  async list(query: GroupQuery) {
    const filter = buildFilter(query);
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10)));
    const [data, total] = await Promise.all([
      GroupModel.find(filter).populate({ path: 'franchise' }).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
      GroupModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async paginator(query: GroupQuery) {
    const pageIn = Math.max(0, parseInt(String(query.pageIn ?? 0), 10));
    const pageOut = Math.max(1, parseInt(String(query.pageOut ?? 20), 10));
    const filter = buildFilter(query);

    if (query.listPorNome && query.listPorNome.trim()) {
      filter.name = { $regex: '.*' + query.listPorNome.toLowerCase() + '.*', $options: 'i' };
    }

    const [list, total] = await Promise.all([
      GroupModel.find(filter).populate({ path: 'franchise' }).sort({ name: 1 }).skip(pageIn * pageOut).limit(pageOut),
      GroupModel.countDocuments(filter),
    ]);
    return { list, total };
  }

  async listPorNome(query: GroupQuery) {
    const search = (query.listPorNome || '').trim();
    if (!search) return [];
    const filter = buildFilter(query);
    return GroupModel.find({ ...filter, name: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' } }, { name: 1 })
      .populate({ path: 'franchise', select: { name: 1 } })
      .sort({ name: 1 });
  }

  async get(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Group inválido', 400);
    const doc = await GroupModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!doc) throw new AppError('Group não encontrado', 404);
    return doc;
  }

  async create(data: any) {
    data = { ...data };
    if (!data.name) throw new AppError('Informe um nome válido', 400);
    if (!data.description) throw new AppError('Informe a descrição', 400);
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    if (data.file) delete data.file;
    delete data._id;
    return GroupModel.create(data);
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Group inválido', 400);
    data = { ...data };
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    if (data.file) delete data.file;
    const doc = await GroupModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError('Group não encontrado', 404);
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Group inválido', 400);
    const doc = await GroupModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true });
    if (!doc) throw new AppError('Group não encontrado', 404);
    return doc;
  }
}

export default new GroupService();
