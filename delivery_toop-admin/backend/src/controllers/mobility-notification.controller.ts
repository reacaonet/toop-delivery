import { Request, Response, NextFunction } from 'express';
import mobilityNotificationService from '../services/mobility-notification.service';

export class MobilityNotificationController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.listAll();
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  graph = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.graph();
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.paginator(req.query);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.search(req.query);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.list(req.params.id, req.query);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.create(req.body);
      return this.ok(res, data, 201);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.update(req.params.id, req.body);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityNotificationService.remove(req.params.id);
      return this.ok(res, { message: 'Registro removido com sucesso' });
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityNotificationController();
