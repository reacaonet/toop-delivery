import { AppCategoryModel } from "../models/AppCategory";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
  type?: string;
  status?: string;
  showHome?: string;
  showInApp?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export class AppService {
  async listCategories(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    if (query.type) filter.type = query.type;
    if (query.status === 'true') filter.status = true;
    if (query.status === 'false') filter.status = false;
    if (query.showHome === 'true') filter.showHome = true;
    if (query.showInApp === 'true') filter.showInApp = true;

    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      AppCategoryModel.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit),
      AppCategoryModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getCategory(id: string) {
    const doc = await AppCategoryModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!doc) throw new AppError("Categoria de aplicativo não encontrada", 404);
    return doc;
  }

  async createCategory(data: any) {
    return AppCategoryModel.create(data);
  }

  async updateCategory(id: string, data: any) {
    const doc = await AppCategoryModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError("Categoria de aplicativo não encontrada", 404);
    return doc;
  }

  async deleteCategory(id: string) {
    const doc = await AppCategoryModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) throw new AppError("Categoria de aplicativo não encontrada", 404);
    return doc;
  }
}

export default new AppService();
