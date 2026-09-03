import { Request, Response, NextFunction } from 'express';
import mobilityDiscountService from '../services/mobility-discount.service';

export class MobilityDiscountController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityDiscountService.paginator(req.query, (req as any));
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityDiscountService.create(req.body);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityDiscountService.update(req.params.id, req.body);
      return this.ok(res, { message: 'Alterado!!' });
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityDiscountController();
