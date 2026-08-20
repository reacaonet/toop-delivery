import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, password } = req.body;
      const result = await authService.register({ name, email, phone, password });
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async registerDeliveryman(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, password, vehicleType, cpf, cnh, vehiclePlate } = req.body;
      const result = await authService.registerDeliveryman({
        name, email, phone, password, vehicleType, cpf, cnh, vehiclePlate,
      });
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const result = await authService.getMe(userId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
