import { Request, Response, NextFunction } from "express";
import bookingService from "../services/booking.service";
import { UserModel } from "../models/User";
import { emitToUser, emitToAll } from "../socket";

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(400).json({ success: false, error: "Usuário não encontrado" });
      }

      const booking = await bookingService.create({
        clientId: userId,
        companyId: user.company?.toString(),
        ...req.body,
      });

      emitToAll("booking:new_request", {
        bookingId: booking._id,
        serviceCategory: booking.serviceCategory,
      });

      return res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getById(req.params.id);
      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookingService.list(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId).populate("driver");
      if (!user?.driver) {
        return res.status(400).json({ success: false, error: "Motorista não encontrado" });
      }

      const booking = await bookingService.accept(
        req.params.id,
        (user.driver as any)._id.toString()
      );

      emitToUser(booking.client.toString(), "booking:accepted", {
        bookingId: booking._id,
        driver: user.driver,
      });

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId).populate("driver");
      if (!user?.driver) {
        return res.status(400).json({ success: false, error: "Motorista não encontrado" });
      }

      const booking = await bookingService.reject(
        req.params.id,
        (user.driver as any)._id.toString()
      );

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId).populate("driver");
      if (!user?.driver) {
        return res.status(400).json({ success: false, error: "Motorista não encontrado" });
      }

      const booking = await bookingService.start(
        req.params.id,
        (user.driver as any)._id.toString()
      );

      emitToUser(booking.client.toString(), "booking:in_progress", {
        bookingId: booking._id,
      });

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId).populate("driver");
      if (!user?.driver) {
        return res.status(400).json({ success: false, error: "Motorista não encontrado" });
      }

      const booking = await bookingService.complete(
        req.params.id,
        (user.driver as any)._id.toString()
      );

      emitToUser(booking.client.toString(), "booking:completed", {
        bookingId: booking._id,
      });

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const { reason, cancelledBy } = req.body;

      const booking = await bookingService.cancel(
        req.params.id,
        userId,
        reason,
        cancelledBy
      );

      if (booking) {
        const driverId = booking.driver ? booking.driver.toString() : null;
        if (driverId) {
          emitToUser(driverId, "booking:cancelled", {
            bookingId: booking._id,
          });
        }

        const clientId = booking.client ? booking.client.toString() : null;
        if (clientId) {
          emitToUser(clientId, "booking:cancelled", {
            bookingId: booking._id,
          });
        }
      }

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async rate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const { rating, comment, ratingType } = req.body;

      const booking = await bookingService.rate(
        req.params.id,
        userId,
        rating,
        comment,
        ratingType
      );

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async generateQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookingService.generateQRCode(req.params.id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async verifyQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await bookingService.verifyQRCode(req.params.id, token);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingController();
