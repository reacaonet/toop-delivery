import { Request, Response, NextFunction } from 'express';
import mobilityServiceService from '../services/mobility-service.service';

export class MobilityServiceController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.listAll());
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.list({ ...req.query, id: req.params.id }));
    } catch (e) {
      next(e);
    }
  };

  listFront = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.listFront(req.query));
    } catch (e) {
      next(e);
    }
  };

  available = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.available(req.query));
    } catch (e) {
      next(e);
    }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.paginator(req.query));
    } catch (e) {
      next(e);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.search(req.query));
    } catch (e) {
      next(e);
    }
  };

  graphic = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.graphic());
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.create(req.body), 201);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.remove(req.params.id));
    } catch (e) {
      next(e);
    }
  };

  serviceDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await mobilityServiceService.serviceDetails(req.params.id));
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityServiceController();
