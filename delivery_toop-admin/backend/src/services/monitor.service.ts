import mongoose from 'mongoose';
import { OrderModel } from '../models/Order';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const FINISHED_STATUSES = ['delivered', 'cancelled'];

interface OrderListQuery {
  page?: string;
  pageSize?: string;
  status?: string;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export class MonitorService {
  async listOrders(userId: string, query: OrderListQuery) {
    const filter: any = {};

    let match = {};
    if (query.status) {
      match = { $eq: query.status };
    } else {
      match = { $nin: FINISHED_STATUSES };
    }
    filter.status = match;

    // Escopo por empresa do usuário logado (root/admin sem escopo)
    const scope = await this.companyScope(userId);
    if (scope) filter.company = { $in: scope };

    const limit = Math.max(0, parseInt(String(query.page ?? 25), 10) || 25);
    const next = Math.max(0, parseInt(String(query.pageSize ?? 1), 10) - 1);

    const orders = await OrderModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          let: { customerId: '$customer' },
          as: 'customer',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$customerId'] } } }, { $limit: 1 }, { $project: { name: 1, email: 1 } }],
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'companies',
          let: { companyId: '$company' },
          as: 'company',
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$companyId'] } } }, { $limit: 1 }, { $project: { name: 1, images: 1 } }],
        },
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: next * limit },
      { $limit: limit },
    ]);

    const total = await OrderModel.countDocuments({ status: match, ...(scope ? { company: { $in: scope } } : {}) });
    return { list: orders, total };
  }

  async detailOrder(orderId: string) {
    if (!mongoose.isValidObjectId(orderId)) throw new AppError('Informe um pedido válido', 400);

    const order = await OrderModel.findById(orderId)
      .populate({ path: 'company', select: { name: 1, images: 1 } })
      .populate({ path: 'customer', select: { name: 1, email: 1 } })
      .populate({ path: 'deliveryman', populate: { path: 'person', select: { name: 1 } } })
      .lean();

    if (!order) throw new AppError('Não conseguimos identificar o Pedido', 400);
    return order;
  }

  async salesLastDay(dataDay?: string, status?: string, userId?: string) {
    const base = dataDay ? new Date(dataDay) : new Date();
    base.setUTCHours(base.getUTCHours() - 24, 0, 0, 0);

    const scope = userId ? await this.companyScope(userId) : null;

    const targetStatus = status && status.length > 2 ? status : 'delivered';

    const results: any[] = [];
    const cursor = new Date(base);
    for (let i = 0; i < 24; i++) {
      const start = new Date(cursor);
      const end = new Date(start);
      end.setUTCMinutes(59, 59, 999);

      const match: any = { updatedAt: { $gte: start, $lte: end } };
      if (scope) match.company = { $in: scope };

      const response = await OrderModel.aggregate([
        { $match: match },
        {
          $project: {
            _id: 0,
            updatedAt: 1,
            Finalized: { $cond: { if: { $eq: [{ $toLower: '$status' }, String(targetStatus).toLowerCase()] }, then: 1, else: 0 } },
          },
        },
        { $group: { _id: { hour: { $hour: { date: '$updatedAt', timezone: 'UTC' } } }, total: { $sum: 1 }, finished: { $sum: '$Finalized' } } },
      ]);

      let total = 0;
      let finished = 0;
      if (response && response.length > 0) {
        total = response[0].total;
        finished = response[0].finished;
      }

      results.push({
        start: `${start.toISOString().slice(0, 13)}:00:00Z`,
        end: `${end.toISOString().slice(0, 13)}:59:59Z`,
        hour: `${pad2(start.getUTCHours())}:00`,
        total,
        finished,
      });

      cursor.setUTCHours(cursor.getUTCHours() + 1, 0, 0, 0);
    }

    return results;
  }

  private async companyScope(userId: string): Promise<string[] | null> {
    const user = await UserModel.findById(userId).select('company role').lean();
    if (!user) return null;
    if (user.role === 'admin' || user.role === 'manager') return null;
    const company = (user as any).company;
    if (!company) return null;
    return [String(company)];
  }
}

export default new MonitorService();
