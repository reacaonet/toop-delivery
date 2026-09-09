import { Request, Response, NextFunction } from 'express';
import shoppingCartService from '../services/shopping-cart.service';

export class ShoppingCartController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.paginator(req.query as any);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.getById(req.params.cart);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async current(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = req.user!._id;
      const data = await shoppingCartService.getActive(customer, req.query.company as string | undefined);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = req.user!._id;
      const data = await shoppingCartService.create(customer, req.body.company, req.body);
      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.addItem(req.params.cart, req.body || {});
      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.updateItem(req.params.item, req.body || {});
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.removeItem(req.params.item);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.update(req.params.cart, req.body || {});
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.softDelete(req.params.cart);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.reorder(req.params.cart);
      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shoppingCartService.checkout(req.params.cart, req.body || {});
      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new ShoppingCartController();