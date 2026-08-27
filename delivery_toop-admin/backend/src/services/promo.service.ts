import mongoose from "mongoose";
import { PromoModel } from "../models/Promo";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
  active?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

interface CreatePromoData {
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minValue?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usesPerUser?: number;
  active?: boolean;
}

type UpdatePromoData = Partial<CreatePromoData>;

type ValidateResult =
  | { valid: false; message: string }
  | { valid: true; promo: any; discount: number };

export class PromoService {
  async validateCode(code: string, userId: string, subtotal: number): Promise<ValidateResult> {
    const promo = await PromoModel.findOne({ code: code.toUpperCase().trim() });

    if (!promo) return { valid: false, message: "Cupom inválido" as const };
    if (!promo.active) return { valid: false, message: "Cupom inativo" as const };
    if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) {
      return { valid: false, message: "Cupom expirado" as const };
    }
    if (promo.minValue && subtotal < promo.minValue) {
      return { valid: false, message: "Valor mínimo não atingido" as const };
    }
    if (promo.usesPerUser) {
      const usage = (promo.usedBy || []).find(
        (u) => u.userId.toString() === userId.toString()
      );
      if (usage && usage.count >= promo.usesPerUser) {
        return { valid: false, message: "Limite de uso atingido" as const };
      }
    }

    let discount = 0;
    if (promo.discountType === 'percent') {
      discount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.discountValue;
    }
    discount = Math.min(discount, subtotal);
    discount = Math.round(discount * 100) / 100;

    return { valid: true, promo, discount };
  }

  async applyToBooking(booking: any, userId: string) {
    const code = booking?.promoCode;
    if (!code) return;

    const userIdObj = new mongoose.Types.ObjectId(userId.toString());

    const result = await PromoModel.updateOne(
      { code: code.toUpperCase().trim(), 'usedBy.userId': userIdObj },
      { $inc: { 'usedBy.$.count': 1 } }
    );

    if (result.modifiedCount === 0) {
      await PromoModel.updateOne(
        { code: code.toUpperCase().trim() },
        { $push: { usedBy: { userId: userIdObj, count: 1 } } }
      );
    }
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.active !== undefined) filter.active = query.active === 'true';

    const [data, total] = await Promise.all([
      PromoModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PromoModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async create(data: CreatePromoData) {
    return PromoModel.create({ ...data, code: data.code.toUpperCase().trim() });
  }

  async update(id: string, data: UpdatePromoData) {
    if (data.code) data.code = data.code.toUpperCase().trim();
    const promo = await PromoModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!promo) throw new AppError("Cupom não encontrado", 404);
    return promo;
  }

  async toggle(id: string) {
    const promo = await PromoModel.findById(id);
    if (!promo) throw new AppError("Cupom não encontrado", 404);
    promo.active = !promo.active;
    await promo.save();
    return promo;
  }

  async delete(id: string) {
    const promo = await PromoModel.findByIdAndDelete(id);
    if (!promo) throw new AppError("Cupom não encontrado", 404);
    return promo;
  }
}

export default new PromoService();