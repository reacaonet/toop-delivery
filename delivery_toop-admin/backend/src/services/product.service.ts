import { ProductModel } from "../models/Product";
import { AddonModel } from "../models/Addon";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
  company?: string;
  category?: string;
  search?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class ProductService {
  async create(data: {
    name: string; price: number; company: string; category: string;
    description?: string; promoPrice?: number; image?: string; images?: string[];
    preparationTime?: number; addons?: string[];
  }) {
    await this.validateOwnAddons(data.addons, data.company);
    return ProductModel.create(data);
  }

  private async validateOwnAddons(addons: string[] | undefined, company: string) {
    if (!addons || addons.length === 0) return;
    const unique = [...new Set(addons.map((a) => String(a)))];
    const docs = await AddonModel.find({
      _id: { $in: unique },
      company,
      deletedAt: { $exists: false },
    });
    if (docs.length !== unique.length) {
      throw new AppError("Acompanhamento inválido ou de outra loja", 400);
    }
  }

  async getById(id: string) {
    const product = await ProductModel.findById(id).populate('company').populate('category').populate('addons');
    if (!product) throw new AppError("Produto não encontrado", 404);
    return product;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const filter: any = { active: true };
    if (query.company) filter.company = query.company;
    if (query.category) filter.category = query.category;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };

    const [data, total] = await Promise.all([
      ProductModel.find(filter).populate('category').populate('addons').skip(skip).limit(limit).sort({ name: 1 }),
      ProductModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async listByCompany(companyId: string) {
    return ProductModel.find({ company: companyId, active: true })
      .populate('category')
      .populate('addons')
      .sort({ name: 1 });
  }

  async update(id: string, data: Partial<{
    name: string; description?: string; price?: number; promoPrice?: number;
    category?: string; image?: string; images?: string[]; preparationTime?: number;
    active?: boolean; available?: boolean; addons?: string[];
  }>) {
    if (data.addons) {
      const existing = await ProductModel.findById(id);
      if (!existing) throw new AppError("Produto não encontrado", 404);
      await this.validateOwnAddons(data.addons, existing.company.toString());
    }
    const product = await ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) throw new AppError("Produto não encontrado", 404);
    return product;
  }

  async delete(id: string) {
    const product = await ProductModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!product) throw new AppError("Produto não encontrado", 404);
    return product;
  }
}

export default new ProductService();
