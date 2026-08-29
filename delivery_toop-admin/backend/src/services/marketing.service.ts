import { CampaignModel } from "../models/Campaign";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export class MarketingService {
  async listCampaigns(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      CampaignModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CampaignModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getCampaign(id: string) {
    const doc = await CampaignModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!doc) throw new AppError("Campanha não encontrada", 404);
    return doc;
  }

  async createCampaign(data: any) {
    return CampaignModel.create(data);
  }

  async updateCampaign(id: string, data: any) {
    const doc = await CampaignModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError("Campanha não encontrada", 404);
    return doc;
  }

  async deleteCampaign(id: string) {
    const doc = await CampaignModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) throw new AppError("Campanha não encontrada", 404);
    return doc;
  }
}

export default new MarketingService();
