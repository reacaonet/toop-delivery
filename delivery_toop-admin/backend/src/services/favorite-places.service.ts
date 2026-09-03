import mongoose from 'mongoose';
import { FavoritePlacesModel } from '../models/FavoritePlaces';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class FavoritePlacesService {
  async list(query: any, user?: any) {
    const { passenger } = query;
    let passengerId = passenger;

    if (user?.type === 'person') {
      passengerId = user.passenger;
    }

    if (passengerId && !isObjectId(passengerId)) {
      throw new AppError('Id do passageiro inválido', 400);
    }

    const filter: any = {};
    if (passengerId) {
      filter.passenger = passengerId;
    }

    return FavoritePlacesModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }

  async create(data: any) {
    const { passenger, name, latitude, longitude, shortAddress, address } = data;

    if (!passenger || !isObjectId(passenger)) {
      throw new AppError('Informe um passageiro válido', 400);
    }

    if (!name) {
      throw new AppError('Informe o nome do local', 400);
    }

    if (latitude === undefined || longitude === undefined) {
      throw new AppError('Informe latitude e longitude', 400);
    }

    if (!shortAddress || String(shortAddress).length <= 3) {
      throw new AppError('Informe um endereço curto válido', 400);
    }

    const location = {
      type: 'Point' as const,
      coordinates: [Number(longitude), Number(latitude)],
    };

    return FavoritePlacesModel.create({
      passenger,
      name,
      location,
      shortAddress: shortAddress || '',
      address: address || '',
    });
  }
}

export default new FavoritePlacesService();
