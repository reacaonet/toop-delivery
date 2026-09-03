import { Request, Response, NextFunction } from 'express';
import mobilityPushNotificationService from '../services/mobility-push-notification.service';

export class MobilityPushNotificationController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityPushNotificationService.paginator(req.query, (req as any));
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityPushNotificationService.create(req.body);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityPushNotificationController();
