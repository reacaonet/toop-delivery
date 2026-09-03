import mongoose from 'mongoose';
import { AccessoriesCategoryModel } from '../models/AccessoriesCategory';
import { AccessoriesProductModel } from '../models/AccessoriesProduct';
import { AccessoriesProductComplementModel } from '../models/AccessoriesProductComplement';
import { AccessoriesProductComplementItemModel } from '../models/AccessoriesProductComplementItem';
import { AppError } from '../middleware/errorHandler';

interface PaginationQuery {
  page?: string;
  limit?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10)));
  return { page, limit, skip: (page - 1) * limit };
}

function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'string') {
    if (value === '') return fallback;
    const parsed = value.toLowerCase();
    if (parsed === 'true') return true;
    if (parsed === 'false') return false;
  }
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
}

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.isValidObjectId(id);
}

function extractImages(data: any): string[] | undefined {
  if (Array.isArray(data.file)) {
    return data.file.map((item: any) => item.url).filter(Boolean);
  }
  if (data.url) return [data.url];
  return undefined;
}

export class AccessoriesService {
  constructor(private categoryModel = AccessoriesCategoryModel) {}

  /* ---------------- Category ---------------- */

  async categoryByCompany(company: string) {
    if (!isValidId(company)) throw new AppError('Falha ao validar a company vinculada ao usuário!', 400);
    return this.categoryModel.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(company) } },
      {
        $lookup: {
          from: 'accessoriesProduct',
          let: { id: '$_id' },
          as: 'products',
          pipeline: [
            { $match: { $expr: { $eq: ['$category', '$$id'] } } },
            { $sort: { position: 1 } },
            { $project: { createdAt: 0, updatedAt: 0, __v: 0 } },
          ],
        },
      },
      { $project: { createdAt: 0, updatedAt: 0, __v: 0 } },
    ]);
  }

  async categoryListByName(listByName?: string) {
    if (!listByName || typeof listByName !== 'string') return [];
    return this.categoryModel
      .find({ name: { $regex: '.*' + listByName.toLowerCase() + '.*', $options: 'i' } }, { name: 1 })
      .lean();
  }

  async categoryCreate(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido para a categoria', 400);
    if (!isValidId(data.company)) throw new AppError('Company inválida', 400);
    data.isPaused = parseBoolean(data.isPaused, false);
    if (!data.position && typeof data.position !== 'number') data.position = 1;
    return this.categoryModel.create(data);
  }

  async categoryUpdate(id: string, data: any) {
    if (!isValidId(id)) throw new AppError('Categoria inválida', 400);
    if (data.isPaused !== undefined) data.isPaused = parseBoolean(data.isPaused, false);
    const doc = await this.categoryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError('Categoria não encontrada', 404);
    return doc;
  }

  async categoryRemove(id: string) {
    if (!isValidId(id)) throw new AppError('Categoria inválida', 400);
    await this.categoryModel.findByIdAndDelete(id);
    return { message: 'Categoria deletado com sucesso' };
  }

  /* ---------------- Product ---------------- */

  async productListGroupCategory(company: string, appVersion?: string) {
    if (!isValidId(company)) throw new AppError('Company inválida', 400);
    const result = await this.categoryModel.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(company),
          isPaused: { $ne: true },
        },
      },
      { $sort: { _id: 1 } },
      {
        $lookup: {
          from: 'accessoriesProduct',
          let: { id: '$_id' },
          as: 'products',
          pipeline: [{ $match: { $expr: { $eq: ['$category', '$$id'] } } }],
        },
      },
    ]);

    return result
      .filter((p) => p.products && p.products.length > 0)
      .map((p) => {
        if (appVersion) {
          return { title: p.name, key: p._id, data: p.products };
        }
        return { title: p.name, key: p._id, products: p.products };
      });
  }

  async productList(query: any) {
    const { company, filter } = query;
    const isPaused = query.isPaused ? true : '';
    const search: any = {};

    if (company) {
      const filterCategory: any = { company };
      if (isPaused) filterCategory.isPaused = { $ne: isPaused };
      if (filter) search.$text = { $search: filter };

      const categories = await this.categoryModel
        .find(filterCategory)
        .sort({ _id: 1 })
        .select({ _id: 1 })
        .lean();
      search.category = { $in: categories.map((c) => c._id) };
    } else if (filter) {
      search.$text = { $search: filter };
    }

    return AccessoriesProductModel.find(search).sort({ category: 1 }).populate('category').lean();
  }

  async productGet(id: string) {
    if (!isValidId(id)) throw new AppError('Produto inválido', 400);
    const doc = await AccessoriesProductModel.findById(id);
    if (!doc) throw new AppError('Produto não encontrado', 404);
    return doc;
  }

  async productCreate(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido para o produto', 400);
    if (!isValidId(data.category)) throw new AppError('Categoria inválida', 400);
    if (!isValidId(data.company)) throw new AppError('Company inválida', 400);
    if (typeof data.price !== 'number' && Number.isNaN(parseFloat(data.price))) {
      throw new AppError('Informe um preço válido', 400);
    }

    const images = extractImages(data);
    data.images = images && images.length > 0 ? images : data.images || [];
    data.isPaused = parseBoolean(data.isPaused, false);
    if (!data.position && typeof data.position !== 'number') data.position = 1;
    if (!data.amountPeople || !['ONE', 'TWO', 'THREE', 'FOUR'].includes(data.amountPeople)) {
      data.amountPeople = 'ONE';
    }

    const payload = {
      images: data.images,
      name: data.name,
      category: data.category,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      company: data.company,
      pricePromotion: typeof data.pricePromotion === 'number' ? data.pricePromotion : undefined,
      percentualDiscount:
        typeof data.percentualDiscount === 'number' ? data.percentualDiscount : undefined,
      codPdv: data.codPdv,
      isPaused: data.isPaused,
      position: data.position,
      amountPeople: data.amountPeople,
    };

    const product = await AccessoriesProductModel.create(payload);
    if (data.complements && Array.isArray(data.complements)) {
      await this.createComplementsAndItems(product._id.toString(), data.company, data.complements);
    }
    return product;
  }

  async productUpdate(id: string, data: any) {
    if (!isValidId(id)) throw new AppError('Produto inválido', 400);

    const images = extractImages(data);
    if (images && images.length > 0) {
      data.images = images;
    } else {
      delete data.file;
      delete data.url;
    }
    if (data.isPaused !== undefined) data.isPaused = parseBoolean(data.isPaused, false);
    if (data.amountPeople && !['ONE', 'TWO', 'THREE', 'FOUR'].includes(data.amountPeople)) {
      data.amountPeople = 'ONE';
    }

    const product = await AccessoriesProductModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new AppError('Produto não encontrado', 404);

    await this.removeComplementsAndItem(product._id.toString(), data);
    await this.upsertComplementsAndItems(product._id.toString(), data);
    return product;
  }

  async productSort(items: any[]) {
    if (!Array.isArray(items)) throw new AppError('Dados inválidos', 400);
    for (const p of items) {
      if (p._id && isValidId(p._id) && typeof p.position === 'number') {
        await AccessoriesProductModel.findByIdAndUpdate(p._id, {
          $set: { position: p.position },
        });
      }
    }
    return { message: 'Registros atualizados com sucesso' };
  }

  async productRemove(id: string) {
    if (!isValidId(id)) throw new AppError('Produto inválido', 400);
    const complements = await AccessoriesProductComplementModel.find({ product: id }, { _id: 1 }).lean();
    const complementListFood = complements.map((c) => c._id);
    const items = await AccessoriesProductComplementItemModel.find(
      { accessoriesProductComplement: { $in: complementListFood } },
      { _id: 1 }
    ).lean();
    await AccessoriesProductComplementModel.deleteMany({ _id: { $in: complementListFood } });
    await AccessoriesProductComplementItemModel.deleteMany({ _id: { $in: items.map((i) => i._id) } });
    await AccessoriesProductModel.findByIdAndDelete(id);
    return { message: 'Produto deletado com sucesso' };
  }

  /* ---------------- Product Complement ---------------- */

  async complementList(productId: string) {
    if (!isValidId(productId)) throw new AppError('Id inválido', 400);
    return AccessoriesProductComplementModel.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $lookup: {
          from: 'accessoriesProductComplementItem',
          localField: '_id',
          foreignField: 'accessoriesProductComplement',
          as: 'items',
        },
      },
    ]);
  }

  async complementCreate(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido para o complemento', 400);
    if (!isValidId(data.product)) throw new AppError('Produto inválido', 400);
    if (!isValidId(data.company)) throw new AppError('Company inválida', 400);
    data.isPaused = parseBoolean(data.isPaused, false);
    if (!data.position && typeof data.position !== 'number') data.position = 1;
    return AccessoriesProductComplementModel.create(data);
  }

  private async createComplementsAndItems(productId: string, companyId: string, data: any[]) {
    for (const comp of data) {
      const complementPayload: any = {
        product: productId,
        name: comp.name,
        position: typeof comp.position === 'number' ? comp.position : 1,
        amountMin: comp.amountMin,
        amountMax: comp.amountMax,
        isRequired: parseBoolean(comp.isRequired, false),
        isQuantified: parseBoolean(comp.isQuantified, false),
        isPaused: parseBoolean(comp.isPaused, false),
        company: companyId,
      };
      const complement = await AccessoriesProductComplementModel.create(complementPayload);
      if (comp.items && Array.isArray(comp.items)) {
        for (const item of comp.items) {
          await AccessoriesProductComplementItemModel.create({
            accessoriesProductComplement: complement._id,
            name: item.name,
            codPdv: item.codPdv,
            description: item.description,
            price: item.price,
            isPaused: parseBoolean(item.isPaused, false),
            company: companyId,
          });
        }
      }
    }
  }

  private async upsertComplementsAndItems(productId: string, data: any) {
    if (!data.complements || !Array.isArray(data.complements)) return;
    for (const comp of data.complements) {
      const _id = comp._id && isValidId(comp._id) ? comp._id : new mongoose.Types.ObjectId().toHexString();
      const complementPayload: any = {
        _id,
        product: productId,
        name: comp.name,
        amountMin: comp.amountMin,
        position: typeof comp.position === 'number' ? comp.position : 1,
        amountMax: comp.amountMax,
        isRequired: parseBoolean(comp.isRequired, false),
        isQuantified: parseBoolean(comp.isQuantified, false),
        isPaused: parseBoolean(comp.isPaused, false),
        company: comp.company || data.company,
      };
      const complement = await AccessoriesProductComplementModel.findByIdAndUpdate(
        _id,
        { $set: complementPayload },
        { new: true, upsert: true, runValidators: true }
      );
      if (comp.items && Array.isArray(comp.items)) {
        for (const item of comp.items) {
          const _idItem =
            item._id && isValidId(item._id) ? item._id : new mongoose.Types.ObjectId().toHexString();
          await AccessoriesProductComplementItemModel.findByIdAndUpdate(
            _idItem,
            {
              $set: {
                _id: _idItem,
                accessoriesProductComplement: complement._id,
                name: item.name,
                codPdv: item.codPdv,
                description: item.description,
                price: item.price,
                isPaused: parseBoolean(item.isPaused, false),
                company: comp.company || data.company,
              },
            },
            { new: true, upsert: true, runValidators: true }
          );
        }
      }
    }
  }

  private async removeComplementsAndItem(productId: string, data: any) {
    const complNews = data.complements && Array.isArray(data.complements) ? data.complements : [];
    const complementsAtual = await AccessoriesProductComplementModel.find(
      { product: productId },
      { _id: 1 }
    ).lean();

    for (const comp of complementsAtual) {
      const check = complNews.filter((c: any) => String(c._id) === String(comp._id));
      if (check.length <= 0) {
        await AccessoriesProductComplementModel.findByIdAndDelete(comp._id);
        await AccessoriesProductComplementItemModel.deleteMany({
          accessoriesProductComplement: comp._id,
        });
      } else {
        const news = check[0] as any;
        const itemsAtual = await AccessoriesProductComplementItemModel.find(
          { accessoriesProductComplement: comp._id },
          { _id: 1 }
        ).lean();
        const itemsNews =
          news.items && Array.isArray(news.items)
            ? news.items.map((i: any) => String(i._id))
            : [];
        for (const item of itemsAtual) {
          if (!itemsNews.includes(String(item._id))) {
            await AccessoriesProductComplementItemModel.findByIdAndDelete(item._id);
          }
        }
      }
    }
  }

  /* ---------------- Complement Item ---------------- */

  async itemList() {
    return AccessoriesProductComplementItemModel.find();
  }

  async itemCreate(data: any) {
    if (!data.name) throw new AppError('Informe um nome válido para o item', 400);
    if (!isValidId(data.accessoriesProductComplement)) {
      throw new AppError('Complemento inválido', 400);
    }
    if (!isValidId(data.company)) throw new AppError('Company inválida', 400);
    data.isPaused = parseBoolean(data.isPaused, false);
    return AccessoriesProductComplementItemModel.create(data);
  }

  async itemUpdate(id: string, data: any) {
    if (!isValidId(id)) throw new AppError('Item inválido', 400);
    if (data.isPaused !== undefined) data.isPaused = parseBoolean(data.isPaused, false);
    const doc = await AccessoriesProductComplementItemModel.findByIdAndUpdate(id, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    if (!doc) throw new AppError('Item não encontrado', 404);
    return doc;
  }

  async itemRemove(id: string) {
    if (!isValidId(id)) throw new AppError('Item inválido', 400);
    await AccessoriesProductComplementItemModel.findByIdAndDelete(id);
    return { message: 'Item deletado com sucesso' };
  }
}

export default new AccessoriesService();
