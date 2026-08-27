import { Request, Response, NextFunction } from "express";
import bookingService from "../services/booking.service";
import { UserModel } from "../models/User";
import { emitToUser, emitToAll } from "../socket";

async function notifyNearbyDrivers(booking: any, rejectedDriverIds: string[] = []) {
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
      _id: { $nin: rejectedDriverIds },
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
      _id: { $nin: rejectedDriverIds },
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

      if (!booking.scheduledAt) {
        notifyNearbyDrivers(booking);
      }

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
      const query = { ...req.query } as any;

      // For matching status, resolve driverId and exclude rejected rides
      if (!query.driverId && !query.clientId && query.status === 'matching') {
        const userId = (req as any).user?._id;
        const user = await UserModel.findById(userId).select('deliveryman driver role');
        let driverObjectId = null;
        if (user?.deliveryman) {
          driverObjectId = user.deliveryman;
        } else if (user?.driver) {
          driverObjectId = user.driver;
        }
        if (driverObjectId) {
          query._excludedDriverId = driverObjectId.toString();
        }
      } else if (!query.driverId && !query.clientId && query.status && query.status !== 'matching') {
        const userId = (req as any).user?._id;
        const user = await UserModel.findById(userId).select('deliveryman driver role');
        if (user?.deliveryman && (user.role === 'deliveryman')) {
          query.driverId = user.deliveryman.toString();
        } else if (user?.driver && (user.role === 'deliveryman')) {
          query.driverId = user.driver.toString();
        }
      }

      const result = await bookingService.list(query);
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
        driverModel: resolvedDriverModel,
      });

      // Also emit to the driver so their ActiveRidePage can update instantly
      emitToUser(userId.toString(), "booking:accepted", {
        bookingId: booking._id,
        driverId,
      });

      // Broadcast to all other drivers that this ride is no longer available
      const { emitToAll } = await import("../socket");
      emitToAll("booking:ride_taken", { bookingId: booking._id.toString() });

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

      const updatedBooking = await bookingService.getById(req.params.id);
      const rejectedIds = (updatedBooking.rejectedDrivers || []).map((id: any) => id.toString());
      notifyNearbyDrivers(updatedBooking, rejectedIds);

      // Notify the rejecting driver that the ride was rejected (dismiss popup)
      emitToUser(userId.toString(), "booking:rejected_for_me", {
        bookingId: booking._id,
      });

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

      emitToUser(userId.toString(), "booking:in_progress", {
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

      emitToUser(userId.toString(), "booking:completed", {
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

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { BookingModel } = await import("../models/Booking");
      const { DriverModel } = await import("../models/Driver");
      const { DeliverymanModel } = await import("../models/Deliveryman");

      const [byStatus, revenueResult, todayResult, avgRatingRes, popRoutes, driverAgg] = await Promise.all([
        BookingModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        BookingModel.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$finalPrice" } } },
        ]),
        BookingModel.countDocuments({
          status: "completed",
          completedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }),
        BookingModel.aggregate([
          { $match: { status: "completed", "rating.client": { $exists: true } } },
          { $group: { _id: null, avg: { $avg: "$rating.client" } } },
        ]),
        BookingModel.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: "$dropoff.address", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
        Promise.all([
          DriverModel.countDocuments({ active: true }),
          DriverModel.countDocuments({ active: true, online: true }),
          DeliverymanModel.countDocuments({ active: true, isDriver: true, driverOnline: true }),
        ]).then(([dActive, dOnline, dmOnline]) => ({ active: dActive, online: dOnline + dmOnline })),
      ]);

      const statusCounts: Record<string, number> = {};
      byStatus.forEach((s: any) => { statusCounts[s._id] = s.count; });

      return res.status(200).json({
        success: true,
        data: {
          statusCounts,
          total: byStatus.reduce((acc: number, s: any) => acc + s.count, 0),
          revenue: revenueResult[0]?.total || 0,
          completedToday: todayResult,
          avgRating: avgRatingRes[0]?.avg ? Math.round(avgRatingRes[0].avg * 10) / 10 : 0,
          popularRoutes: popRoutes.map(r => ({ address: r._id, count: r.count })),
          drivers: driverAgg,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingController();
