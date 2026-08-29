import { CostCenterModel } from "../models/CostCenter";
import { TypePaymentModel } from "../models/TypePayment";
import { BankModel } from "../models/Bank";
import { AgencyModel } from "../models/Agency";
import { DigitalAccountModel, IExtractEntry } from "../models/DigitalAccount";
import { ChargebackModel } from "../models/Chargeback";
import { OrderModel } from "../models/Order";
import { PaymentModel } from "../models/Payment";
import { CompanyModel } from "../models/Company";
import { AppError } from "../middleware/errorHandler";
import mongoose from 'mongoose';

interface PaginationQuery {
  page?: string;
  limit?: string;
  company?: string;
  active?: string;
  agency?: string;
  bank?: string;
  status?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

function activeFilter(query: PaginationQuery) {
  const filter: any = {};
  if (query.company) filter.company = query.company;
  if (query.active === 'true') filter.active = true;
  if (query.active === 'false') filter.active = false;
  return filter;
}

async function paginate<T = any>(model: any, filter: any, sort: any, query: PaginationQuery) {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit),
    model.countDocuments(filter),
  ]);
  return { data, total, page, pages: Math.ceil(total / limit) };
}

export class FinanceService {
  // ---------- Cost Center ----------
  async createCostCenter(data: any) {
    return CostCenterModel.create(data);
  }

  async listCostCenters(query: PaginationQuery) {
    return paginate(CostCenterModel, activeFilter(query), { name: 1 }, query);
  }

  async getCostCenter(id: string) {
    const doc = await CostCenterModel.findById(id);
    if (!doc) throw new AppError("Centro de custo não encontrado", 404);
    return doc;
  }

  async updateCostCenter(id: string, data: any) {
    const doc = await CostCenterModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("Centro de custo não encontrado", 404);
    return doc;
  }

  async deleteCostCenter(id: string) {
    const doc = await CostCenterModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!doc) throw new AppError("Centro de custo não encontrado", 404);
    return doc;
  }

  // ---------- Type Payment ----------
  async createTypePayment(data: any) {
    return TypePaymentModel.create(data);
  }

  async listTypePayments(query: PaginationQuery) {
    return paginate(TypePaymentModel, activeFilter(query), { name: 1 }, query);
  }

  async getTypePayment(id: string) {
    const doc = await TypePaymentModel.findById(id);
    if (!doc) throw new AppError("Tipo de pagamento não encontrado", 404);
    return doc;
  }

  async updateTypePayment(id: string, data: any) {
    const doc = await TypePaymentModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("Tipo de pagamento não encontrado", 404);
    return doc;
  }

  async deleteTypePayment(id: string) {
    const doc = await TypePaymentModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!doc) throw new AppError("Tipo de pagamento não encontrado", 404);
    return doc;
  }

  // ---------- Bank ----------
  async createBank(data: any) {
    return BankModel.create(data);
  }

  async listBanks(query: PaginationQuery) {
    const filter: any = {};
    if (query.active === 'true') filter.active = true;
    if (query.active === 'false') filter.active = false;
    return paginate(BankModel, filter, { name: 1 }, query);
  }

  async getBank(id: string) {
    const doc = await BankModel.findById(id);
    if (!doc) throw new AppError("Banco não encontrado", 404);
    return doc;
  }

  async updateBank(id: string, data: any) {
    const doc = await BankModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("Banco não encontrado", 404);
    return doc;
  }

  async deleteBank(id: string) {
    const doc = await BankModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!doc) throw new AppError("Banco não encontrado", 404);
    return doc;
  }

  // ---------- Agency ----------
  async createAgency(data: any) {
    return AgencyModel.create(data);
  }

  async listAgencies(query: PaginationQuery) {
    const filter: any = {};
    if (query.active === 'true') filter.active = true;
    if (query.active === 'false') filter.active = false;
    if (query.bank) filter.bank = query.bank;
    return paginate(AgencyModel, filter, { name: 1 }, query);
  }

  async getAgency(id: string) {
    const doc = await AgencyModel.findById(id).populate('bank');
    if (!doc) throw new AppError("Agência não encontrada", 404);
    return doc;
  }

  async updateAgency(id: string, data: any) {
    const doc = await AgencyModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("Agência não encontrada", 404);
    return doc;
  }

  async deleteAgency(id: string) {
    const doc = await AgencyModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!doc) throw new AppError("Agência não encontrada", 404);
    return doc;
  }

  // ---------- Digital Account ----------
  async createDigitalAccount(data: any) {
    return DigitalAccountModel.create(data);
  }

  async listDigitalAccounts(query: PaginationQuery) {
    const filter: any = activeFilter(query);
    if (query.agency) filter.agency = query.agency;
    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      DigitalAccountModel.find(filter).populate('agency').sort({ createdAt: -1 }).skip(skip).limit(limit),
      DigitalAccountModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getDigitalAccount(id: string) {
    const doc = await DigitalAccountModel.findById(id).populate('agency');
    if (!doc) throw new AppError("Conta digital não encontrada", 404);
    return doc;
  }

  async getDigitalAccountBalance(id: string) {
    const doc = await DigitalAccountModel.findById(id);
    if (!doc) throw new AppError("Conta digital não encontrada", 404);
    const last = doc.extract[doc.extract.length - 1];
    return { balance: last ? last.balanceAfter : 0, extract: doc.extract.slice().reverse() };
  }

  async updateDigitalAccount(id: string, data: any) {
    const doc = await DigitalAccountModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("Conta digital não encontrada", 404);
    return doc;
  }

  async deleteDigitalAccount(id: string) {
    const doc = await DigitalAccountModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!doc) throw new AppError("Conta digital não encontrada", 404);
    return doc;
  }

  async moveDigitalAccount(id: string, data: { type: 'credit' | 'debit'; description: string; amount: number; reference?: string; referenceType?: string }) {
    const doc = await DigitalAccountModel.findById(id);
    if (!doc) throw new AppError("Conta digital não encontrada", 404);
    if (!data.type || !['credit', 'debit'].includes(data.type)) throw new AppError("Tipo inválido", 400);
    const amount = Number(data.amount);
    if (!amount || amount <= 0) throw new AppError("Valor inválido", 400);

    const currentBalance = doc.extract.length ? doc.extract[doc.extract.length - 1].balanceAfter : 0;
    const balanceAfter = data.type === 'credit' ? currentBalance + amount : currentBalance - amount;
    if (balanceAfter < 0) throw new AppError("Saldo insuficiente", 400);

    const entry: IExtractEntry = {
      type: data.type,
      description: data.description,
      amount,
      balanceAfter,
      reference: data.reference ? new mongoose.Types.ObjectId(data.reference) : undefined,
      referenceType: data.referenceType,
      createdAt: new Date(),
    };
    doc.extract.push(entry);
    await doc.save();
    return { balance: balanceAfter, entry };
  }

  // ---------- Chargeback ----------
  async createChargeback(data: any) {
    return ChargebackModel.create(data);
  }

  async listChargebacks(query: PaginationQuery) {
    const filter: any = {};
    if (query.company) filter.company = query.company;
    if (query.status) filter.status = query.status;
    return paginate(ChargebackModel, filter, { createdAt: -1 }, { active: undefined, ...query } as any);
  }

  async getChargeback(id: string) {
    const doc = await ChargebackModel.findById(id).populate('order').populate('payment').populate('company');
    if (!doc) throw new AppError("Chargeback não encontrado", 404);
    return doc;
  }

  async updateChargeback(id: string, data: any) {
    const doc = await ChargebackModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("Chargeback não encontrado", 404);
    return doc;
  }

  async deleteChargeback(id: string) {
    const doc = await ChargebackModel.findByIdAndDelete(id);
    if (!doc) throw new AppError("Chargeback não encontrado", 404);
    return doc;
  }

  // ---------- Balances (aggregation per company from Orders/Payments) ----------
  async listBalances(query: { startDate?: string; endDate?: string; company?: string }) {
    const filter: any = { status: 'delivered' };
    if (query.company) filter.company = query.company;
    if (query.startDate && query.endDate) {
      filter.deliveredAt = {
        $gte: new Date(`${query.startDate}T00:00:00`),
        $lte: new Date(`${query.endDate}T23:59:59.999`),
      };
    }

    const rows = await OrderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$company',
          ordersCount: { $sum: 1 },
          gross: { $sum: '$total' },
          subtotal: { $sum: '$subtotal' },
          deliveryFees: { $sum: '$deliveryFee' },
          discounts: { $sum: '$discount' },
          paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } },
        },
      },
      { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          companyId: '$_id',
          companyName: { $ifNull: ['$company.name', 'Desconhecida'] },
          ordersCount: 1,
          gross: 1,
          subtotal: 1,
          deliveryFees: 1,
          discounts: 1,
          paid: 1,
        },
      },
      { $sort: { gross: -1 } },
    ]);

    const totals: any = {
      ordersCount: 0, gross: 0, subtotal: 0, deliveryFees: 0, discounts: 0, paid: 0,
    };
    for (const r of rows) {
      totals.ordersCount += r.ordersCount;
      totals.gross += r.gross;
      totals.subtotal += r.subtotal;
      totals.deliveryFees += r.deliveryFees;
      totals.discounts += r.discounts;
      totals.paid += r.paid;
    }
    return { companies: rows, totals };
  }

  async getCompanyBalance(companyId: string, query: { startDate?: string; endDate?: string }) {
    const filter: any = { company: companyId, status: 'delivered' };
    if (query.startDate && query.endDate) {
      filter.deliveredAt = {
        $gte: new Date(`${query.startDate}T00:00:00`),
        $lte: new Date(`${query.endDate}T23:59:59.999`),
      };
    }

    const byMethod = await OrderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          gross: { $sum: '$total' },
          deliveryFees: { $sum: '$deliveryFee' },
        },
      },
    ]);

    const agg = await OrderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          ordersCount: { $sum: 1 },
          gross: { $sum: '$total' },
          subtotal: { $sum: '$subtotal' },
          deliveryFees: { $sum: '$deliveryFee' },
          discounts: { $sum: '$discount' },
          paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } },
        },
      },
    ]);

    const company = await CompanyModel.findById(companyId).select('name');
    const s = agg[0] || { ordersCount: 0, gross: 0, subtotal: 0, deliveryFees: 0, discounts: 0, paid: 0 };

    const payments = await PaymentModel.aggregate([
      { $match: { order: { $in: (await OrderModel.find(filter).select('_id')).map((o: any) => o._id) } } },
      { $group: { _id: null, received: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } }, refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0] } } } },
    ]);

    const p = payments[0] || { received: 0, refunded: 0 };

    return {
      company: company ? company.name : 'Desconhecida',
      companyId,
      ...s,
      receivedFromPayments: p.received,
      refunded: p.refunded,
      balance: s.paid - p.refunded,
      byMethod,
    };
  }
}

export default new FinanceService();
