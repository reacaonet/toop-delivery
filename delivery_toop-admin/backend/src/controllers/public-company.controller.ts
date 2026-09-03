import { Request, Response, NextFunction } from 'express';
import publicCompanyService from '../services/public-company.service';

export class PublicCompanyController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  registerCompany = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await publicCompanyService.registerCompany(req.body)); } catch (e) { next(e); }
  };

  listLocation = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await publicCompanyService.listLocation(req.query)); } catch (e) { next(e); }
  };
}

export default new PublicCompanyController();
