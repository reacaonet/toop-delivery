import { Request, Response, NextFunction } from "express";
import personService from "../services/person.service";

export class PersonController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.list(req.query as any)); } catch (e) { next(e); }
  };
  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.paginator(req.query as any)); } catch (e) { next(e); }
  };
  listPorNome = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.listPorNome(req.query as any)); } catch (e) { next(e); }
  };
  search = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.search(req.query as any)); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.get(req.params.id)); } catch (e) { next(e); }
  };
  avatar = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.avatar(req.params.id)); } catch (e) { next(e); }
  };
  registerDuplicates = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.registerDuplicates(req.query as any)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await personService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new PersonController();