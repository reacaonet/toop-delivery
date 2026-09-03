import mongoose from 'mongoose';
import { VoucherDiscountModel } from '../models/VoucherDiscount';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class MobilityDiscountService {
  async paginator(query: any, auth: any) {
    const { pageIn = 0, pageOut = 20, active } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);

    const filter: any = {};

    if (!auth?.isRoot && auth?.franchise) {
      filter.franchise = new mongoose.Types.ObjectId(auth.franchise);
    }

    if (`${active}` === 'true' || `${active}` === 'false') {
      filter.active = `${active}` === 'true';
    }

    const [list, total] = await Promise.all([
      VoucherDiscountModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'franchise',
            let: { franchiseId: '$franchise' },
            as: 'franchise',
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$franchiseId'] } } },
              { $project: { name: 1 } },
              { $limit: 1 },
            ],
          },
        },
        {
          $lookup: {
            from: 'service',
            let: { serviceId: '$service' },
            as: 'service',
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$serviceId'] } } },
              { $project: { name: 1 } },
              { $limit: 1 },
            ],
          },
        },
        { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
        { $sort: { active: -1, createdAt: -1 } },
        { $skip: from * size },
        { $limit: size },
      ]),
      VoucherDiscountModel.countDocuments(filter),
    ]);

    return { list, total };
  }

  async create(data: any) {
    const payload: any = {};

    if (data.name) payload.name = data.name;
    if (data.franchise) payload.franchise = data.franchise;
    if (data.passenger) payload.passenger = data.passenger;
    if (data.service) payload.service = data.service;
    if (data.price) payload.price = data.price;
    if (data.percent) payload.percent = data.percent;
    if (data.startDate) payload.startDate = new Date(data.startDate);
    if (data.endDate) payload.endDate = new Date(data.endDate);
    if (data.type) payload.type = data.type;
    if (data.amountAvailable) payload.amountAvailable = data.amountAvailable;
    if (data.amountUsed) payload.amountUsed = data.amountUsed;
    if (`${data.active}` === 'true' || `${data.active}` === 'false') {
      payload.active = `${data.active}` === 'true';
    }

    return VoucherDiscountModel.create(payload);
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) throw new AppError('Id inválido', 400);

    const body = { ...data };
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const updated = await VoucherDiscountModel.updateOne({ _id: id }, body);
    return updated;
  }
}

export default new MobilityDiscountService();
