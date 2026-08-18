import { Request, Response, NextFunction } from "express";
import deliverymanService from "../services/deliveryman.service";

export class DeliverymanController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.create(req.body);
      return res.status(201).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.getById(req.params.id);
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await deliverymanService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.update(
        req.params.id,
        req.body
      );
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.delete(req.params.id);
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeliverymanController();
