import { AddonModel } from "../models/Addon";
import { AppError } from "../middleware/errorHandler";

interface AddonQuery {
  company?: string;
}

export class AddonService {
  async list(query: AddonQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    if (query.company) filter.company = query.company;
    return AddonModel.find(filter).sort({ name: 1 });
  }

  async create(data: { company: string; name: string; price: number; active?: boolean }) {
    if (!data.name) throw new AppError("Informe o nome do acompanhamento", 400);
    return AddonModel.create({ ...data, price: Math.max(0, Number(data.price || 0)), active: data.active !== false });
  }

  async update(id: string, data: any) {
    const doc = await AddonModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { ...data, price: data.price != null ? Math.max(0, Number(data.price)) : data.price },
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError("Acompanhamento não encontrado", 404);
    return doc;
  }

  async remove(id: string) {
    const doc = await AddonModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date(), active: false },
      { new: true }
    );
    if (!doc) throw new AppError("Acompanhamento não encontrado", 404);
    return doc;
  }
}

export default new AddonService();