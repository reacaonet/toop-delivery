import { Types } from 'mongoose';
import { OrderModel } from '../models/Order';
import { SettingsModel } from '../models/Settings';
import { SplitModel } from '../models/Split';
import { PaymentTransactionModel } from '../models/PaymentTransaction';
import { AppError } from '../middleware/errorHandler';

export class RepasseService {
  async recordRepasse(order: any) {
    if (!order || !order._id) return;

    const already = await SplitModel.findOne({
      $or: [{ order: order._id, referenceType: 'order' }, { order: order._id, referenceType: 'booking' }],
    });
    if (already) return;

    const total = Number(order.total || 0);
    const fee = Number(order.deliveryFee || 0);

    const settings = await SettingsModel.findOne().lean();
    const feePct = settings?.deliverymanFeePercentage ?? 2;

    const platformFee = Math.round(fee * (feePct / 100) * 100) / 100;
    const deliverymanEarnings = Math.round((fee - platformFee) * 100) / 100;
    const companyAmount = Math.round((total - platformFee) * 100) / 100;

    if (total <= 0) return;

    const orderId = order._id as Types.ObjectId;
    const companyId = order.company;

    await PaymentTransactionModel.create({
      order: orderId,
      company: companyId || undefined,
      gateway: 'MONEY',
      operation: 'repasse',
      method: 'repasse',
      amount: total,
      fees: platformFee,
      status: 'succeeded',
      metadata: { deliveryFee: fee, platformFee, deliverymanEarnings, companyAmount },
    });

    await SplitModel.insertMany([
      {
        order: orderId,
        company: companyId || undefined,
        partyType: 'company',
        recipientId: companyId || undefined,
        name: 'Loja (repasse do pedido)',
        percent: 100,
        amount: companyAmount,
        status: 'pending',
        referenceType: 'order',
      },
      {
        order: orderId,
        company: companyId || undefined,
        partyType: 'deliveryman',
        recipientId: order.deliveryman || undefined,
        name: 'Entregador (taxa de entrega)',
        percent: 100,
        amount: deliverymanEarnings,
        status: 'pending',
        referenceType: 'order',
      },
      {
        order: orderId,
        company: companyId || undefined,
        partyType: 'platform',
        name: 'Plataforma (taxa de gestão)',
        percent: 100,
        amount: platformFee,
        status: 'pending',
        referenceType: 'order',
      },
    ]);
  }

  async summaryByCompany(company: string, query: Record<string, any> = {}) {
    if (!company || !Types.ObjectId.isValid(company)) {
      throw new AppError('Informe uma empresa válida', 400);
    }

    const match: Record<string, any> = {
      company: new Types.ObjectId(company),
      status: 'delivered',
    };

    if (query.startDate || query.endDate) {
      match.deliveredAt = {};
      if (query.startDate) {
        const start = new Date(query.startDate);
        if (!isNaN(start.getTime())) match.deliveredAt.$gte = start;
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        if (!isNaN(end.getTime())) match.deliveredAt.$lte = end;
      }
    }

    const settings = await SettingsModel.findOne().lean();
    const feePct = settings?.deliverymanFeePercentage ?? 2;

    const [agg]: any[] = await OrderModel.aggregate(match ? [{ $match: match }, {
      $group: {
        _id: null,
        count: { $sum: 1 },
        gross: { $sum: { $ifNull: ['$total', 0] } },
        deliveryFees: { $sum: { $ifNull: ['$deliveryFee', 0] } },
      },
    }] : []);

    const gross = agg?.gross ?? 0;
    const deliveryFees = agg?.deliveryFees ?? 0;
    const platformFee = Math.round(deliveryFees * (feePct / 100) * 100) / 100;
    const deliverymanShare = Math.round((deliveryFees - platformFee) * 100) / 100;
    const net = Math.round((gross - platformFee) * 100) / 100;

    return {
      company,
      feePercentage: feePct,
      count: agg?.count ?? 0,
      gross,
      deliveryFees,
      platformFee,
      deliverymanShare,
      net,
    };
  }

  async listSplits(query: Record<string, any> = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));

    const filter: Record<string, any> = {};

    if (query.company && Types.ObjectId.isValid(query.company)) {
      filter.company = query.company;
    }
    if (query.partyType) {
      filter.partyType = query.partyType;
    }
    if (query.status) {
      filter.status = query.status;
    }

    const [data, total] = await Promise.all([
      SplitModel.find(filter)
        .populate('order', 'orderNumber total total deliveryFee status')
        .populate('company', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      SplitModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }
}

export default new RepasseService();