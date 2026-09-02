import { Request, Response, NextFunction } from 'express';
import cashbackService from '../services/cashback.service';

export class CashbackController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listAll = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.listAllCampaigns()); } catch (e) { next(e); }
  };
  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.listCampaigns(req.query as any)); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.getCampaign(req.params.id)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.createCampaign(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.updateCampaign(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.deleteCampaign(req.params.id)); } catch (e) { next(e); }
  };

  listCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageIn, pageOut } = req.query;
      this.ok(res, await cashbackService.listCustomer(req.params.customer, pageIn as any, pageOut as any));
    } catch (e) { next(e); }
  };
  balance = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.getBalance(req.params.customer)); } catch (e) { next(e); }
  };
  byMonth = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.byMonthCustomer(req.params.customer)); } catch (e) { next(e); }
  };
  usedPaginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await cashbackService.usedPaginator(req.query as any)); } catch (e) { next(e); }
  };
}

export default new CashbackController();
