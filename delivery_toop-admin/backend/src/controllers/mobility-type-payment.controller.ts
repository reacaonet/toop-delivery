import { Request, Response, NextFunction } from 'express';
import mobilityTypePaymentService from '../services/mobility-type-payment.service';

export class MobilityTypePaymentController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityTypePaymentService.listActive();
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityTypePaymentController();
