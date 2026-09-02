import mongoose from 'mongoose';
import { FranchiseModel } from '../models/Franchise';
import { CompanyModel } from '../models/Company';
import { AppError } from '../middleware/errorHandler';

interface PaginationQuery {
  page?: string;
  limit?: string;
  pageIn?: string;
  pageOut?: string;
  name?: string;
  email?: string;
  status?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export class FranchiseService {
  // ---------- List / Paginator / Search ----------

  async list(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);

    if (query.name && query.name.trim()) filter.name = { $regex: query.name.trim(), $options: 'i' };
    if (query.email && query.email.trim()) filter.email = { $regex: query.email.trim(), $options: 'i' };
    if (query.status === 'true' || query.status === 'false') filter.status = query.status === 'true';

    const [data, total] = await Promise.all([
      FranchiseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FranchiseModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async paginator(query: PaginationQuery) {
    const pageIn = Math.max(0, parseInt(String(query.pageIn ?? 0), 10));
    const pageOut = Math.max(1, parseInt(String(query.pageOut ?? 20), 10));
    const filter: any = { deletedAt: { $exists: false } };

    if (query.name && query.name.trim()) filter.name = { $regex: query.name.trim(), $options: 'i' };
    if (query.email && query.email.trim()) filter.email = { $regex: query.email.trim(), $options: 'i' };
    if (query.status === 'true' || query.status === 'false') filter.status = query.status === 'true';

    const list = await FranchiseModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'settingCity',
          let: { city: '$city' },
          as: 'city',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$city'] } } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'settingState',
          let: { state: '$state' },
          as: 'state',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$state'] } } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: pageIn * pageOut },
      { $limit: pageOut },
    ]);

    const total = await FranchiseModel.countDocuments(filter);
    return { list, total };
  }

  async listAll() {
    return FranchiseModel.find().sort({ name: 1 });
  }

  async search(query: { search?: string }) {
    const filter: any = { deletedAt: { $exists: false } };
    if (query.search && typeof query.search === 'string') {
      filter.name = { $regex: '.*' + query.search.toLowerCase() + '.*', $options: 'i' };
    }

    const list = await FranchiseModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'settingState',
          let: { state: '$state' },
          as: 'state',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$state'] } } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'settingCity',
          let: { city: '$city' },
          as: 'city',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$city'] } } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
      { $project: { name: 1, type: 1, state: 1, city: 1 } },
    ]);

    return list;
  }

  async get(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Franquia inválida', 400);
    const doc = await FranchiseModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!doc) throw new AppError('Franquia não encontrada', 404);
    return doc;
  }

  // ---------- CRUD ----------

  async create(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido', 400);
    if (!data.companyName) throw new AppError('Informe a razão social', 400);
    if (!data.email) throw new AppError('Informe um e-mail válido', 400);

    const emailResp = await FranchiseModel.findOne({ email: data.email, deletedAt: { $exists: false } }).lean();
    if (emailResp) throw new AppError('Email já se encontra cadastrado', 400);

    if (data.createAccount) delete data.createAccount;
    if (data.file) delete data.file;
    if (data._id) delete data._id;

    if (data.bankData && data.bankData.pixType === null) delete data.bankData.pixType;

    data.showPhoneRace = {
      driver: data?.showPhoneDriver === true || data?.showPhoneDriver === 'true' ? true : false,
      passenger: data?.showPhonePassenger === true || data?.showPhonePassenger === 'true' ? true : false,
    };

    const franchise = await FranchiseModel.create(data);
    return franchise;
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Franquia inválida', 400);

    if (data.status === 'true' || data.status === 'false') data.status = data.status === 'true';
    if (data.file) delete data.file;

    data.showPhoneRace = {
      driver: data?.showPhoneDriver === true || data?.showPhoneDriver === 'true' ? true : false,
      passenger: data?.showPhonePassenger === true || data?.showPhonePassenger === 'true' ? true : false,
    };

    const doc = await FranchiseModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError('Franquia não encontrada', 404);
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Franquia inválida', 400);
    const doc = await FranchiseModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!doc) throw new AppError('Franquia não encontrada', 404);
    return doc;
  }

  // ---------- Config ----------

  async configurations(companyId: string) {
    if (!mongoose.isValidObjectId(companyId)) throw new AppError('Informe uma empresa válida', 400);
    const company = await CompanyModel.findById(companyId).lean();
    const payload: any = { activateTip: false };

    if (company && (company as any).franchise) {
      const franchise = await FranchiseModel.findById((company as any).franchise).lean();
      if (franchise) payload.activateTip = franchise.activateTip ? true : false;
    }

    return payload;
  }
}

export default new FranchiseService();