import { Request, Response, NextFunction } from 'express';
import searchService from '../services/search.service';

export class SearchController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await searchService.searchCompanyProducts(req.query as any));
    } catch (e) { next(e); }
  };

  listForSegments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await searchService.searchSegments(req.query as any));
    } catch (e) { next(e); }
  };
}

export default new SearchController();
