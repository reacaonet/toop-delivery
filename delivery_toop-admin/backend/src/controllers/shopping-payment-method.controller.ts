import { Request, Response, NextFunction } from 'express';
import shoppingPaymentMethodService from '../services/shopping-payment-method.service';

export class ShoppingPaymentMethodController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await shoppingPaymentMethodService.list(req.params.customer, req.query));
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await shoppingPaymentMethodService.create(req.params.customer, req.body), 201);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await shoppingPaymentMethodService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await shoppingPaymentMethodService.softDelete(req.params.id));
    } catch (e) {
      next(e);
    }
  };
}

export default new ShoppingPaymentMethodController();