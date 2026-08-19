import { BannerModel } from "../models/Banner";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
  company?: string;
  active?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class BannerService {
  async create(data: {
    title: string; subtitle?: string; image?: string; link?: string;
    company?: string; order?: number; active?: boolean; startDate?: string; endDate?: string;
  }) {
    return BannerModel.create(data);
  }

  async getById(id: string) {
    const banner = await BannerModel.findById(id).populate('company');
    if (!banner) throw new AppError("Banner não encontrado", 404);
    return banner;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.company) filter.company = query.company;
    if (query.active !== undefined) filter.active = query.active === 'true';

    const [data, total] = await Promise.all([
      BannerModel.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
      BannerModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async listActive(companyId?: string): Promise<any[]> {
    const filter: any = { active: true };
    if (companyId) filter.company = companyId;
    const now = new Date();
    filter.$or = [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } },
    ];
    filter.$and = [
      { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ];
    return BannerModel.find(filter).sort({ order: 1 });
  }

  async update(id: string, data: Partial<{
    title: string; subtitle?: string; image?: string; link?: string;
    company?: string; order?: number; active?: boolean; startDate?: string; endDate?: string;
  }>) {
    const banner = await BannerModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!banner) throw new AppError("Banner não encontrado", 404);
    return banner;
  }

  async delete(id: string) {
    const banner = await BannerModel.findByIdAndDelete(id);
    if (!banner) throw new AppError("Banner não encontrado", 404);
    return banner;
  }
}

export default new BannerService();
