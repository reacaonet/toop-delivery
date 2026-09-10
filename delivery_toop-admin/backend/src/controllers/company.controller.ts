import { Request, Response, NextFunction } from "express";
import companyService from "../services/company.service";

export class CompanyController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.create(req.body);
      return res.status(201).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.getById(req.params.id);
      return res.status(200).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.delete(req.params.id);
      return res.status(200).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  async getAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const admins = await companyService.getAdmins(req.params.id);
      return res.status(200).json({ success: true, data: admins });
    } catch (error) {
      next(error);
    }
  }

  async addAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await companyService.addAdmin(req.params.id, req.body);
      return res.status(201).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  }

  async removeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await companyService.removeAdmin(req.params.id, req.params.userId);
      return res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  }
}

export default new CompanyController();
