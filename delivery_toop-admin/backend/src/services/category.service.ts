import { CategoryModel } from "../models/Category";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
  company?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class CategoryService {
  async create(data: { name: string; company?: string; description?: string; icon?: string; order?: number }) {
    return CategoryModel.create(data);
  }

  async getById(id: string) {
    const category = await CategoryModel.findById(id).populate('company');
    if (!category) throw new AppError("Categoria não encontrada", 404);
    return category;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
    const skip = (page - 1) * limit;

    const filter: any = { active: true };
    if (query.company) filter.company = query.company;

    const [data, total] = await Promise.all([
      CategoryModel.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit),
      CategoryModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async listPublic(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "100", 10)));
    const skip = (page - 1) * limit;

    const filter: any = { active: true };
    if (query.company) filter.company = query.company;

    const [data, total] = await Promise.all([
      CategoryModel.find(filter).select('name description icon order').sort({ order: 1, name: 1 }).skip(skip).limit(limit),
      CategoryModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Partial<{ name: string; description?: string; icon?: string; order?: number; active?: boolean }>) {
    const category = await CategoryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!category) throw new AppError("Categoria não encontrada", 404);
    return category;
  }

  async delete(id: string) {
    const category = await CategoryModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!category) throw new AppError("Categoria não encontrada", 404);
    return category;
  }
}

export default new CategoryService();
