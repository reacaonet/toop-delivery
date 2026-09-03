import { Request, Response, NextFunction } from 'express';
import deliveryDispatchService from '../services/delivery-dispatch.service';

export class DeliveryDispatchController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  queueList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.queueList(req.query as any)); } catch (e) { next(e); }
  };

  queueStatusOne = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.queueStatusOne(req.params.status, req.query.initial as string)); } catch (e) { next(e); }
  };

  queueUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.queueUpdateStatus(req.params.queueId, req.body.status)); } catch (e) { next(e); }
  };

  queueUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.queueUpdate(req.params.queueId, req.body)); } catch (e) { next(e); }
  };

  queueUpdateReceived = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.queueUpdateReceived(req.params.orderId, req.body.deliveryMan)); } catch (e) { next(e); }
  };

  queueHaveActive = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.queueHaveActive(req.params.orderId)); } catch (e) { next(e); }
  };

  backToQueue = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.backToQueue(req.body.order, req.body.deliveryMan)); } catch (e) { next(e); }
  };

  onlineCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.onlineCreate(req.body)); } catch (e) { next(e); }
  };

  onlineOffline = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.onlineOffline(req.params.deliveryMan)); } catch (e) { next(e); }
  };

  onlineListLastWeek = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.onlineListLastWeek(req.params.deliveryMan, req.query)); } catch (e) { next(e); }
  };

  raceCanceled = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.raceCanceled(req.body)); } catch (e) { next(e); }
  };

  raceCanceledList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.raceCanceledList(req.query.order as string, req.query.all as string)); } catch (e) { next(e); }
  };

  raceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.raceHistory(req.body)); } catch (e) { next(e); }
  };

  deliveryPrice = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.deliveryPrice(req.params.orderId)); } catch (e) { next(e); }
  };

  registerCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.registerCreate(req.body), 201); } catch (e) { next(e); }
  };

  registerList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.registerList()); } catch (e) { next(e); }
  };

  registerPaginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.registerPaginator(req.query)); } catch (e) { next(e); }
  };

  registerUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await deliveryDispatchService.registerUpdateStatus(req.params.id, req.body)); } catch (e) { next(e); }
  };
}

export default new DeliveryDispatchController();
