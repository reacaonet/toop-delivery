import { Request, Response, NextFunction } from 'express';
import customerService from '../services/customer.service';

export class CustomerController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  paginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.paginator(req.query as any)); } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.list(req.params.id)); } catch (e) { next(e); }
  };

  listPorNome = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.listPorNome(req.query.listPorNome as string)); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.create(req.body), 201); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.remove(req.params.id)); } catch (e) { next(e); }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.search(req.query as any)); } catch (e) { next(e); }
  };

  searchCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.searchCustomer(req.query as any)); } catch (e) { next(e); }
  };

  searchPersonCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await customerService.searchPersonCustomer(req.query as any)); } catch (e) { next(e); }
  };
}

export default new CustomerController();