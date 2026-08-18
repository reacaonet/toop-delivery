import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.delete(req.params.id);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
