import { Request, Response, NextFunction } from "express";
import bookingService from "../services/booking.service";
import { UserModel } from "../models/User";
import { emitToUser, emitToAll } from "../socket";

async function notifyNearbyDrivers(booking: any) {
  try {
    const pickup = booking.pickup;
    if (!pickup?.lat || !pickup?.lng) return;

    const { DeliverymanModel } = await import("../models/Deliveryman");
    const { DriverModel } = await import("../models/Driver");

    const maxDistance = 50000;

    const nearbyDeliverymen = await DeliverymanModel.find({
      isDriver: true,
      driverOnline: true,
      driverAvailable: true,
      active: true,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
          $maxDistance: maxDistance,
        },
      },
    }).limit(20).lean();

    const nearbyDrivers = await DriverModel.find({
      online: true,
      available: true,
      active: true,
      "serviceCategories": "driver",
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
          $maxDistance: maxDistance,
        },
      },
    }).limit(20).lean();

    const rideRequestData = {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      serviceCategory: booking.serviceCategory,
      pickup: booking.pickup,
      dropoff: booking.dropoff,
      distance: booking.distance,
      estimatedPrice: booking.estimatedPrice,
      paymentMethod: booking.paymentMethod,
      notes: booking.notes,
      createdAt: booking.createdAt,
    };

    for (const dm of nearbyDeliverymen) {
      const user = await UserModel.findOne({ deliveryman: dm._id }).lean();
      if (user) {
        emitToUser(user._id.toString(), "booking:ride_request", rideRequestData);
      }
    }

    for (const dr of nearbyDrivers) {
      const user = await UserModel.findOne({ driver: dr._id }).lean();
      if (user) {
        emitToUser(user._id.toString(), "booking:ride_request", rideRequestData);
      }
    }

    console.log(`[Booking] Notified ${nearbyDeliverymen.length} deliverymen + ${nearbyDrivers.length} drivers for booking ${booking.bookingNumber}`);
  } catch (error) {
    console.error("[Booking] Error notifying nearby drivers:", error);
  }
}

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(400).json({ success: false, error: "Usuario nao encontrado" });
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

      notifyNearbyDrivers(booking);

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
      const { driverModel } = req.body;

      let driverId: string;
      let resolvedDriverModel = driverModel || 'Driver';

      if (driverModel === 'Deliveryman') {
        const user = await UserModel.findById(userId).populate("deliveryman");
        if (!user?.deliveryman) {
          return res.status(400).json({ success: false, error: "Entregador nao encontrado" });
        }
        driverId = (user.deliveryman as any)._id.toString();
        resolvedDriverModel = 'Deliveryman';
      } else {
        const user = await UserModel.findById(userId).populate("driver");
        if (!user?.driver) {
          return res.status(400).json({ success: false, error: "Motorista nao encontrado" });
        }
        driverId = (user.driver as any)._id.toString();
        resolvedDriverModel = 'Driver';
      }

      const booking = await bookingService.accept(req.params.id, driverId, resolvedDriverModel);

      emitToUser(booking.client.toString(), "booking:accepted", {
        bookingId: booking._id,
        driverId,
      });

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const { driverModel } = req.body;

      let driverId: string;

      if (driverModel === 'Deliveryman') {
        const user = await UserModel.findById(userId).populate("deliveryman");
        if (!user?.deliveryman) {
          return res.status(400).json({ success: false, error: "Entregador nao encontrado" });
        }
        driverId = (user.deliveryman as any)._id.toString();
      } else {
        const user = await UserModel.findById(userId).populate("driver");
        if (!user?.driver) {
          return res.status(400).json({ success: false, error: "Motorista nao encontrado" });
        }
        driverId = (user.driver as any)._id.toString();
      }

      const booking = await bookingService.reject(req.params.id, driverId);

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const { driverModel } = req.body || {};

      let driverId: string;

      if (driverModel === 'Deliveryman') {
        const user = await UserModel.findById(userId).populate("deliveryman");
        if (!user?.deliveryman) {
          return res.status(400).json({ success: false, error: "Entregador nao encontrado" });
        }
        driverId = (user.deliveryman as any)._id.toString();
      } else {
        const user = await UserModel.findById(userId).populate("driver");
        if (!user?.driver) {
          return res.status(400).json({ success: false, error: "Motorista nao encontrado" });
        }
        driverId = (user.driver as any)._id.toString();
      }

      const booking = await bookingService.start(req.params.id, driverId);

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
      const { driverModel } = req.body || {};

      let driverId: string;

      if (driverModel === 'Deliveryman') {
        const user = await UserModel.findById(userId).populate("deliveryman");
        if (!user?.deliveryman) {
          return res.status(400).json({ success: false, error: "Entregador nao encontrado" });
        }
        driverId = (user.deliveryman as any)._id.toString();
      } else {
        const user = await UserModel.findById(userId).populate("driver");
        if (!user?.driver) {
          return res.status(400).json({ success: false, error: "Motorista nao encontrado" });
        }
        driverId = (user.driver as any)._id.toString();
      }

      const booking = await bookingService.complete(req.params.id, driverId);

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
