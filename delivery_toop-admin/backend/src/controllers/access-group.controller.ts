import { Request, Response, NextFunction } from "express";
import accessGroupService from "../services/access-group.service";

export class AccessGroupController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listModules = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.listModules()); } catch (e) { next(e); }
  };
  createModule = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.createModule(req.body), 201); } catch (e) { next(e); }
  };
  updateModule = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.updateModule(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.deleteModule(req.params.id)); } catch (e) { next(e); }
  };

  listControllers = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.listControllers()); } catch (e) { next(e); }
  };
  createController = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.createController(req.body), 201); } catch (e) { next(e); }
  };
  updateController = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.updateController(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteController = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.deleteController(req.params.id)); } catch (e) { next(e); }
  };

  tree = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.tree()); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessGroupService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new AccessGroupController();
