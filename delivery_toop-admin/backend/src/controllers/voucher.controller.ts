import { Request, Response, NextFunction } from 'express';
import voucherService from '../services/voucher.service';

export class VoucherController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await voucherService.create(req.body), 201); } catch (e) { next(e); }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await voucherService.paginator(req.query)); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await voucherService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await voucherService.remove(req.params.id)); } catch (e) { next(e); }
  };

  validate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await voucherService.validate(req.body), 201); } catch (e) { next(e); }
  };
}

export default new VoucherController();
