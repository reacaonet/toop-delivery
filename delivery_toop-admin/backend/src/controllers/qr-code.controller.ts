import { Request, Response, NextFunction } from 'express';
import qrCodeService from '../services/qr-code.service';

export class QrCodeController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  generateDriver = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await qrCodeService.generateDriver(req.query)); } catch (e) { next(e); }
  };

  listDriverCode = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await qrCodeService.listDriverCode(req.query)); } catch (e) { next(e); }
  };
}

export default new QrCodeController();
