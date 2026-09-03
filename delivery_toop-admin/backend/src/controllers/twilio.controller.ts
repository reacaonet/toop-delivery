import { Request, Response, NextFunction } from 'express';
import twilioService from '../services/twilio.service';

export class TwilioController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await twilioService.create(req.body), 201); } catch (e) { next(e); }
  };

  sendCode = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await twilioService.sendVerificationCode(req.body.phone)); } catch (e) { next(e); }
  };

  verifyCode = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await twilioService.checkVerificationCode(req.body.phone, req.body.code)); } catch (e) { next(e); }
  };
}

export default new TwilioController();
