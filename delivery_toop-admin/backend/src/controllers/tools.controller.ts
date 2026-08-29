import { Request, Response, NextFunction } from "express";
import toolsService from "../services/tools.service";

export class ToolsController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  // Popup
  listPopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listPopup()); } catch (e) { next(e); }
  };
  paginatorPopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.paginatorPopup(req.query as any)); } catch (e) { next(e); }
  };
  createPopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.createPopup(req.body), 201); } catch (e) { next(e); }
  };
  updatePopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.updatePopup(req.params.id, req.body)); } catch (e) { next(e); }
  };
  removePopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.removePopup(req.params.id)); } catch (e) { next(e); }
  };
  updatePopupViews = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.updatePopupViews(req.params.id, req.body)); } catch (e) { next(e); }
  };
  listPopupApp = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listPopupApp(req.params.id)); } catch (e) { next(e); }
  };

  // Integration
  listIntegrations = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listIntegrations(req.query as any)); } catch (e) { next(e); }
  };
  listIntegrationByCompany = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listIntegrationByCompany(req.params.company)); } catch (e) { next(e); }
  };
  createIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.createIntegration(req.body), 201); } catch (e) { next(e); }
  };
  updateIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.updateIntegration(req.params.id, req.body)); } catch (e) { next(e); }
  };
  removeIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.removeIntegration(req.params.id)); } catch (e) { next(e); }
  };
  paginatorIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.paginatorIntegration(req.query as any)); } catch (e) { next(e); }
  };
}

export default new ToolsController();
