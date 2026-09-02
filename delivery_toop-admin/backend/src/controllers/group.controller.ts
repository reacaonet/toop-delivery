import { Request, Response, NextFunction } from "express";
import groupService from "../services/group.service";

export class GroupController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await groupService.list(req.query as any)); } catch (e) { next(e); }
  };
  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await groupService.paginator(req.query as any)); } catch (e) { next(e); }
  };
  listPorNome = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await groupService.listPorNome(req.query as any)); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await groupService.get(req.params.id)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await groupService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await groupService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await groupService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new GroupController();
