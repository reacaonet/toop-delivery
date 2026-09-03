import { Request, Response, NextFunction } from 'express';
import vehicleDocumentsService from '../services/vehicle-documents.service';

export class VehicleDocumentsController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await vehicleDocumentsService.paginator(req.query)); } catch (e) { next(e); }
  };

  listByDriver = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await vehicleDocumentsService.listByDriver(req.params.driver, req.query)); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await vehicleDocumentsService.create(req.body), 201); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await vehicleDocumentsService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
}

export default new VehicleDocumentsController();
