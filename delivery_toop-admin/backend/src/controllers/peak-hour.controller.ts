import { Request, Response, NextFunction } from 'express';
import peakHourService from '../services/peak-hour.service';

export class PeakHourController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await peakHourService.listAll()); } catch (e) { next(e); }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await peakHourService.paginator(req.query)); } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.params.id) {
        this.ok(res, await peakHourService.listById(req.params.id));
      } else {
        this.ok(res, await peakHourService.listFiltered(req.query));
      }
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await peakHourService.create(req.body), 201); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await peakHourService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await peakHourService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new PeakHourController();
