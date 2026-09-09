import { Request, Response, NextFunction } from 'express';
import shoppingOrderService from '../services/shopping-order.service';

export class ShoppingOrderController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingOrderService.paginator(req.query as any);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingOrderService.getById(req.params.order);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async costFreight(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingOrderService.costFreight(req.params.order, req.body || {});
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async setOwnDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingOrderService.setDeliveryMode(req.params.order, 'own');
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async setOnlineDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingOrderService.setDeliveryMode(req.params.order, 'online');
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getDeliveryModeValue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingOrderService.getDeliveryMode(req.params.order);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async startScheduleOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingOrderService.startScheduleOrder(req.params.order);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new ShoppingOrderController();