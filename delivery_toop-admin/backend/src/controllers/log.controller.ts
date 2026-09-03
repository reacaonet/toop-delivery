import { Request, Response, NextFunction } from 'express';
import logService from '../services/log.service';

export class LogController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await logService.create(req.body), 201); } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await logService.list(req.params.id)); } catch (e) { next(e); }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await logService.paginator(req.query)); } catch (e) { next(e); }
  };
}

export default new LogController();
