import { GuestModel } from '../models/Guest';
import { AppError } from '../middleware/errorHandler';

function buildData(body: any) {
  const { device, latitude, longitude } = body;
  if (!device || device.length <= 6) {
    throw new AppError('Informe um device válido', 400);
  }

  const data: any = { device };
  if (latitude && longitude) {
    data.location = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
    };
  }
  return data;
}

export class GuestService {
  async create(body: any) {
    const data = buildData(body);
    const existing = await GuestModel.findOne({ device: data.device }).lean();

    if (existing && existing._id) {
      if (data.location) {
        return GuestModel.findOneAndUpdate({ device: data.device }, data, { upsert: true, new: true });
      }
      return existing;
    }

    return GuestModel.create(data);
  }

  async get(device: string) {
    return GuestModel.findOne({ device }).lean();
  }

  async update(body: any) {
    const data = buildData(body);
    return GuestModel.findOneAndUpdate({ device: data.device }, data, { upsert: true, new: true });
  }
}

export default new GuestService();