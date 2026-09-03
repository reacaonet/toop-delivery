import { Request, Response, NextFunction } from 'express';
import alertProductService from '../services/alert-product.service';

export class AlertProductController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = req.query.customer as string | undefined;
      this.ok(res, await alertProductService.list(customer));
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await alertProductService.create(req.body), 201); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await alertProductService.update(req.params.idAlert)); } catch (e) { next(e); }
  };

  report = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await alertProductService.report(req.query as any)); } catch (e) { next(e); }
  };
}

export default new AlertProductController();
