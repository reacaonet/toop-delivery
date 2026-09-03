import { Request, Response, NextFunction } from 'express';
import mobilitySliderService from '../services/mobility-slider.service';

export class MobilitySliderController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilitySliderService.list(req.query);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilitySliderService.paginator(req.query, (req as any));
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  listById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilitySliderService.listById(req.params.id);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilitySliderService.create(req.body);
      return this.ok(res, data, 201);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilitySliderService.update(req.params.id, req.body);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilitySliderService.remove(req.params.id);
      return this.ok(res, { message: 'Slider deletado com sucesso' });
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilitySliderController();
