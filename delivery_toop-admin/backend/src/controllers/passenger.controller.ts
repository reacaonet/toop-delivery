import { Request, Response, NextFunction } from 'express';
import passengerService from '../services/passenger.service';

export class PassengerController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  activeRun = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.activeRun(req.params.passenger));
    } catch (e) {
      next(e);
    }
  };

  listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.listAll());
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.list({ ...req.query, id: req.params.id }));
    } catch (e) {
      next(e);
    }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.paginator(req.query));
    } catch (e) {
      next(e);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.search(req.query));
    } catch (e) {
      next(e);
    }
  };

  filter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.filter(req.query));
    } catch (e) {
      next(e);
    }
  };

  graphic = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.graphic());
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.create(req.body), 201);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.remove(req.params.id));
    } catch (e) {
      next(e);
    }
  };

  linkToFranchise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await passengerService.linkToFranchise(req.body));
    } catch (e) {
      next(e);
    }
  };
}

export default new PassengerController();
