import { Request, Response, NextFunction } from 'express';
import departmentMobileService from '../services/shopping-department-mobile.service';

export class DepartmentMobileController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentMobileService.list(req.query));
    } catch (e) {
      next(e);
    }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentMobileService.paginator(req.query));
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentMobileService.create(req.body), 201);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentMobileService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentMobileService.softDelete(req.params.id));
    } catch (e) {
      next(e);
    }
  };
}

export default new DepartmentMobileController();