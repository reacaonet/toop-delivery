import mongoose from 'mongoose';
import { TravelBookingInfoModel } from '../models/TravelBookingInfo';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class TravelBookingService {
  async getByBooking(bookingId: string) {
    if (!isObjectId(bookingId)) {
      throw new AppError('ID de booking inválido', 400);
    }

    const info = await TravelBookingInfoModel.findOne({
      booking: bookingId,
      status: 'concluded',
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!info) {
      throw new AppError('Informações de viagem não encontradas', 404);
    }

    if (info.predictedTime !== undefined && info.predictedTime !== null) {
      if (info.predictedTime < 60) {
        (info as any).predictedTime = `${info.predictedTime} segundos`;
      } else {
        (info as any).predictedTime = `${Math.floor(info.predictedTime / 60)} minutos`;
      }
    }

    if (info.travelledTime !== undefined && info.travelledTime !== null) {
      if (info.travelledTime < 60) {
        (info as any).travelledTime = `${info.travelledTime} segundos`;
      } else {
        (info as any).travelledTime = `${Math.floor(info.travelledTime / 60)} minutos`;
      }
    }

    if (info.predictedDistance !== undefined && info.predictedDistance !== null) {
      if (info.predictedDistance < 1000) {
        (info as any).predictedDistance = `${info.predictedDistance} M`;
      } else {
        (info as any).predictedDistance = `${(info.predictedDistance / 1000).toFixed(2)} KM`;
      }
    }

    if (info.travelledDistance !== undefined && info.travelledDistance !== null) {
      if (info.travelledDistance < 1000) {
        (info as any).travelledDistance = `${info.travelledDistance} M`;
      } else {
        (info as any).travelledDistance = `${(info.travelledDistance / 1000).toFixed(2)} KM`;
      }
    }

    return info;
  }
}

export default new TravelBookingService();
