import mongoose from 'mongoose';
import { CouponModel } from '../models/Coupon';
import { CompanyCouponModel } from '../models/CompanyCoupon';
import { CouponCustomerModel } from '../models/CouponCustomer';
import { AppError } from '../middleware/errorHandler';

interface PaginationQuery {
  page?: string;
  limit?: string;
  name?: string;
  status?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export class CouponService {
  // ---------- CRUD ----------

  async list(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);
    if (query.name && query.name.trim()) filter.name = { $regex: query.name.trim(), $options: 'i' };
    if (query.status === 'true' || query.status === 'false') filter.status = query.status === 'true';

    const [data, total] = await Promise.all([
      CouponModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CouponModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Cupom inválido', 400);
    const doc = await CouponModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!doc) throw new AppError('Cupom não encontrado', 404);
    return doc;
  }

  async create(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido', 400);
    if (!data.allCompanies && (!Array.isArray(data.companies) || data.companies.length <= 0)) {
      throw new AppError('Informe pelo menos uma empresa, ou marque a opção todas as empresas', 400);
    }

    if (typeof data.status === 'string' && (data.status === '' || data.status === null)) data.status = false;
    if (data.onlyFirstPurchase === '' || data.onlyFirstPurchase === null) data.onlyFirstPurchase = false;
    if (data._id) delete data._id;

    const coupon = await CouponModel.create(data);

    if (Array.isArray(data.companies)) {
      const companies = (data.companies as any[]).filter((i: any) => i !== '' && i !== null && i !== undefined);
      if (companies.length > 0) {
        await CompanyCouponModel.create({ coupon: coupon._id, companies });
      }
    }
    return coupon;
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Cupom inválido', 400);
    const doc = await CouponModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError('Cupom não encontrado', 404);

    if (Array.isArray(data.companies)) {
      const companies = (data.companies as any[]).filter((i: any) => i !== '' && i !== null && i !== undefined);
      await CompanyCouponModel.findOneAndUpdate(
        { coupon: doc._id },
        { coupon: doc._id, companies },
        { new: true, upsert: true }
      );
    }
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Cupom inválido', 400);
    const doc = await CouponModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) throw new AppError('Cupom não encontrado', 404);
    return doc;
  }

  // ---------- Display / High / Companies ----------

  buildDateFilter(dateInit?: string, dateFinish?: string) {
    const today = new Date();
    const start = dateInit ? new Date(dateInit) : new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = dateFinish ? new Date(dateFinish) : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return {
      dateInit: { $lte: start },
      dateFinish: { $gte: end },
    };
  }

  async display(query: any) {
    const filter: any = {};
    if (query.status) filter.status = query.status === 'true';

    let couponCustomerIds: mongoose.Types.ObjectId[] = [];
    if (query.person && mongoose.isValidObjectId(query.person)) {
      const rows = await CouponCustomerModel.find({ person: query.person }, { coupon: 1 }).lean();
      couponCustomerIds = rows.map((r: any) => r.coupon);
    }

    Object.assign(filter, this.buildDateFilter(query.dateInit, query.dateFinish));
    filter.deletedAt = { $exists: false };
    if (couponCustomerIds.length > 0) filter._id = { $nin: couponCustomerIds };

    return CouponModel.find(filter).lean();
  }

  async highCupon() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return CouponModel.findOne({
      dateInit: { $lte: start },
      dateFinish: { $gte: end },
      status: true,
      deletedAt: { $exists: false },
    }).sort('-price');
  }

  async companyCoupons(companyId: string) {
    if (!mongoose.isValidObjectId(companyId)) throw new AppError('Informe uma empresa válida', 400);
    const couponCompanies = await CompanyCouponModel.find({ companies: { $in: companyId } }).select({ coupon: 1 }).lean();
    const couponIds = couponCompanies.map((c: any) => c.coupon);

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const list = await CouponModel.aggregate([
      {
        $match: {
          status: true,
          deletedAt: { $exists: false },
          dateInit: { $lte: start },
          dateFinish: { $gte: end },
          $or: [{ allCompanies: true }, { _id: { $in: couponIds } }],
        },
      },
      {
        $lookup: {
          from: 'company_coupon',
          let: { couponId: '$_id' },
          as: 'couponCompany',
          pipeline: [{ $match: { $expr: { $eq: ['$coupon', '$$couponId'] } } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$couponCompany', preserveNullAndEmptyArrays: true } },
    ]);
    return list;
  }

  // ---------- Usage (CouponCustomer) ----------

  async couponCustomer(query: { coupon?: string; person?: string }) {
    const filter: any = {};
    if (query.coupon && mongoose.isValidObjectId(query.coupon)) filter.coupon = query.coupon;
    if (query.person && mongoose.isValidObjectId(query.person)) filter.person = query.person;
    return CouponCustomerModel.find(filter).sort({ createdAt: -1 }).limit(100);
  }

  async couponCustomerPaginator(query: any) {
    const pageIn = parseInt(String(query.pageIn ?? 0), 10);
    const pageOut = Math.max(1, parseInt(String(query.pageOut ?? 20), 10));
    const filter: any = {};
    if (query.coupon && mongoose.isValidObjectId(query.coupon)) filter.coupon = new mongoose.Types.ObjectId(query.coupon);

    const list = await CouponCustomerModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'coupon',
          let: { id: '$coupon' },
          as: 'coupon',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$id'] } } }, { $project: { name: 1, discountPercentage: 1, deletedAt: 1 } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ 'coupon.deletedAt': { $exists: false } }, { coupon: { $eq: null } }] } },
      {
        $lookup: {
          from: 'users',
          let: { id: '$customer' },
          as: 'customer',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$id'] } } }, { $project: { name: 1, email: 1, phone: 1 } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'companies',
          let: { id: '$company' },
          as: 'company',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$id'] } } }, { $project: { name: 1 } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $limit: pageOut },
      { $skip: pageIn * pageOut },
    ]);

    return list;
  }
}

export default new CouponService();
