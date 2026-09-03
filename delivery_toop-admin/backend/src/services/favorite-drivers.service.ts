import mongoose from 'mongoose';
import { FavoriteDriversModel } from '../models/FavoriteDrivers';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class FavoriteDriversService {
  async isFavorite(driver: string, passenger: string) {
    if (!driver || !isObjectId(driver)) {
      throw new AppError('Informe um motorista válido', 400);
    }
    if (!passenger || !isObjectId(passenger)) {
      throw new AppError('Informe um passageiro válido', 400);
    }

    return FavoriteDriversModel.findOne({ driver, passenger }).lean();
  }

  async toggleFavorite(data: any) {
    const { driver, passenger } = data;

    if (!driver || !isObjectId(driver)) {
      throw new AppError('Informe um motorista válido', 400);
    }
    if (!passenger || !isObjectId(passenger)) {
      throw new AppError('Informe um passageiro válido', 400);
    }

    const existing = await FavoriteDriversModel.findOne({ driver, passenger }).lean();

    if (existing && existing._id) {
      await FavoriteDriversModel.deleteOne({ driver, passenger });
      return null;
    }

    return FavoriteDriversModel.create({ driver, passenger });
  }
}

export default new FavoriteDriversService();
