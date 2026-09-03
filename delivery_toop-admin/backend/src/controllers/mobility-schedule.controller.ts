import { Request, Response, NextFunction } from 'express';
import mobilityScheduleService from '../services/mobility-schedule.service';

export class MobilityScheduleController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  getScheduledByDriver = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityScheduleService.getScheduledByDriver(req.params.driver)); } catch (e) { next(e); }
  };

  createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityScheduleService.createSchedule(req.body), 201); } catch (e) { next(e); }
  };

  updateSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityScheduleService.updateSchedule(req.body)); } catch (e) { next(e); }
  };
}

export default new MobilityScheduleController();
