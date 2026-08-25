import { BookingModel } from "../models/Booking";
import { DriverModel } from "../models/Driver";
import { AppError } from "../middleware/errorHandler";
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

export class BookingService {
  async create(data: {
    clientId: string;
    companyId?: string;
    serviceCategory: string;
    pickup: { address: string; lat: number; lng: number; complement?: string };
    dropoff: { address: string; lat: number; lng: number; complement?: string };
    paymentMethod: string;
    notes?: string;
  }) {
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const distance = this.calculateDistance(
      data.pickup.lat, data.pickup.lng,
      data.dropoff.lat, data.dropoff.lng
    );

    const estimatedPrice = this.calculatePrice(distance, data.serviceCategory);

    const booking = await BookingModel.create({
      bookingNumber,
      client: data.clientId,
      company: data.companyId,
      serviceCategory: data.serviceCategory,
      status: 'matching',
      pickup: data.pickup,
      dropoff: data.dropoff,
      distance,
      estimatedPrice,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    });

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

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.clientId) filter.client = query.clientId;
    if (query.driverId) filter.driver = query.driverId;
    if (query.companyId) filter.company = query.companyId;

    const [data, total] = await Promise.all([
      BookingModel.find(filter)
        .populate('client', 'name email phone')
        .populate('driver', 'name email phone vehicleType vehiclePlate rating')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      BookingModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async accept(bookingId: string, driverId: string) {
    const booking = await BookingModel.findOneAndUpdate(
      { _id: bookingId, status: 'matching', driver: null },
      { $set: { status: 'accepted', driver: driverId } },
      { new: true }
    );

    if (!booking) {
      throw new AppError("Corrida não está mais disponível", 400);
    }

    await DriverModel.findByIdAndUpdate(driverId, { available: false });

    return booking;
  }

  async reject(bookingId: string, driverId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }

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
    const booking = await BookingModel.findOneAndUpdate(
      { _id: bookingId, status: 'in_progress', driver: driverId },
      { $set: { status: 'completed', completedAt: new Date(), paymentStatus: 'paid' } },
      { new: true }
    );

    if (!booking) {
      throw new AppError("Corrida não pode ser concluída", 400);
    }

    await DriverModel.findByIdAndUpdate(driverId, { available: true, $inc: { totalTrips: 1 } });

    return booking;
  }

  async cancel(bookingId: string, userId: string, reason?: string, cancelledBy?: 'client' | 'driver' | 'system') {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Corrida não encontrada", 404);
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new AppError("Corrida já foi concluída ou cancelada", 400);
    }

    const updated = await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: 'cancelled',
        cancelReason: reason,
        cancelledBy: cancelledBy || 'client',
        cancelledAt: new Date(),
      },
      { new: true }
    );

    if (booking.driver) {
      await DriverModel.findByIdAndUpdate(booking.driver, { available: true });
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

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculatePrice(distanceKm: number, serviceCategory: string): number {
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

    const qrToken = crypto.randomBytes(32).toString('hex');
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
}

export default new BookingService();
