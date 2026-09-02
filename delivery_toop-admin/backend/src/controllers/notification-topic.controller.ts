import { Request, Response, NextFunction } from "express";
import firebaseTopicService from "../services/notification-topic.service";

export class NotificationTopicController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await firebaseTopicService.create(req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await firebaseTopicService.send(req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationTopicController();
