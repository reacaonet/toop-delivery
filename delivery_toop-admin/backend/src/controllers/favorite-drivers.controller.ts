import { Request, Response, NextFunction } from 'express';
import favoriteDriversService from '../services/favorite-drivers.service';

export class FavoriteDriversController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  isFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await favoriteDriversService.isFavorite(req.params.driver, req.params.passenger)); } catch (e) { next(e); }
  };

  toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await favoriteDriversService.toggleFavorite(req.body)); } catch (e) { next(e); }
  };
}

export default new FavoriteDriversController();
