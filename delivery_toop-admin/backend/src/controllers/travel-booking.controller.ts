import { Request, Response, NextFunction } from 'express';
import travelBookingService from '../services/travel-booking.service';

export class TravelBookingController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  getByBooking = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await travelBookingService.getByBooking(req.params.booking)); } catch (e) { next(e); }
  };
}

export default new TravelBookingController();
