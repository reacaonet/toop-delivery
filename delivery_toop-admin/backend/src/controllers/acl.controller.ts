import { Request, Response, NextFunction } from "express";
import aclService from "../services/acl.service";

export class AclController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  // ROLES
  listRoles = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.listRoles()); } catch (e) { next(e); }
  };
  paginatorRoles = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.paginatorRoles(req.query as any)); } catch (e) { next(e); }
  };
  listRolesPorNome = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.listRolesPorNome(req.query as any)); } catch (e) { next(e); }
  };
  createRole = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.createRole(req.body), 201); } catch (e) { next(e); }
  };
  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.updateRole(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.deleteRole(req.params.id)); } catch (e) { next(e); }
  };

  // PERMISSIONS
  listPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.listPermissions()); } catch (e) { next(e); }
  };
  paginatorPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.paginatorPermissions(req.query as any)); } catch (e) { next(e); }
  };
  createPermission = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.createPermission(req.body), 201); } catch (e) { next(e); }
  };
  updatePermission = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.updatePermission(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deletePermission = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.deletePermission(req.params.id)); } catch (e) { next(e); }
  };

  // USERS
  users = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await aclService.users(req.user?._id!)); } catch (e) { next(e); }
  };
}

export default new AclController();
