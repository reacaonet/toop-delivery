import { Request, Response, NextFunction } from "express";
import addonService from "../services/addon.service";

export class AddonController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await addonService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await addonService.create(req.body);
      return res.status(201).json({ success: true, data: doc });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await addonService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: doc });
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await addonService.remove(req.params.id);
      return res.status(200).json({ success: true, data: doc });
    } catch (error) { next(error); }
  }
}

export default new AddonController();