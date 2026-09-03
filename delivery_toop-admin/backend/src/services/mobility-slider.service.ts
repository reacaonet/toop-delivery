import mongoose from 'mongoose';
import { MobilitySliderModel } from '../models/MobilitySlider';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class MobilitySliderService {
  async list(query: any) {
    const { franchise, type } = query;

    const filter: any = { deletedAt: { $exists: false }, status: true };

    if (franchise && isObjectId(franchise)) {
      filter.franchise = new mongoose.Types.ObjectId(franchise);
    }
    if (type) filter.target = type;

    return MobilitySliderModel.find(filter).lean();
  }

  async paginator(query: any, auth: any) {
    const { pageIn, pageOut, target } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = {};

    if (!auth?.isRoot && auth?.franchise) {
      filter.franchise = new mongoose.Types.ObjectId(auth.franchise);
    }

    if (target) {
      const decodeTarget = decodeURIComponent(target);
      filter.target = { $regex: '.*' + decodeTarget.toLowerCase() + '.*', $options: 'i' };
    }

    filter.deletedAt = { $exists: false };

    const [list, total] = await Promise.all([
      MobilitySliderModel.find(filter)
        .populate('franchise', { name: 1 })
        .limit(size)
        .skip(from * size),
      MobilitySliderModel.countDocuments(filter),
    ]);

    return { list, total };
  }

  async listById(id: string) {
    if (!isObjectId(id)) throw new AppError('Id inválido', 400);
    return MobilitySliderModel.findById(id);
  }

  async create(data: any) {
    data.image = [];
    if (Array.isArray(data.file)) {
      data.file.forEach((item: any) => data.image.push(item.url));
    } else if (data.url) {
      data.image.push(data.url);
    }
    delete data.file;

    if (`${data.status}` === 'true' || `${data.status}` === 'false') {
      data.status = `${data.status}` === 'true';
    }

    if (!data.franchise || !isObjectId(data.franchise)) {
      throw new AppError('Informe uma franquia válida', 400);
    }

    return MobilitySliderModel.create(data);
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) throw new AppError('Id inválido', 400);

    if (`${data.status}` === 'true' || `${data.status}` === 'false') {
      data.status = `${data.status}` === 'true';
    }

    if (data.franchise && !isObjectId(data.franchise)) {
      throw new AppError('Informe uma franquia válida', 400);
    }

    if (data.file && typeof data.file === 'object') {
      data.image = [];
      if (Array.isArray(data.file)) {
        data.file.forEach((item: any) => data.image.push(item.url));
      } else if (data.url) {
        data.image.push(data.url);
      }
    } else {
      delete data.file;
      delete data.image;
    }

    const updated = await MobilitySliderModel.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true });
    if (!updated) throw new AppError('Slider não encontrado', 404);
    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) throw new AppError('Id inválido', 400);
    const updated = await MobilitySliderModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!updated) throw new AppError('Slider não encontrado', 404);
    return updated;
  }
}

export default new MobilitySliderService();
