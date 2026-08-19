import { Request, Response, NextFunction } from "express";
import bannerService from "../services/banner.service";

export class BannerController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.create(req.body);
      return res.status(201).json({ success: true, data: banner });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.getById(req.params.id);
      return res.status(200).json({ success: true, data: banner });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bannerService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async listActive(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await bannerService.listActive(req.query.company as string);
      return res.status(200).json({ success: true, data: banners });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: banner });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await bannerService.delete(req.params.id);
      return res.status(200).json({ success: true, data: { message: "Banner excluído" } });
    } catch (error) { next(error); }
  }
}

export default new BannerController();
