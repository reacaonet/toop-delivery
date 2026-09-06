import { Request, Response, NextFunction } from 'express';
import indicationService from '../services/indication.service';

export class IndicationController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await indicationService.list(req.query)); } catch (e) { next(e); }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await indicationService.paginator(req.query)); } catch (e) { next(e); }
  };
}

export default new IndicationController();
