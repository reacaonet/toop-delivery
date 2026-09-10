import { RideCategoryModel, IRideCategory, DEFAULT_RIDE_CATEGORIES } from "../models/RideCategory";
import { AppError } from "../middleware/errorHandler";

async function ensureDefaults() {
  for (const cat of DEFAULT_RIDE_CATEGORIES) {
    await RideCategoryModel.updateOne(
      { code: cat.code },
      { $setOnInsert: { ...cat, multiplier: cat.multiplier, active: true } },
      { upsert: true }
    );
  }
}

class RideCategoryService {
  async list(params: { all?: boolean; vehicleType?: string } = {}) {
    await ensureDefaults();
    const filter: Record<string, unknown> = {};
    if (!params.all) filter.active = true;
    if (params.vehicleType) filter.vehicleType = params.vehicleType;
    return RideCategoryModel.find(filter).sort({ sortOrder: 1 }).lean();
  }

  async create(data: Partial<IRideCategory>) {
    await ensureDefaults();
    const exists = await RideCategoryModel.findOne({ code: data.code as string });
    if (exists) {
      throw new AppError(`Categoria "${data.code}" já existe`, 400);
    }
    return RideCategoryModel.create({
      ...data,
      multiplier: Number(data.multiplier ?? 1),
      active: data.active ?? true,
    });
  }

  async update(id: string, data: Partial<IRideCategory>) {
    const updated = await RideCategoryModel.findByIdAndUpdate(
      id,
      {
        ...data,
        multiplier: data.multiplier !== undefined ? Number(data.multiplier) : undefined,
      },
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new AppError("Categoria não encontrada", 404);
    }
    return updated;
  }

  async remove(id: string) {
    const updated = await RideCategoryModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    if (!updated) {
      throw new AppError("Categoria não encontrada", 404);
    }
    return updated;
  }
}

export default new RideCategoryService();