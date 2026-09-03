import { Request, Response, NextFunction } from 'express';
import chosenDestinationsService from '../services/chosen-destinations.service';

export class ChosenDestinationsController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await chosenDestinationsService.list(req.query)); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await chosenDestinationsService.create(req.body), 201); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await chosenDestinationsService.update(req.params.driver, req.params.id, req.body)); } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await chosenDestinationsService.remove(req.params.driver, req.params.id)); } catch (e) { next(e); }
  };
}

export default new ChosenDestinationsController();
