import mongoose from 'mongoose';
import { BookingModel } from '../models/Booking';
import { DriverModel } from '../models/Driver';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Schedule mapping to modern Booking model:
 * - Legacy "scheduled" status maps to modern "pending" status with scheduledAt set
 * - startRaceAt maps to scheduledAt
 * - passenger (legacy ref) maps to client (modern User ref)
 * - raceToDriver/driver maps to driver
 * - origin/destiny (legacy PointSchema) maps to pickup/dropoff
 * - price maps to proposedPrice / estimatedPrice
 */
export class MobilityScheduleService {
  async getScheduledByDriver(driverId: string) {
    if (!isObjectId(driverId)) {
      throw new AppError('ID do motorista inválido', 400);
    }

    const bookings = await BookingModel.find({
      driver: new mongoose.Types.ObjectId(driverId),
      status: { $in: ['pending', 'accepted'] },
      scheduledAt: { $exists: true, $ne: null },
    })
      .populate('client', 'name email phone')
      .populate('driver', 'name email phone vehicleType vehiclePlate rating')
      .sort({ createdAt: -1 });

    return { list: bookings };
  }

  async createSchedule(data: {
    clientId?: string;
    driverId?: string;
    serviceCategory?: string;
    pickup?: { address: string; lat: number; lng: number };
    dropoff?: { address: string; lat: number; lng: number };
    scheduledAt: string;
    price?: number;
    company?: string;
    notes?: string;
    distance?: number;
    duration?: number;
  }) {
    if (!data.scheduledAt) {
      throw new AppError('Data de agendamento é obrigatória', 400);
    }

    if (data.driverId && !isObjectId(data.driverId)) {
      throw new AppError('ID do motorista inválido', 400);
    }

    if (data.clientId && !isObjectId(data.clientId)) {
      throw new AppError('ID do cliente inválido', 400);
    }

    if (!data.pickup || !data.dropoff) {
      throw new AppError('Origem e destino são obrigatórios', 400);
    }

    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const booking = await BookingModel.create({
      bookingNumber,
      client: data.clientId || undefined,
      driver: data.driverId || undefined,
      serviceCategory: (data.serviceCategory as any) || 'driver',
      status: 'pending',
      pickup: {
        address: data.pickup.address || '',
        lat: data.pickup.lat || 0,
        lng: data.pickup.lng || 0,
      },
      dropoff: {
        address: data.dropoff.address || '',
        lat: data.dropoff.lat || 0,
        lng: data.dropoff.lng || 0,
      },
      distance: data.distance,
      duration: data.duration,
      estimatedPrice: data.price,
      proposedPrice: data.price,
      paymentMethod: 'MONEY',
      notes: data.notes,
      company: data.company || undefined,
      scheduledAt: new Date(data.scheduledAt),
    });

    return booking;
  }

  async updateSchedule(data: {
    id: string;
    driverId?: string;
    pickup?: { address: string; lat: number; lng: number };
    dropoff?: { address: string; lat: number; lng: number };
    scheduledAt?: string;
    price?: number;
    notes?: string;
    distance?: number;
    duration?: number;
  }) {
    if (!data.id || !isObjectId(data.id)) {
      throw new AppError('ID do agendamento inválido', 400);
    }

    const booking = await BookingModel.findOne({
      _id: data.id,
      status: 'pending',
    });

    if (!booking) {
      throw new AppError('Agendamento não encontrado ou não está pendente', 404);
    }

    const updateData: any = {};

    if (data.driverId) {
      if (!isObjectId(data.driverId)) {
        throw new AppError('ID do motorista inválido', 400);
      }
      updateData.driver = new mongoose.Types.ObjectId(data.driverId);
    }

    if (data.pickup) {
      updateData.pickup = {
        address: data.pickup.address || '',
        lat: data.pickup.lat || 0,
        lng: data.pickup.lng || 0,
      };
    }

    if (data.dropoff) {
      updateData.dropoff = {
        address: data.dropoff.address || '',
        lat: data.dropoff.lat || 0,
        lng: data.dropoff.lng || 0,
      };
    }

    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    if (data.price !== undefined) {
      updateData.proposedPrice = data.price;
      updateData.estimatedPrice = data.price;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.distance !== undefined) {
      updateData.distance = data.distance;
    }

    if (data.duration !== undefined) {
      updateData.duration = data.duration;
    }

    const updated = await BookingModel.findOneAndUpdate(
      { _id: data.id },
      updateData,
      { new: true }
    );

    return updated;
  }
}

export default new MobilityScheduleService();
