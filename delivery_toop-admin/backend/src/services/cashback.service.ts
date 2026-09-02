import mongoose from 'mongoose';
import { CashbackCampaignModel } from '../models/CashbackCampaign';
import { CashbackCustomerModel } from '../models/CashbackCustomer';
import { CashbackCustomerBalanceModel } from '../models/CashbackCustomerBalance';
import { AppError } from '../middleware/errorHandler';

interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  name?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export class CashbackService {
  // ---------- Campaigns ----------

  async listAllCampaigns() {
    return CashbackCampaignModel.find({ deletedAt: { $exists: false } })
      .populate('companies')
      .sort({ createdAt: -1 });
  }

  async listCampaigns(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);

    if (query.name && query.name.trim()) {
      filter.name = { $regex: query.name.trim(), $options: 'i' };
    }
    if (query.status === 'true' || query.status === 'false') {
      filter.status = query.status === 'true';
    } else if (query.status && query.status !== 'all') {
      filter.status = true;
    }

    const [data, total] = await Promise.all([
      CashbackCampaignModel.find(filter)
        .populate('companies')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CashbackCampaignModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getCampaign(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Campanha inválida', 400);
    const doc = await CashbackCampaignModel.findOne({ _id: id, deletedAt: { $exists: false } }).populate('companies');
    if (!doc) throw new AppError('Campanha não encontrada', 404);
    return doc;
  }

  async createCampaign(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido', 400);
    if (data.percent === undefined || data.percent === null) throw new AppError('Informe a % de cashback', 400);
    if (data.amount === undefined || data.amount === null) throw new AppError('Informe o valor provisionado para a campanha', 400);

    if (typeof data.status === 'string' && (data.status === '' || data.status === null)) data.status = false;
    if (data.status === 'true') data.status = true;
    if (data.status === 'false') data.status = false;

    if (data.companies) data.companies = (data.companies as any[]).filter((i: any) => i !== '' && i !== null && i !== undefined);
    if (data._id) delete data._id;

    data.balance = data.amount;

    return CashbackCampaignModel.create(data);
  }

  async updateCampaign(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Campanha inválida', 400);
    if (data.companies) data.companies = (data.companies as any[]).filter((i: any) => i !== '' && i !== null && i !== undefined);
    if (data.amount !== undefined && data.balance === undefined && (data.balanceAjuste !== true)) {
      data.balance = data.amount;
    }
    const doc = await CashbackCampaignModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError('Campanha não encontrada', 404);
    return doc;
  }

  async deleteCampaign(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Campanha inválida', 400);
    const doc = await CashbackCampaignModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) throw new AppError('Campanha não encontrada', 404);
    return doc;
  }

  // ---------- Customer ----------

  async listCustomer(customerId: string, pageIn = 1, pageOut = 100) {
    if (!mongoose.isValidObjectId(customerId)) throw new AppError('Informe um customer válido', 400);
    const skip = (Math.max(1, parseInt(String(pageIn), 10)) - 1) * Math.max(1, parseInt(String(pageOut), 10));
    return CashbackCustomerModel.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
      {
        $lookup: {
          from: 'orders',
          let: { id: '$order' },
          as: 'order',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $project: { orderNumber: 1, status: 1, createdAt: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Math.max(1, parseInt(String(pageOut), 10)) },
    ]);
  }

  async getBalance(customerId: string) {
    if (!mongoose.isValidObjectId(customerId)) throw new AppError('Informe um customer válido', 400);
    const balance = await CashbackCustomerBalanceModel.findOne({ customer: customerId }).sort({ createdAt: -1 });
    return { balance: balance?.cash ?? 0 };
  }

  async byMonthCustomer(customerId: string) {
    if (!mongoose.isValidObjectId(customerId)) throw new AppError('Informe um customer válido', 400);
    return CashbackCustomerBalanceModel.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: {
            year: { $year: { date: '$date', timezone: 'America/Sao_Paulo' } },
            month: { $month: { date: '$date', timezone: 'America/Sao_Paulo' } },
            cash: '$cash',
          },
          lastDate: { $max: '$date' },
        },
      },
    ]);
  }

  async usedPaginator(query: { pageIn?: string | number; pageOut?: string | number; campaign?: string }) {
    const pageIn = parseInt(String(query.pageIn ?? 0), 10);
    const pageOut = Math.max(1, parseInt(String(query.pageOut ?? 20), 10));
    const filter: any = {};
    if (query.campaign) {
      if (!mongoose.isValidObjectId(query.campaign)) throw new AppError('Informe uma campanha válida', 400);
      filter.campaign = new mongoose.Types.ObjectId(query.campaign);
    }

    const list = await CashbackCustomerModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          let: { id: '$customer' },
          as: 'customer',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $project: { name: 1, email: 1, phone: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'orders',
          let: { id: '$order' },
          as: 'order',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $project: { orderNumber: 1, status: 1, createdAt: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'cashback_campaign',
          let: { id: '$campaign' },
          as: 'campaign',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$id'] } } }, { $project: { name: 1, percent: 1 } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: '$campaign', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: pageIn * pageOut },
      { $limit: pageOut },
    ]);

    const total = await CashbackCustomerModel.countDocuments(filter);
    return { list, total };
  }
}

export default new CashbackService();
