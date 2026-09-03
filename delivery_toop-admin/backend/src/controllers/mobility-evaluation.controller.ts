import { Request, Response, NextFunction } from 'express';
import mobilityEvaluationService from '../services/mobility-evaluation.service';

export class MobilityEvaluationController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityEvaluationService.listEvaluationsByPassenger(req.query)); } catch (e) { next(e); }
  };

  getAverageRating = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityEvaluationService.getAverageRating(req.params.rated)); } catch (e) { next(e); }
  };

  paginateByDriver = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityEvaluationService.paginateEvaluationsByDriver(req.query)); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityEvaluationService.create(req.body), 201); } catch (e) { next(e); }
  };
}

export default new MobilityEvaluationController();
