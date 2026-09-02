import { Request, Response, NextFunction } from "express";
import monitorService from "../services/monitor.service";

export class MonitorController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listOrders = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await monitorService.listOrders(req.user?._id!, req.query as any)); } catch (e) { next(e); }
  };
  detailOrder = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await monitorService.detailOrder(req.params.orderId)); } catch (e) { next(e); }
  };
  salesLastDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await monitorService.salesLastDay(req.query.dataDay as any, req.query.status as any, req.user?._id));
    } catch (e) { next(e); }
  };
}

export default new MonitorController();
