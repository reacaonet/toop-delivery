import { Request, Response, NextFunction } from "express";
import cartService from "../services/cart.service";

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const customerId = req.user!._id;
      const cart = await cartService.getOrCreate(customerId, companyId);
      return res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const { productId, quantity, notes } = req.body;
      const customerId = req.user!._id;
      const cart = await cartService.addItem(customerId, companyId, productId, quantity, notes);
      return res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
  }

  async updateItemQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId, itemId } = req.params;
      const { quantity } = req.body;
      const customerId = req.user!._id;
      const cart = await cartService.updateItemQuantity(customerId, cartId, itemId, quantity);
      return res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId, itemId } = req.params;
      const customerId = req.user!._id;
      const cart = await cartService.removeItem(customerId, cartId, itemId);
      return res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
  }

  async listCarts(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!._id;
      const carts = await cartService.listAll(customerId);
      return res.status(200).json({ success: true, data: carts });
    } catch (error) { next(error); }
  }
}

export default new CartController();
