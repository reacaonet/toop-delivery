import { Request, Response, NextFunction } from "express";
import orderService from "../services/order.service";
import { UserModel } from "../models/User";

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

  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserModel.findById((req as any).user?._id).populate('deliveryman');
      const deliverymanId = user?.deliveryman?._id?.toString();
      if (!deliverymanId) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const order = await orderService.acceptOrder(req.params.id, deliverymanId);
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
