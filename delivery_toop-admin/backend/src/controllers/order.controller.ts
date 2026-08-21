import { Request, Response, NextFunction } from "express";
import orderService from "../services/order.service";

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create(req.body);
      return res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(req.params.id);
      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.updateStatus(
        req.params.id,
        req.body.status,
        req.body.deliverymanId
      );
      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.cancel(req.params.id);
      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
