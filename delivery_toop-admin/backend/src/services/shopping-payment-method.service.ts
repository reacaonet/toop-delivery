import { Types } from 'mongoose';
import { ShoppingPaymentMethodModel } from '../models/ShoppingPaymentMethod';
import { AppError } from '../middleware/errorHandler';

export class ShoppingPaymentMethodService {
  async list(customer: string, query: Record<string, any> = {}) {
    if (!customer || !Types.ObjectId.isValid(customer)) {
      throw new AppError('Id do cliente inválido', 400);
    }

    const data: Record<string, any> = { customer };
    const and: Record<string, unknown>[] = [];

    if (query.isMain !== undefined) {
      and.push({ isMain: query.isMain === 'true' });
    }

    if (query.isDeleted !== undefined) {
      and.push({ isDeleted: query.isDeleted === 'true' });
    } else {
      and.push({ isDeleted: false });
    }

    if (query.flag) {
      and.push({ flag: query.flag });
    }

    if (and.length > 0) {
      data.$and = and;
    }

    return ShoppingPaymentMethodModel.find(data);
  }

  async create(_customer: string, _data: any) {
    throw new AppError(
      'Criação de método de pagamento depende do gateway de pagamentos (Braspag/PagarMe/Iugu) - Passo 1.9 da migração',
      501
    );
  }

  async update(id: string, data: any) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }

    const paymentMethod = await ShoppingPaymentMethodModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      data,
      { new: true, runValidators: true }
    );

    if (!paymentMethod) throw new AppError('Método de pagamento não encontrado', 404);

    if (paymentMethod.isMain) {
      await ShoppingPaymentMethodModel.updateMany(
        { customer: paymentMethod.customer, _id: { $ne: paymentMethod._id } },
        { isMain: false }
      );
    }

    return paymentMethod;
  }

  async softDelete(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }

    const removed = await ShoppingPaymentMethodModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true }
    );

    if (!removed) throw new AppError('Método de pagamento não encontrado', 404);
    return removed;
  }
}

export default new ShoppingPaymentMethodService();