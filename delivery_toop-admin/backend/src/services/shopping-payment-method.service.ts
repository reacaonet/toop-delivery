import { Types } from 'mongoose';
import { ShoppingPaymentMethodModel } from '../models/ShoppingPaymentMethod';
import paymentGatewayService from './payment-gateway.service';
import { AppError } from '../middleware/errorHandler';

function normalizeExpiration(input: unknown): string {
  const raw = String(input || '').trim();
  const match = raw.match(/^(\d{2})[\/\-\.](\d{2,4})$/);
  if (match) {
    return `${match[1]}/${String(match[2]).slice(-2)}`;
  }
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${mm}/${String(parsed.getFullYear()).slice(-2)}`;
  }
  return raw;
}

function expirationToDate(input: unknown): Date {
  const raw = String(input || '').trim();
  const match = raw.match(/^(\d{2})[\/\-\.](\d{2,4})$/);
  if (match) {
    let yy = Number(match[2]);
    if (yy < 100) yy += yy < 70 ? 2000 : 1900;
    const mm = Number(match[1]);
    if (mm >= 1 && mm <= 12) {
      return new Date(Date.UTC(yy, mm, 0, 23, 59, 59));
    }
  }
  return new Date(raw);
}

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

  async create(customer: string, data: any = {}) {
    if (!customer || !Types.ObjectId.isValid(customer)) {
      throw new AppError('Id do cliente inválido', 400);
    }

    const { nameOnCard, cardNumber, valid, verifierCode, documentType, document, flag, gateway } = data;

    if (!nameOnCard || !cardNumber || !valid || !verifierCode || !document) {
      throw new AppError(
        'Informe os dados do cartão (nameOnCard, cardNumber, valid, verifierCode, documentType, document)',
        400
      );
    }

    const tokenizeResult = await paymentGatewayService.tokenizeCard({
      CustomerName: nameOnCard,
      CardNumber: String(cardNumber).replace(/\s/g, ''),
      Holder: nameOnCard,
      ExpirationDate: normalizeExpiration(valid),
      Brand: flag,
      SecurityCode: verifierCode,
    });

    const unwrapped: any =
      (tokenizeResult as any)?.data && typeof (tokenizeResult as any).data === 'object'
        ? (tokenizeResult as any).data
        : tokenizeResult;

    const cardToken = unwrapped?.token || unwrapped?.cardToken || (tokenizeResult as any)?.token;
    if (!cardToken) {
      throw new AppError('Não foi possível obter o token do cartão no gateway de pagamentos', 400);
    }

    const payload: Record<string, any> = {
      customer,
      isMain: data.isMain === true || data.isMain === 'true' || false,
      flag: flag || 'VISA',
      cartNumber: String(cardNumber).slice(-4),
      nameOnCard,
      valid: expirationToDate(valid),
      verifierCode,
      documentType: documentType === 'PASSPORT' ? 'PASSPORT' : 'CPF',
      document,
      gateway: gateway || 'PAGARME',
      cardToken,
    };

    const created = await ShoppingPaymentMethodModel.create(payload);

    if (created.isMain) {
      await ShoppingPaymentMethodModel.updateMany(
        { customer, _id: { $ne: created._id } },
        { isMain: false }
      );
    }

    return created;
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