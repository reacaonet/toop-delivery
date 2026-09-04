import { Request, Response, NextFunction } from 'express';
import scheduleService from '../services/shopping-schedule.service';

export class ShoppingScheduleController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  all = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await scheduleService.listAll());
    } catch (e) {
      next(e);
    }
  };

  haveSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await scheduleService.haveSchedule(req.params.company));
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await scheduleService.listByCompany(req.params.company, req.query.type));
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await scheduleService.create(req.params.company, req.body), 201);
    } catch (e) {
      next(e);
    }
  };

  updateType = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await scheduleService.updateMissingType());
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await scheduleService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await scheduleService.softDelete(req.params.id));
    } catch (e) {
      next(e);
    }
  };
}

export default new ShoppingScheduleController();