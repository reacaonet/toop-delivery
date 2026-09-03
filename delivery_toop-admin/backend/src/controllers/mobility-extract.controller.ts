import { Request, Response, NextFunction } from 'express';
import mobilityExtractService from '../services/mobility-extract.service';

export class MobilityExtractController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  driverBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timezone } = req.query;
      const data = await mobilityExtractService.driverBalance(req.params.driver, timezone as string);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityExtractController();
