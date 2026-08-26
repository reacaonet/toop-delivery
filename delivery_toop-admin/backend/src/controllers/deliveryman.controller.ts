import { Request, Response, NextFunction } from "express";
import deliverymanService from "../services/deliveryman.service";
import { UserModel } from "../models/User";
import { DeliverymanModel } from "../models/Deliveryman";

export class DeliverymanController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.create(req.body);
      return res.status(201).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.getById(req.params.id);
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const deliveryman = await DeliverymanModel.findById(user.deliveryman);
      if (!deliveryman) {
        return res.status(404).json({ success: false, error: "Entregador não encontrado" });
      }
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await deliverymanService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async toggleAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const result = await deliverymanService.toggleAvailability(user.deliveryman.toString());
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleDriverMode(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const result = await deliverymanService.toggleDriverMode(user.deliveryman.toString());
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleDriverOnline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const { lat, lng } = req.body || {};
      const result = await deliverymanService.toggleDriverOnline(user.deliveryman.toString(), lat, lng);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleDriverAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const result = await deliverymanService.toggleDriverAvailable(user.deliveryman.toString());
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const { lat, lng } = req.body;
      const result = await deliverymanService.updateLocation(user.deliveryman.toString(), lat, lng);

      const { getIO } = await import("../socket");
      const io = getIO();
      io.emit("driver:location_broadcast", {
        driverId: user.deliveryman.toString(),
        location: { lat, lng, timestamp: Date.now() },
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador não encontrado" });
      }
      const { address, lat, lng } = req.body;
      const result = await deliverymanService.updateAddress(user.deliveryman.toString(), address, lat, lng);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user?.deliveryman) {
        return res.status(400).json({ success: false, error: "Entregador nao encontrado" });
      }
      const deliveryman = await deliverymanService.update(user.deliveryman.toString(), req.body);
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveryman = await deliverymanService.delete(req.params.id);
      return res.status(200).json({ success: true, data: deliveryman });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeliverymanController();
