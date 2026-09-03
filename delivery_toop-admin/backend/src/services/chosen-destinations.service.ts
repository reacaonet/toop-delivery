import mongoose from 'mongoose';
import { ChosenDestinationsModel } from '../models/ChosenDestinations';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class ChosenDestinationsService {
  async list(query: any) {
    const { driver } = query;

    if (!driver || !isObjectId(driver)) {
      throw new AppError('Informe um motorista válido', 400);
    }

    return ChosenDestinationsModel.find({ driver }).sort({ createdAt: -1 });
  }

  async create(data: any) {
    const { driver, latitude, longitude } = data;

    if (!driver || !isObjectId(driver)) {
      throw new AppError('Informe um motorista válido', 400);
    }

    if (latitude === undefined || longitude === undefined) {
      throw new AppError('Informe latitude e longitude', 400);
    }

    const location = {
      type: 'Point' as const,
      coordinates: [Number(longitude), Number(latitude)],
    };

    return ChosenDestinationsModel.create({ driver, location, status: data.status ?? true });
  }

  async update(driver: string, id: string, data: any) {
    if (!driver || !isObjectId(driver)) {
      throw new AppError('Informe um motorista válido', 400);
    }
    if (!id || !isObjectId(id)) {
      throw new AppError('Informe um destino válido', 400);
    }

    const item = await ChosenDestinationsModel.findOne({ _id: id, driver }).select({ _id: 1 });
    if (!item) {
      throw new AppError('Informe um destino válido', 400);
    }

    await ChosenDestinationsModel.updateOne({ _id: id }, data);
    return { message: 'Atualizado com sucesso!' };
  }

  async remove(driver: string, id: string) {
    if (!driver || !isObjectId(driver)) {
      throw new AppError('Informe um motorista válido', 400);
    }
    if (!id || !isObjectId(id)) {
      throw new AppError('Informe um destino válido', 400);
    }

    const item = await ChosenDestinationsModel.findOne({ _id: id, driver }).select({ _id: 1 });
    if (!item) {
      throw new AppError('Informe um destino válido', 400);
    }

    await ChosenDestinationsModel.deleteOne({ _id: id });
    return { message: 'Removido com sucesso!' };
  }
}

export default new ChosenDestinationsService();
