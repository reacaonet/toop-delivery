import mongoose from 'mongoose';
import { ShopperModel } from '../models/Shopper';
import { AppError } from '../middleware/errorHandler';

interface PaginationQuery {
  page?: string;
  limit?: string;
  person?: string;
  isOnline?: string;
  company?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

function normalizeBoolean(value: any) {
  return typeof value === 'string' && (value === '' || value === null) ? false : value;
}

export class ShopperService {
  async list(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);

    if (query.person && mongoose.isValidObjectId(query.person)) filter.person = query.person;
    if (query.company && mongoose.isValidObjectId(query.company)) filter.company = query.company;
    if (query.isOnline === 'true' || query.isOnline === 'false') filter.isOnline = query.isOnline === 'true';

    const [data, total] = await Promise.all([
      ShopperModel.find(filter)
        .populate('company', 'name')
        .populate('person', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ShopperModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async listControllers(query: any) {
    const filter: any = { deletedAt: { $exists: false } };
    if (query.person && mongoose.isValidObjectId(query.person)) filter.person = query.person;
    if (query.company && mongoose.isValidObjectId(query.company)) filter.company = query.company;
    if (query.isOnline === 'true' || query.isOnline === 'false') filter.isOnline = query.isOnline === 'true';
    return ShopperModel.find(filter).populate('company', 'name').populate('person', 'name email phone');
  }

  async search(query: { person?: string; company?: string }) {
    const or: any[] = [];
    if (query.person) or.push({ person: query.person });
    if (query.company) or.push({ company: query.company });
    if (!or.length) throw new AppError('Filtro é obrigatório', 400);
    return ShopperModel.find({
      $or: or,
      deletedAt: { $exists: false },
    }).lean();
  }

  async get(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Shopper inválido', 400);
    const doc = await ShopperModel.findOne({ _id: id, deletedAt: { $exists: false } })
      .populate('company', 'name')
      .populate('person', 'name email phone');
    if (!doc) throw new AppError('Shopper não encontrado', 404);
    return doc;
  }

  async create(data: any) {
    if (!data.company) throw new AppError('Informe uma empresa válida', 400);
    data.isOnline = normalizeBoolean(data.isOnline);
    data.status = normalizeBoolean(data.status);
    if (data._id) delete data._id;
    const shopper = await ShopperModel.create(data);
    return ShopperModel.populate(shopper, [
      { path: 'company', select: 'name' },
      { path: 'person', select: 'name email phone' },
    ]);
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Shopper inválido', 400);
    data.isOnline = normalizeBoolean(data.isOnline);
    data.status = normalizeBoolean(data.status);
    const doc = await ShopperModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    )
      .populate('company', 'name')
      .populate('person', 'name email phone');
    if (!doc) throw new AppError('Shopper não encontrado', 404);
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Shopper inválido', 400);
    const doc = await ShopperModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!doc) throw new AppError('Shopper não encontrado', 404);
    return doc;
  }
}

export default new ShopperService();
