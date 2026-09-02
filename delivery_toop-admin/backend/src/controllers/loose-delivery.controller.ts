import { Request, Response, NextFunction } from "express";
import looseDeliveryService from "../services/loose-delivery.service";

export class LooseDeliveryController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = (req as any).user?._id?.toString();
      this.ok(res, await looseDeliveryService.create({ ...req.body, customer }), 201);
    } catch (e) {
      next(e);
    }
  };

  address = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await looseDeliveryService.validateAddress(req.query as any));
    } catch (e) {
      next(e);
    }
  };
}

export default new LooseDeliveryController();