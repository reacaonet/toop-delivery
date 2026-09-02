import { Request, Response, NextFunction } from "express";
import packingService from "../services/packing.service";

export class PackingController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await packingService.list(req.query as any)); } catch (e) { next(e); }
  };
  listAll = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await packingService.listAll()); } catch (e) { next(e); }
  };
  listByName = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await packingService.listByName(String(req.query.listPorNome || ''))); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await packingService.get(req.params.id)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await packingService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await packingService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await packingService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new PackingController();
