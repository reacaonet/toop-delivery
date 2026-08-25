import { Request, Response, NextFunction } from "express";
import driverService from "../services/driver.service";
import { UserModel } from "../models/User";
import { DriverModel } from "../models/Driver";

export class DriverController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.create(req.body);
      return res.status(201).json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.getById(req.params.id);
      return res.status(200).json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await driverService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, maxDistance, serviceCategory } = req.query;
      const drivers = await driverService.findNearby(
        parseFloat(lat as string),
        parseFloat(lng as string),
        maxDistance ? parseInt(maxDistance as string) : undefined,
        serviceCategory as string
      );
      return res.status(200).json({ success: true, data: drivers });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId).populate("driver");
      if (!user?.driver) {
        return res.status(400).json({ success: false, error: "Motorista não encontrado" });
      }

      const { lat, lng, heading, speed } = req.body;
      const driver = await driverService.updateLocation(
        (user.driver as any)._id.toString(),
        lat,
        lng,
        heading,
        speed
      );

      const { getIO } = await import("../socket");
      const io = getIO();
      io.emit("driver:location_broadcast", {
        driverId: (user.driver as any)._id.toString(),
        location: { lat, lng, heading, speed, timestamp: Date.now() },
      });

      return res.status(200).json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }

  async toggleAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId).populate("driver");
      if (!user?.driver) {
        return res.status(400).json({ success: false, error: "Motorista não encontrado" });
      }

      const result = await driverService.toggleAvailability(
        (user.driver as any)._id.toString()
      );

      const { getIO } = await import("../socket");
      const io = getIO();
      io.emit("driver:status_change", {
        driverId: (user.driver as any)._id.toString(),
        available: result.available,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleOnline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId).populate("driver");
      if (!user?.driver) {
        return res.status(400).json({ success: false, error: "Motorista não encontrado" });
      }

      const result = await driverService.toggleOnline(
        (user.driver as any)._id.toString()
      );

      const { getIO } = await import("../socket");
      const io = getIO();
      io.emit("driver:status_change", {
        driverId: (user.driver as any)._id.toString(),
        online: result.online,
        available: result.available,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.delete(req.params.id);
      return res.status(200).json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }
}

export default new DriverController();
