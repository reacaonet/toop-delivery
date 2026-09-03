import { Request, Response, NextFunction } from 'express';
import ecbrImageBankService from '../services/ecbr-image-bank.service';

export class EcbrImageBankController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await ecbrImageBankService.list(req.query)); } catch (e) { next(e); }
  };

  generateCode = async (_req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await ecbrImageBankService.generateCode()); } catch (e) { next(e); }
  };

  listByBarcode = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await ecbrImageBankService.listByBarcode(req.params.barcode)); } catch (e) { next(e); }
  };

  sync = async (_req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await ecbrImageBankService.sync()); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await ecbrImageBankService.create(req.body), 200); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await ecbrImageBankService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
}

export default new EcbrImageBankController();
