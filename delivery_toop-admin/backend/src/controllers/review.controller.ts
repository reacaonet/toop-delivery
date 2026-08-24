import { Request, Response, NextFunction } from "express";
import reviewService from "../services/review.service";
import { UserModel } from "../models/User";

export class ReviewController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const review = await reviewService.create({
        orderId: req.body.orderId,
        customerId: userId,
        rating: req.body.rating,
        comment: req.body.comment,
        type: req.body.type,
      });
      return res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  async listByCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewService.listByCompany(
        req.params.companyId,
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.listByOrder(req.params.orderId);
      return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }

  async getReviewableOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const orders = await reviewService.getReviewableOrders(userId);
      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
