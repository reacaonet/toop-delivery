import { Request, Response, NextFunction } from "express";
import shopperService from "../services/shopper.service";

export class ShopperController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await shopperService.list(req.query as any)); } catch (e) { next(e); }
  };
  listControllers = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await shopperService.listControllers(req.query)); } catch (e) { next(e); }
  };
  search = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await shopperService.search(req.query as any)); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await shopperService.get(req.params.id)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await shopperService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await shopperService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await shopperService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new ShopperController();
