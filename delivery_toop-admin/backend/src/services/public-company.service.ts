import mongoose from 'mongoose';
import { GroupModel } from '../models/Group';
import { CompanyDeliveryModel } from '../models/CompanyDelivery';
import { AppError } from '../middleware/errorHandler';

function extractImages(data: any): string[] {
  const images: string[] = [];
  if (Array.isArray(data.file)) {
    data.file.forEach((item: any) => {
      if (item && item.url) images.push(item.url);
    });
  } else if (data.url) {
    images.push(data.url);
  }
  return images;
}

function normalizeCategory(category: any): string[] | undefined {
  if (!category) return undefined;
  return String(category)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(',');
}

class PublicCompanyService {
  async registerCompany(data: any) {
    if (!data.franchise) {
      throw new AppError('Informe a Franquia', 400);
    }
    if (!mongoose.isValidObjectId(data.franchise)) {
      throw new AppError('Franquia inválida', 400);
    }
    if (!data.file || typeof data.file !== 'object') {
      throw new AppError('Imagens inválidas', 400);
    }
    if (data.lng === undefined || data.lng === null || data.lat === undefined || data.lat === null) {
      throw new AppError("Campos 'latitude' e 'longitude' são obrigatórios", 400);
    }
    if (!data.name || typeof data.name !== 'string') {
      throw new AppError('Nome inválido', 400);
    }

    const images = extractImages(data);
    const location = { type: 'Point', coordinates: [Number(data.lng), Number(data.lat)] };
    const category = normalizeCategory(data.category);

    const group = await GroupModel.create({
      franchise: data.franchise,
      name: data.name,
      description: data.description ? data.description : data.name,
      status: true,
      images,
    });
    if (!group || !group._id) {
      throw new AppError('Não conseguimos criar um grupo para esta empresa...', 400);
    }

    const companyId = new mongoose.Types.ObjectId();
    const companyDoc: any = {
      _id: companyId,
      franchise: data.franchise,
      name: data.name,
      description: data.description,
      approved: false,
      status: false,
      groups: [group._id],
      images,
      category,
      location,
    };

    const db = mongoose.connection.db;
    if (!db) throw new AppError('Banco de dados indisponível', 500);
    const companies = db.collection('companies');
    if (!companies) throw new AppError('Não foi possível registrar empresa', 400);
    await companies.insertOne(companyDoc);

    const delivery = await CompanyDeliveryModel.create({
      company: companyId,
      fee: 15,
      min_purchase: 20,
      max_amount_items: 20,
      distance: [{ min: 0, max: 10000, price: 10, delivery_time: 25 }],
    });

    await companies.updateOne({ _id: companyId }, { $set: { companyDelivery: delivery._id } });

    return { ...companyDoc, companyDelivery: delivery._id, _id: companyId };
  }

  async listLocation(query: any) {
    const isOpen = query.isOpen;
    const filter = isOpen ? { 'companyDelivery.isOpen': isOpen === 'true' } : {};

    const db = mongoose.connection.db;
    if (!db) throw new AppError('Banco de dados indisponível', 500);
    const companies = db.collection('companies');
    if (!companies) return [];

    const list = await companies
      .aggregate([
        { $match: { status: true } },
        {
          $lookup: {
            from: 'company_delivery',
            localField: 'companyDelivery',
            foreignField: '_id',
            as: 'companyDelivery',
          },
        },
        { $unwind: { path: '$companyDelivery', preserveNullAndEmptyArrays: true } },
        { $match: filter },
      ])
      .toArray();

    return list;
  }
}

export default new PublicCompanyService();
