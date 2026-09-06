import { Request, Response, NextFunction } from 'express';
import offerService from '../services/offer.service';

export class OfferController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await offerService.register(req.body), 201); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await offerService.create(req.body), 201); } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await offerService.list()); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await offerService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await offerService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new OfferController();