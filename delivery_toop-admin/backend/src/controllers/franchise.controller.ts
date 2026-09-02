import { Request, Response, NextFunction } from "express";
import franchiseService from "../services/franchise.service";

export class FranchiseController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.list(req.query as any)); } catch (e) { next(e); }
  };
  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.paginator(req.query as any)); } catch (e) { next(e); }
  };
  listAll = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.listAll()); } catch (e) { next(e); }
  };
  search = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.search(req.query as any)); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.get(req.params.id)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.remove(req.params.id)); } catch (e) { next(e); }
  };
  configurations = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await franchiseService.configurations(req.params.company)); } catch (e) { next(e); }
  };
}

export default new FranchiseController();