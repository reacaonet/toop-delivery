import { Request, Response, NextFunction } from 'express';
import departmentService from '../services/shopping-department.service';

export class DepartmentController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentService.list(req.query));
    } catch (e) {
      next(e);
    }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentService.paginator(req.query));
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentService.create(req.body), 201);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await departmentService.softDelete(req.params.id));
    } catch (e) {
      next(e);
    }
  };
}

export default new DepartmentController();