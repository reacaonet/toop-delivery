import { Request, Response, NextFunction } from "express";
import categoryService from "../services/category.service";

export class CategoryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      return res.status(201).json({ success: true, data: category });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(req.params.id);
      return res.status(200).json({ success: true, data: category });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.listPublic(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: category });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.delete(req.params.id);
      return res.status(200).json({ success: true, data: category });
    } catch (error) { next(error); }
  }
}

export default new CategoryController();
