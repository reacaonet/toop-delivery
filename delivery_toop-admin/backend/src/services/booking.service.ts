import { BookingModel } from "../models/Booking";
import { DriverModel } from "../models/Driver";
import { DeliverymanModel } from "../models/Deliveryman";
import { AppError } from "../middleware/errorHandler";
import walletService from "./wallet.service";
import promoService from "./promo.service";
import QRCode from "qrcode";
import crypto from "crypto";

interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  clientId?: string;
  driverId?: string;
  companyId?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

const CANCEL_FEE_CONFIG = {
  client: {
    beforeMatch: 0,
    afterMatch: 0,
    afterAccepted: 2.00,
    afterStarted: 5.00,
  },
  driver: {
    beforeMatch: 0,
    afterMatch: 0,
    afterAccepted: 3.00,
    afterStarted: 8.00,
  },
  platformFeePercent: 20,
};

export class BookingService {
  async create(data: {
    clientId: string;
    companyId?: string;
    serviceCategory: string;
    pickup: { address: string; lat: number; lng: number; complement?: string };
    dropoff: { address: string; lat: number; lng: number; complement?: string };
    paymentMethod: string;
    notes?: string;
    scheduledAt?: string;
    promoCode?: string;
  }) {
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const distance = this.calculateDistance(
      data.pickup.lat, data.pickup.lng,
      data.dropoff.lat, data.dropoff.lng
    );

    let estimatedPrice = this.calculatePrice(distance, data.serviceCategory);
    const duration = this.calculateDuration(distance);

    let promoDiscount: number | undefined;
    if (data.promoCode) {
      const result = await promoService.validateCode(data.promoCode, data.clientId, estimatedPrice);
      if (!result.valid) {
        throw new AppError(result.message, 400);
      }
      promoDiscount = result.discount;
      estimatedPrice = Math.round((estimatedPrice - result.discount) * 100) / 100;
    }

    const status = data.scheduledAt ? 'pending' : 'matching';

    const booking = await BookingModel.create({
      bookingNumber,
      client: data.clientId,
      company: data.companyId,
      serviceCategory: data.serviceCategory,
      status,
      pickup: data.pickup,
      dropoff: data.dropoff,
      distance,
      duration,
      estimatedPrice,
      promoCode: promoDiscount !== undefined ? data.promoCode?.toUpperCase().trim() : undefined,
      promoDiscount,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    });

    if (promoDiscount !== undefined) {
      try {
        await promoService.applyToBooking(booking, data.clientId);
      } catch (err) {
        console.error("[Booking] Erro ao registrar uso do cupom:", err);
      }
    }

    return booking;
  }

  async getById(id: string) {
    const booking = await BookingModel.findById(id)
      .populate('client', 'name email phone')
      .populate('driver', 'name email phone vehicleType vehiclePlate rating');
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }
    return booking;
  }

  async list(query: PaginationQuery & { _excludedDriverId?: string }): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.clientId) filter.client = query.clientId;
    if (query.driverId) filter.driver = query.driverId;
    if (query.companyId) filter.company = query.companyId;

    // Exclude rides already rejected by this driver
    if (query._excludedDriverId) {
      filter.rejectedDrivers = { $ne: query._excludedDriverId };
    }

    const [data, total] = await Promise.all([
      BookingModel.find(filter)
        .populate('client', 'name email phone')
        .populate('driver', 'name email phone vehicleType vehiclePlate rating')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      BookingModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async accept(bookingId: string, driverId: string, driverModel: string = 'Driver') {
    const booking = await BookingModel.findOneAndUpdate(
      { _id: bookingId, status: 'matching', driver: null },
      { $set: { status: 'accepted', driver: driverId, driverModel } },
      { new: true }
    );

    if (!booking) {
      throw new AppError("Corrida não está mais disponível", 400);
    }

    if (driverModel === 'Driver') {
      await DriverModel.findByIdAndUpdate(driverId, { available: false });
    } else {
      await DeliverymanModel.findByIdAndUpdate(driverId, { driverAvailable: false });
    }

    return booking;
  }

  async reject(bookingId: string, driverId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }

    if (booking.status !== 'matching') {
      throw new AppError("Corrida não está mais disponível para rejeição", 400);
    }

    await BookingModel.findByIdAndUpdate(bookingId, {
      $addToSet: { rejectedDrivers: driverId },
    });

    return booking;
  }

  async start(bookingId: string, driverId: string) {
    const booking = await BookingModel.findOneAndUpdate(
      { _id: bookingId, status: 'accepted', driver: driverId },
      { $set: { status: 'in_progress', startedAt: new Date() } },
      { new: true }
    );

    if (!booking) {
      throw new AppError("Corrida não pode ser iniciada", 400);
    }

    return booking;
  }

  async complete(bookingId: string, driverId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking || booking.status !== 'in_progress' || booking.driver?.toString() !== driverId) {
      throw new AppError("Corrida não pode ser concluída", 400);
    }

    const completedAt = new Date();
    const duration = booking.startedAt
      ? Math.round((completedAt.getTime() - booking.startedAt.getTime()) / 60000)
      : booking.duration || 0;

    const finalPrice = booking.estimatedPrice || 0;
    const platformFee = Math.round(finalPrice * CANCEL_FEE_CONFIG.platformFeePercent / 100 * 100) / 100;
    const driverEarning = Math.round((finalPrice - platformFee) * 100) / 100;

    const updated = await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: 'completed',
        completedAt,
        duration,
        finalPrice,
        paymentStatus: 'paid',
      },
      { new: true }
    );

    if (!updated) {
      throw new AppError("Erro ao concluir corrida", 500);
    }

    if (booking.driverModel === 'Driver') {
      await DriverModel.findByIdAndUpdate(driverId, { available: true, $inc: { totalTrips: 1 } });
    } else {
      await DeliverymanModel.findByIdAndUpdate(driverId, { driverAvailable: true, $inc: { totalTrips: 1 } });
    }

    try {
      await walletService.credit(
        driverId,
        driverEarning,
        `Corrida ${booking.bookingNumber} - ${booking.distance?.toFixed(1) || 0}km`,
        bookingId
      );
    } catch (err) {
      console.error("[Booking] Erro ao creditar wallet do motorista:", err);
    }

    return updated;
  }

  async cancel(bookingId: string, userId: string, reason?: string, cancelledBy?: 'client' | 'driver' | 'system') {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new AppError("Corrida já foi concluída ou cancelada", 400);
    }

    let cancelFee = 0;
    const cancelType = cancelledBy || 'client';
    const feeConfig = (CANCEL_FEE_CONFIG as Record<string, any>)[cancelType] || CANCEL_FEE_CONFIG.client;

    if (cancelType === 'client') {
      if (booking.status === 'accepted') cancelFee = feeConfig.afterAccepted;
      else if (booking.status === 'in_progress') cancelFee = feeConfig.afterStarted;
    } else if (cancelType === 'driver') {
      if (booking.status === 'accepted') cancelFee = feeConfig.afterAccepted;
      else if (booking.status === 'in_progress') cancelFee = feeConfig.afterStarted;
    }

    if (booking.status === 'matching') {
      cancelFee = 0;
    }

    const updated = await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: 'cancelled',
        cancelReason: reason,
        cancelledBy: cancelType,
        cancelledAt: new Date(),
        cancelFee,
      },
      { new: true }
    );

    if (booking.driver) {
      if (booking.driverModel === 'Driver') {
        await DriverModel.findByIdAndUpdate(booking.driver, { available: true });
      } else {
        await DeliverymanModel.findByIdAndUpdate(booking.driver, { driverAvailable: true });
      }
    }

    return updated;
  }

  async rate(bookingId: string, userId: string, rating: number, comment?: string, ratingType: 'client' | 'driver' = 'client') {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }

    if (booking.status !== 'completed') {
      throw new AppError("Só é possível avaliar corridas concluídas", 400);
    }

    const updateData: any = {};
    if (ratingType === 'client') {
      updateData['rating.client'] = rating;
      updateData['rating.clientComment'] = comment;
    } else {
      updateData['rating.driver'] = rating;
      updateData['rating.driverComment'] = comment;
    }

    const updated = await BookingModel.findByIdAndUpdate(bookingId, updateData, { new: true });

    if (ratingType === 'client' && booking.driver) {
      const driverBookings = await BookingModel.find({
        driver: booking.driver,
        status: 'completed',
        'rating.driver': { $exists: true },
      });

      if (driverBookings.length > 0) {
        const avgRating = driverBookings.reduce((sum, b) => sum + (b.rating?.driver || 0), 0) / driverBookings.length;
        await DriverModel.findByIdAndUpdate(booking.driver, { rating: Math.round(avgRating * 10) / 10 });
      }
    }

    return updated;
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  calculateDuration(distanceKm: number): number {
    const avgSpeedKmh = 30;
    return Math.ceil((distanceKm / avgSpeedKmh) * 60);
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  calculatePrice(distanceKm: number, serviceCategory: string): number {
    const basePrices: Record<string, number> = {
      driver: 5.00,
      delivery: 3.00,
      package: 4.00,
    };
    const perKmPrices: Record<string, number> = {
      driver: 2.50,
      delivery: 1.50,
      package: 2.00,
    };

    const base = basePrices[serviceCategory] || 5.00;
    const perKm = perKmPrices[serviceCategory] || 2.50;

    return Math.round((base + distanceKm * perKm) * 100) / 100;
  }

  async generateQRCode(bookingId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }

    if (booking.status !== 'accepted' && booking.status !== 'in_progress') {
      throw new AppError("QR Code só pode ser gerado para corridas aceitas ou em andamento", 400);
    }

    const qrToken = String(Math.floor(100000 + Math.random() * 900000));
    const qrData = JSON.stringify({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      token: qrToken,
      timestamp: Date.now(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    await BookingModel.findByIdAndUpdate(bookingId, {
      qrCode: qrToken,
      qrCodeVerified: false,
    });

    return { qrCode: qrCodeDataUrl, token: qrToken };
  }

  async verifyQRCode(bookingId: string, token: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }

    if (booking.qrCode !== token) {
      throw new AppError("QR Code inválido", 400);
    }

    await BookingModel.findByIdAndUpdate(bookingId, {
      qrCodeVerified: true,
    });

    return { verified: true, bookingNumber: booking.bookingNumber };
  }

  async activateScheduledRides(): Promise<number> {
    const now = new Date();
    const result = await BookingModel.updateMany(
      { status: 'pending', scheduledAt: { $lte: now } },
      { $set: { status: 'matching' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Scheduler] ${result.modifiedCount} scheduled rides activated`);
      try {
        const { emitToAll } = await import('../socket');
        emitToAll('scheduler:rides_activated', { count: result.modifiedCount });
      } catch {}
    }

    return result.modifiedCount;
  }
}

export default new BookingService();
