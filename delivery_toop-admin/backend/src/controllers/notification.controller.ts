import { Request, Response, NextFunction } from "express";
import notificationService from "../services/notification.service";

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.getById(req.params.id);
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.create(req.body);
      return res.status(201).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.remove(req.params.id);
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async createAndSend(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.createAndSend(req.body);
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
