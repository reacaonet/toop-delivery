import { Request, Response, NextFunction } from 'express';
import documentTypeService from '../services/document-type.service';

export class DocumentTypeController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await documentTypeService.listAll()); } catch (e) { next(e); }
  };

  graphic = async (_req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await documentTypeService.graphic()); } catch (e) { next(e); }
  };

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await documentTypeService.paginator(req.query)); } catch (e) { next(e); }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await documentTypeService.search(req.query)); } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.params.id) {
        this.ok(res, await documentTypeService.listById(req.params.id));
      } else {
        this.ok(res, await documentTypeService.list(req.query));
      }
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await documentTypeService.create(req.body), 201); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await documentTypeService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await documentTypeService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new DocumentTypeController();
