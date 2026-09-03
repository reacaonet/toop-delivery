import mongoose from 'mongoose';
import { SliderModel } from '../models/Slider';
import { TabloidModel } from '../models/Tabloid';
import { TipModel } from '../models/Tip';
import { TipDeliveryManModel } from '../models/TipDeliveryMan';
import { SiteModel } from '../models/CompanySite';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

async function companyScope(userId?: string): Promise<string[]> {
  if (!userId) return [];
  const user = await UserModel.findById(userId).select('company role').lean();
  if (!user) return [];
  if (user.role === 'admin' || user.role === 'manager') return [];
  return user.company ? [String(user.company)] : [];
}

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
  } else if (data.url) {
    images.push(data.url);
  }
  delete body.file;
  delete body.url;
  return { images, bodyWithoutFile: body };
}

export class SiteContentService {
  // ---------------- SLIDER ----------------
  async sliderRegister(data: any) {
    return SliderModel.create(data);
  }

  async sliderCreate(data: any) {
    const file = data.file;
    if (!file || typeof file !== 'object') {
      throw new AppError('Imagens inválidas', 400);
    }

    const { images, bodyWithoutFile } = extractImages(data);
    bodyWithoutFile.status = coerceBool(data.status);
    bodyWithoutFile.companyClick = coerceBool(data.companyClick);
    bodyWithoutFile.images = images;

    const slider: any = await SliderModel.create(bodyWithoutFile);
    return slider.populate('company');
  }

  async sliderList(query: any, userCompanies: string[]) {
    const { company, limit, type, segment, category } = query;
    const filter: any = { status: true, deletedAt: { $exists: false } };

    if (company && isValidId(company)) filter.company = company;

    if (type) {
      filter.type = type;
    } else {
      filter.type = { $ne: 'banner' };
    }

    if (segment) filter.segment = segment;
    else filter.segment = { $exists: false };

    if (category === 'delivery') {
      filter.category = { $ne: 'service' };
    } else if (category) {
      filter.category = category;
    }

    const nPerPage = limit ? Number(limit) : 50;

    let items = await SliderModel.find(filter)
      .populate('company')
      .limit(nPerPage)
      .sort({ createdAt: -1 })
      .lean();

    if (type === 'banner') {
      items = await SliderModel.find(filter)
        .populate('company')
        .populate('productId', 'name images price promoPrice')
        .limit(nPerPage)
        .lean();
    } else {
      items = await SliderModel.find(filter)
        .populate('company')
        .limit(nPerPage)
        .lean()
        .then((rows) => rows.map((r: any) => ({ ...r, productId: r.foodId || r.productId })));
    }

    return items;
  }

  async sliderPaginator(query: any, userId?: string) {
    const { pageIn, pageOut, name } = query;
    if (!pageIn || !pageOut) throw new AppError('Informe pageIn e pageOut', 400);

    const userCompanies = await companyScope(userId);
    const filter: any = { deletedAt: { $exists: false } };
    if (userCompanies.length > 0) filter.company = { $in: userCompanies };
    if (name && typeof name === 'string' && name.trim() !== '') {
      filter.name = { $regex: `.*${name.toLowerCase()}.*`, $options: 'i' };
    }

    const list = await SliderModel.find(filter)
      .populate('productId', 'name')
      .populate('foodId', 'name')
      .populate('company', 'name')
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .lean();

    const total = await SliderModel.countDocuments(filter);
    return { list, total };
  }

  async sliderUpdate(id: string, data: any) {
    if (!id || !isValidId(id)) throw new AppError('Informe um slider válido', 400);

    const body = { ...data };
    if (body.status !== undefined) body.status = coerceBool(data.status);
    if (body.companyClick !== undefined) body.companyClick = coerceBool(data.companyClick);

    const file = data.file;
    if (file && typeof file === 'object') {
      const { images } = extractImages(data);
      body.images = images;
    } else {
      delete body.file;
      delete body.images;
    }

    await SliderModel.updateOne({ _id: id }, body);
    const updated = await SliderModel.findById(id).populate('company').lean();
    return updated;
  }

  async sliderRemove(id: string) {
    if (!id || !isValidId(id)) throw new AppError('Informe um slider válido', 400);
    await SliderModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true });
    return {};
  }

  // ---------------- TABLOID ----------------
  async tabloidRegister(data: any) {
    return TabloidModel.create(data);
  }

  async tabloidCreate(data: any) {
    const file = data.file;
    if (!file || typeof file !== 'object') throw new AppError('Imagens inválidas', 400);

    const { images, bodyWithoutFile } = extractImages(data);
    bodyWithoutFile.status = coerceBool(data.status);
    bodyWithoutFile.images = images;

    return TabloidModel.create(bodyWithoutFile);
  }

  async tabloidList() {
    return TabloidModel.find().lean();
  }

  async tabloidUpdate(id: string, data: any) {
    if (!id || !isValidId(id)) throw new AppError('Informe um tabloid válido', 400);

    const file = data.file;
    const body = { ...data };
    if (body.status !== undefined) body.status = coerceBool(data.status);

    if (file && typeof file === 'object') {
      const { images } = extractImages(data);
      body.images = images;
    } else {
      throw new AppError('Imagens inválidas', 400);
    }

    return TabloidModel.findOneAndUpdate({ _id: id }, body, { upsert: true, new: true });
  }

  async tabloidRemove(id: string) {
    if (!id || !isValidId(id)) throw new AppError('Informe um tabloid válido', 400);
    await TabloidModel.findByIdAndDelete(id);
    return {};
  }

  // ---------------- TIP ----------------
  async tipCreate(data: any) {
    return TipModel.create(data);
  }

  async tipList() {
    return TipModel.find().lean();
  }

  async tipSearch(query: any) {
    const filter: any = {};
    if (query.status !== undefined) filter.status = query.status;
    if (query.value !== undefined) filter.value = query.value;
    if (query.type) filter.type = query.type;
    return TipModel.find(filter).sort({ value: 1 }).lean();
  }

  async tipRemove(id: string) {
    if (!id || !isValidId(id)) throw new AppError('Informe uma gorjeta válida', 400);
    await TipModel.findByIdAndDelete(id);
    return {};
  }

  // ---------------- TIP DELIVERYMAN ----------------
  async tipDeliveryManCreate(data: any) {
    return TipDeliveryManModel.create(data);
  }

  async tipDeliveryManList() {
    return TipDeliveryManModel.find().lean();
  }

  async tipDeliveryManRemove(id: string) {
    if (!id || !isValidId(id)) throw new AppError('Informe uma gorjeta válida', 400);
    await TipDeliveryManModel.findByIdAndDelete(id);
    return {};
  }

  // ---------------- SITE (CompanySite) ----------------
  async siteCreate(data: any) {
    const body: any = { ...data };
    body.status = coerceBool(data.status);
    const site: any = await SiteModel.create(body);
    return site.populate('company', 'name');
  }

  async siteList() {
    return SiteModel.find({ deletedAt: { $exists: false } }).populate('company', 'name').lean();
  }

  async sitePaginator(query: any, userId?: string) {
    const { page, limit } = query;
    if (!page || !limit) throw new AppError('Informe page e limit', 400);

    const userCompanies = await companyScope(userId);
    const filter: any = { deletedAt: { $exists: false } };
    if (userCompanies.length > 0) filter.company = { $in: userCompanies };

    const list = await SiteModel.find(filter)
      .populate('company')
      .limit(parseInt(limit))
      .skip(parseInt(page) * parseInt(limit))
      .lean();

    const total = await SiteModel.countDocuments(filter);
    return { list, total };
  }

  async siteUpdate(id: string, data: any) {
    if (!id || !isValidId(id)) throw new AppError('Informe um site válido', 400);
    const body: any = { ...data };
    if (body.status !== undefined) body.status = coerceBool(data.status);
    const updated: any = await SiteModel.findOneAndUpdate({ _id: id }, body, { upsert: true, new: true });
    return updated.populate('company');
  }

  async siteRemove(id: string) {
    if (!id || !isValidId(id)) throw new AppError('Informe um site válido', 400);
    await SiteModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true });
    return {};
  }
}

export default new SiteContentService();
