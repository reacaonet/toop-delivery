import { Request, Response, NextFunction } from "express";
import walletService from "../services/wallet.service";
import { UserModel } from "../models/User";

export class WalletController {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      let driverId = req.query.driverId as string | undefined;

      if (!driverId) {
        const userId = (req as any).user?._id;
        const user = await UserModel.findById(userId).populate("driver");
        if (!user?.driver) {
          return res.status(400).json({ success: false, error: "Motorista não encontrado" });
        }
        driverId = (user.driver as any)._id.toString();
      }

      const balance = await walletService.getBalance(driverId!);
      return res.status(200).json({ success: true, data: balance });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      let driverId = req.query.driverId as string | undefined;

      if (!driverId) {
        const userId = (req as any).user?._id;
        const user = await UserModel.findById(userId).populate("driver");
        if (!user?.driver) {
          return res.status(400).json({ success: false, error: "Motorista não encontrado" });
        }
        driverId = (user.driver as any)._id.toString();
      }

      const result = await walletService.getTransactions(driverId!, req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async credit(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId, amount, description, bookingId } = req.body;
      const result = await walletService.credit(driverId, amount, description, bookingId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async debit(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId, amount, description, bookingId } = req.body;
      const result = await walletService.debit(driverId, amount, description, bookingId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new WalletController();
