import mongoose from 'mongoose';
import { DeliveryAddressModel } from '../models/DeliveryAddress';
import { AppError } from '../middleware/errorHandler';

function mergeLocation(data: any) {
  if (!data.longitude || !data.latitude) {
    throw new AppError("Campos 'latitude' e 'longitude' são obrigatórios", 400);
  }
  data.location = {
    type: 'Point',
    coordinates: [Number(data.longitude), Number(data.latitude)],
  };
  return data;
}

export class DeliveryAddressService {
  async list(customerId?: string) {
    if (customerId && !mongoose.isValidObjectId(customerId)) {
      throw new AppError('Id inválido', 400);
    }

    if (customerId) {
      return DeliveryAddressModel.find({ customer: customerId, isDeleted: false });
    }

    return DeliveryAddressModel.find();
  }

  async search(query: { customer?: string; main?: string }) {
    const and: any[] = [];

    if (query.customer) and.push({ customer: query.customer });
    if (query.main) and.push({ main: query.main });

    if (!and.length) throw new AppError('Filtro é obrigatório', 400);

    and.push({ isDeleted: { $ne: true } });

    return DeliveryAddressModel.find({ $and: and })
      .populate('customer', { name: 1, active: 1 })
      .lean();
  }

  async get(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Endereço inválido', 400);
    return DeliveryAddressModel.findById(id);
  }

  async create(data: any) {
    data = { ...data };
    delete data._id;
    mergeLocation(data);

    data.main = true;
    const deliveryAddress = await DeliveryAddressModel.create(data);

    if (deliveryAddress && deliveryAddress._id && deliveryAddress.customer) {
      await DeliveryAddressModel.updateMany(
        { customer: deliveryAddress.customer, _id: { $ne: deliveryAddress._id } },
        { $set: { main: false } }
      );
    }

    // newTopic (tópicos de notificação por cidade) — módulo não migrado, desacoplado.
    return deliveryAddress;
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Endereço inválido', 400);

    data = { ...data };
    mergeLocation(data);

    data.main = true;
    const doc = await DeliveryAddressModel.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    });
    if (!doc) throw new AppError('Endereço não encontrado', 404);

    const customer = doc.customer?._id ?? doc.customer ?? data.customer;
    if (customer) {
      await DeliveryAddressModel.updateMany(
        { customer, _id: { $ne: doc._id } },
        { $set: { main: false } }
      );
    }

    // newTopic (tópicos de notificação por cidade) — módulo não migrado, desacoplado.
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Endereço inválido', 400);
    const doc = await DeliveryAddressModel.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { upsert: false, new: true }
    );
    if (!doc) throw new AppError('Endereço não encontrado', 404);
    return doc;
  }
}

export default new DeliveryAddressService();