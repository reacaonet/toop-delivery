import { Request, Response, NextFunction } from 'express';
import addressService from '../services/address.service';

export class AddressController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listState = async (_req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await addressService.listState()); } catch (e) { next(e); }
  };

  listCity = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await addressService.listCity(req.query)); } catch (e) { next(e); }
  };
}

export default new AddressController();
