import mongoose from 'mongoose';
import { OfferModel } from '../models/Offer';
import { AppError } from '../middleware/errorHandler';

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.isValidObjectId(id);
}

function coerceBool(v: any): boolean | undefined {
  if (v === '' || v === null || v === undefined) return false;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return !!v;
}

function extractImages(data: any): { images?: string[]; bodyWithoutFile: any } {
  const body = { ...data };
  const images: string[] = [];
  const file = data.file;

  if (file && typeof file === 'object') {
    if (Array.isArray(file)) {
      for (const f of file) {
        if (f && f.url) images.push(f.url);
      }
    } else if (file.url) {
      images.push(file.url);
    }
  }
  delete body.file;
  if (images.length > 0) body.images = images;
  return { images: images.length > 0 ? images : undefined, bodyWithoutFile: body };
}

class OfferService {
  async register(data: any) {
    return OfferModel.create(data);
  }

  async create(data: any) {
    const file = data.file;
    if (!file || typeof file !== 'object') throw new AppError('Imagens inválidas', 400);

    const { bodyWithoutFile } = extractImages(data);
    bodyWithoutFile.status = coerceBool(data.status);

    return OfferModel.create(bodyWithoutFile);
  }

  async list() {
    return OfferModel.find().lean();
  }

  async update(id: string, data: any) {
    if (!id || !isValidId(id)) throw new AppError('Informe uma oferta válida', 400);

    const file = data.file;
    const body = { ...data };
    if (body.status !== undefined) body.status = coerceBool(data.status);

    if (file && typeof file === 'object') {
      const { images } = extractImages(data);
      body.images = images;
    } else {
      throw new AppError('Imagens inválidas', 400);
    }

    return OfferModel.findOneAndUpdate({ _id: id }, body, { upsert: true, new: true });
  }

  async remove(id: string) {
    if (!id || !isValidId(id)) throw new AppError('Informe uma oferta válida', 400);
    await OfferModel.findOneAndDelete({ _id: id });
    return {};
  }
}

export default new OfferService();