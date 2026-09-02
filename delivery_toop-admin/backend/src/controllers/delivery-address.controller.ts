import { Request, Response, NextFunction } from "express";
import deliveryAddressService from "../services/delivery-address.service";

export class DeliveryAddressController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryAddressService.list(req.params.id)); } catch (e) { next(e); }
  };
  search = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryAddressService.search(req.query as any)); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryAddressService.get(req.params.id)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryAddressService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryAddressService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryAddressService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new DeliveryAddressController();