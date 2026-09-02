import { Request, Response, NextFunction } from 'express';
import couponService from '../services/coupon.service';

export class CouponController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.list(req.query as any)); } catch (e) { next(e); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.get(req.params.id)); } catch (e) { next(e); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.create(req.body), 201); } catch (e) { next(e); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.remove(req.params.id)); } catch (e) { next(e); }
  };
  display = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.display(req.query as any)); } catch (e) { next(e); }
  };
  highCupon = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.highCupon()); } catch (e) { next(e); }
  };
  companyCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.companyCoupons(req.params.id)); } catch (e) { next(e); }
  };
  couponCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.couponCustomer(req.query as any)); } catch (e) { next(e); }
  };
  couponCustomerPaginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await couponService.couponCustomerPaginator(req.query as any)); } catch (e) { next(e); }
  };
}

export default new CouponController();
