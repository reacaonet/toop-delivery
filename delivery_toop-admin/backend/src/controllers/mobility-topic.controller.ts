import { Request, Response, NextFunction } from 'express';
import mobilityTopicService from '../services/mobility-topic.service';

export class MobilityTopicController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityTopicService.create(req.body);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  send = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityTopicService.send(req.body);
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };

  linkUserTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await mobilityTopicService.linkUserTopics();
      return this.ok(res, data);
    } catch (e) {
      next(e);
    }
  };
}

export default new MobilityTopicController();
