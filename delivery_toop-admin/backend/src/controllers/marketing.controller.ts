import { Request, Response, NextFunction } from "express";
import marketingService from "../services/marketing.service";

export class MarketingController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listCampaigns = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await marketingService.listCampaigns(req.query as any)); } catch (e) { next(e); }
  };
  getCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await marketingService.getCampaign(req.params.id)); } catch (e) { next(e); }
  };
  createCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await marketingService.createCampaign(req.body), 201); } catch (e) { next(e); }
  };
  updateCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await marketingService.updateCampaign(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await marketingService.deleteCampaign(req.params.id)); } catch (e) { next(e); }
  };
}

export default new MarketingController();
