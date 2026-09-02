import { Request, Response, NextFunction } from "express";
import guestService from "../services/guest.service";

export class GuestController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await guestService.create(req.body), 201); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await guestService.get(req.params.device)); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await guestService.update(req.body)); } catch (e) { next(e); }
  };
}

export default new GuestController();