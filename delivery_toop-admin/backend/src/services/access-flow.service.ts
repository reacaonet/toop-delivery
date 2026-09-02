import { AccessFlowModel } from '../models/AccessFlow';

export class AccessFlowService {
  async create(data: any) {
    data = { ...data };
    delete data._id;

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    let filter: any = { createdAt: { $gte: start, $lte: end } };
    if (data.device) filter.device = data.device;
    else if (data.customer) filter.customer = data.customer;
    else if (data.person) filter.person = data.person;

    const findLog: any = filter.device || filter.customer || filter.person
      ? await AccessFlowModel.findOne(filter).lean()
      : null;

    if (findLog && findLog._id) {
      const updated = await AccessFlowModel.findByIdAndUpdate(findLog._id, data, { new: true });
      return { message: 'Log atualizado com sucesso', data: updated };
    }

    const log = await AccessFlowModel.create(data);
    return { message: 'Log criado com sucesso', data: log };
  }

  async list() {
    const logs = await AccessFlowModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          accessInfo: { $push: '$$ROOT' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);
    return logs;
  }

  async statistic(timeInterval?: string) {
    const days = Math.max(0, parseInt(String(timeInterval ?? 0), 10) || 0);
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const logs = await AccessFlowModel.aggregate([
      { $match: { updatedAt: { $gte: start, $lte: now } } },
      { $count: 'count' },
    ]);

    return logs[0] || { count: 0 };
  }
}

export default new AccessFlowService();
