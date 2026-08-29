import { Request, Response, NextFunction } from "express";
import preRegisterService from "../services/preRegister.service";

export class PreRegisterController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.create(req.body)); } catch (e) { next(e); }
  };
  listByPhone = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.listByPhone(req.params.phone, req.query.ddi as string)); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.remove(req.params.id)); } catch (e) { next(e); }
  };
  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.paginator(req.query as any)); } catch (e) { next(e); }
  };
  listViews = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.listViews(req.query as any)); } catch (e) { next(e); }
  };
  createDynamic = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.createDynamic(req.body), 201); } catch (e) { next(e); }
  };
  saveDynamicRecord = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await preRegisterService.saveDynamicRecord(req.params.id, req.body, req.headers)); } catch (e) { next(e); }
  };
}

export default new PreRegisterController();
