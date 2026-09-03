import { Request, Response, NextFunction } from 'express';
import mobilityMessageService from '../services/mobility-message.service';

export class MobilityMessageController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityMessageService.listByBooking(req.query.booking as string);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  conversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityMessageService.conversations(req.query);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityMessageService.create(req.body);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityMessageController();
