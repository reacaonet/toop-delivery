import { Request, Response, NextFunction } from "express";
import appService from "../services/app.service";

export class AppController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listCategories = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await appService.listCategories(req.query as any)); } catch (e) { next(e); }
  };
  getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await appService.getCategory(req.params.id)); } catch (e) { next(e); }
  };
  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await appService.createCategory(req.body), 201); } catch (e) { next(e); }
  };
  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await appService.updateCategory(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await appService.deleteCategory(req.params.id)); } catch (e) { next(e); }
  };
}

export default new AppController();
