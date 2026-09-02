import { Request, Response, NextFunction } from "express";
import accessFlowService from "../services/access-flow.service";

export class AccessFlowController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessFlowService.create(req.body)); } catch (e) { next(e); }
  };
  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessFlowService.list()); } catch (e) { next(e); }
  };
  statistic = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessFlowService.statistic(req.query.timeInterval as any)); } catch (e) { next(e); }
  };
}

export default new AccessFlowController();
