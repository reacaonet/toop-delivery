import { Request, Response, NextFunction } from 'express';
import favoritePlacesService from '../services/favorite-places.service';

export class FavoritePlacesController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await favoritePlacesService.list(req.query, req.user)); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await favoritePlacesService.create(req.body), 201); } catch (e) { next(e); }
  };
}

export default new FavoritePlacesController();
