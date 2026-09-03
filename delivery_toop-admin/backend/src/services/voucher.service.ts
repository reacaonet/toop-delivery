import mongoose from 'mongoose';
import { VoucherModel } from '../models/Voucher';
import { PassengerModel } from '../models/Passenger';
import passengerWalletService from './passenger-wallet.service';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeStatus(status: any): any {
  if (typeof status === 'string' && status === '') return false;
  if (status === null || status === undefined) return undefined;
  return status;
}

export class VoucherService {
  async create(data: any) {
    if (!data.franchise || !isObjectId(data.franchise)) {
      throw new AppError('Franquia não informada', 400);
    }
    if (!data.code) {
      throw new AppError('Insira o Código do Voucher', 400);
    }
    if (!data.value || data.value <= 0) {
      throw new AppError('Insira o Valor do crédito', 400);
    }
    if (!data.limit || data.limit === 0) {
      throw new AppError('Insira o limite de uso', 400);
    }
    if (!data.dateInit || !data.dateFinish) {
      throw new AppError('Insira o periodo da vigência do voucher', 400);
    }

    const body: any = {
      name: data.name,
      code: data.code,
      value: Number(data.value),
      limit: Number(data.limit),
      dateInit: new Date(data.dateInit),
      dateFinish: new Date(data.dateFinish),
      franchise: data.franchise,
      status: normalizeStatus(data.status) === undefined ? true : normalizeStatus(data.status),
    };

    const duplicate = await VoucherModel.findOne({
      code: data.code,
      franchise: data.franchise,
      deletedAt: { $exists: false },
    }).lean();

    if (duplicate && duplicate._id) {
      throw new AppError('O Código já está sendo usado em outro voucher', 400);
    }

    const voucher = await VoucherModel.create(body);
    return voucher;
  }

  async paginator(query: any) {
    const { pageIn, pageOut, franchise } = query;

    if (!franchise || !isObjectId(franchise)) {
      throw new AppError('Franquia não informada', 400);
    }
    if (!pageIn || !pageOut) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = {
      franchise,
      deletedAt: { $exists: false },
    };

    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const list = await VoucherModel.find(filter)
      .populate('franchise')
      .skip(from * size)
      .limit(size)
      .sort({ createdAt: -1 });

    const total = await VoucherModel.countDocuments(filter);

    return { list, total };
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('Id do registro inválido', 400);
    }
    const body: any = { ...data };
    const status = normalizeStatus(body.status);
    body.status = status === undefined ? body.status : status;

    const updated = await VoucherModel.findOneAndUpdate({ _id: id }, body, {
      upsert: true,
      new: true,
    });
    if (!updated) {
      throw new AppError('Voucher não encontrado', 404);
    }
    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id do registro inválido', 400);
    }
    const removed = await VoucherModel.findByIdAndUpdate(
      { _id: id },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!removed) {
      throw new AppError('Voucher não encontrado', 404);
    }
    return removed;
  }

  async validate(data: any) {
    if (!data.code) {
      throw new AppError('Insira o Código do Voucher', 400);
    }
    if (!data.passenger || !isObjectId(data.passenger)) {
      throw new AppError('Insira o ID do passageiro válido', 400);
    }

    const passenger = await PassengerModel.findById(data.passenger).lean();
    if (!passenger || !passenger.franchise) {
      throw new AppError('Franquia não localizada! Tente novamente', 400);
    }

    const voucher: any = await VoucherModel.findOne({
      code: data.code,
      franchise: passenger.franchise,
      deletedAt: { $exists: false },
    }).lean();

    if (!voucher) {
      throw new AppError('Código inválido', 400);
    }

    const now = new Date();
    if (now < new Date(voucher.dateInit) || now > new Date(voucher.dateFinish)) {
      throw new AppError('Voucher expirado!', 400);
    }

    const used: any[] = Array.isArray(voucher.used) ? voucher.used : [];
    if (voucher.limit === used.length) {
      throw new AppError('Todos os vouchers foram usado! Tente com um novo código!', 400);
    }

    const usedBefore = used.find(
      (i) => i && i.passenger && i.passenger.toString() === data.passenger
    );
    if (usedBefore) {
      throw new AppError('Você já usou esse Voucher!', 400);
    }

    const { balance } = await passengerWalletService.credit(
      data.passenger,
      voucher.value,
      'Crédito na Carteira Digital via Voucher',
      voucher._id,
      'Voucher'
    );

    const newUsed = [
      ...used,
      { passenger: new mongoose.Types.ObjectId(data.passenger), usedAt: new Date() },
    ];
    await VoucherModel.findByIdAndUpdate(
      voucher._id,
      { $set: { used: newUsed } },
      { new: true }
    );

    return { balance };
  }
}

export default new VoucherService();
