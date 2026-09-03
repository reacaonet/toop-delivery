import { Request, Response, NextFunction } from 'express';
import passengerWalletService from '../services/passenger-wallet.service';

export class PassengerWalletController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await passengerWalletService.getBalance(String(req.query.passenger || ''))); } catch (e) { next(e); }
  };
}

export default new PassengerWalletController();
