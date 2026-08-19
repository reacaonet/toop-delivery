import { Request, Response, NextFunction } from "express";
import productService from "../services/product.service";

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      return res.status(201).json({ success: true, data: product });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      return res.status(200).json({ success: true, data: product });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async listByCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.listByCompany(req.params.companyId);
      return res.status(200).json({ success: true, data: products });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: product });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.delete(req.params.id);
      return res.status(200).json({ success: true, data: product });
    } catch (error) { next(error); }
  }
}

export default new ProductController();
