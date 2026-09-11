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

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const role = (req.query.role as string) || req.user!.role || "customer";
      const result = await notificationService.listForUser(userId, role, req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const role = (req.query.role as string) || req.user!.role || "customer";
      const count = await notificationService.unreadCount(userId, role);
      return res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const role = (req.body.role as string) || req.user!.role || "customer";
      const result = await notificationService.markAllRead(userId, role);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markRead(req.params.id, req.user!._id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async dismiss(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.dismiss(req.params.id, req.user!._id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
