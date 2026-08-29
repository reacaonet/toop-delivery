import { Request, Response, NextFunction } from "express";
import emailService from "../services/email.service";

export class EmailController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  // ---------- Types ----------
  listTypes = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.listTypes(req.query as any)); } catch (e) { next(e); }
  };
  createType = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.createType(req.body), 201); } catch (e) { next(e); }
  };
  updateType = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.updateType(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteType = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.deleteType(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Templates ----------
  listTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.listTemplates(req.query as any)); } catch (e) { next(e); }
  };
  createTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.createTemplate(req.body), 201); } catch (e) { next(e); }
  };
  updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.updateTemplate(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.deleteTemplate(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Variables ----------
  listVariables = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await emailService.listVariables()); } catch (e) { next(e); }
  };
}

export default new EmailController();
