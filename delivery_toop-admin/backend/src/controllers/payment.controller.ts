import { Request, Response, NextFunction } from "express";
import paymentService from "../services/payment.service";

export class PaymentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.getById(req.params.id);
      return res.status(200).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
