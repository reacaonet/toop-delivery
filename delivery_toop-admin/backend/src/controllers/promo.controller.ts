import { Request, Response, NextFunction } from "express";
import promoService from "../services/promo.service";
import { AppError } from "../middleware/errorHandler";

export class PromoController {
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const { code, subtotal } = req.body;

      if (!code || typeof subtotal !== 'number' || subtotal <= 0) {
        return next(new AppError("Código e subtotal são obrigatórios", 400));
      }

      const result = await promoService.validateCode(code, userId, subtotal);
      if (!result.valid) {
        return next(new AppError(result.message, 400));
      }

      return res.status(200).json({
        success: true,
        data: {
          valid: true,
          code: result.promo.code,
          discount: result.discount,
          subtotal,
          total: Math.round((subtotal - result.discount) * 100) / 100,
        },
      });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await promoService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const promo = await promoService.create(req.body);
      return res.status(201).json({ success: true, data: promo });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const promo = await promoService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: promo });
    } catch (error) { next(error); }
  }

  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const promo = await promoService.toggle(req.params.id);
      return res.status(200).json({ success: true, data: promo });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await promoService.delete(req.params.id);
      return res.status(200).json({ success: true, data: { message: "Cupom excluído" } });
    } catch (error) { next(error); }
  }
}

export default new PromoController();