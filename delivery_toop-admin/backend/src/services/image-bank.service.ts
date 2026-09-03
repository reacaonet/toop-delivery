import mongoose from 'mongoose';
import { ImageBankModel } from '../models/ImageBank';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function extractImages(data: any): string[] {
  const images: string[] = [];
  if (Array.isArray(data.file)) {
    data.file.forEach((item: any) => {
      if (item && item.url) images.push(item.url);
    });
  } else if (data.file && typeof data.file === 'object' && data.file.url) {
    images.push(data.file.url);
  }
  return images.length ? images : data.images || [];
}

async function listWithBarcode(barcode: string, pageIn: number, size: number) {
  let list: any[];
  let numOfImageBranks: number;
  if (barcode === 'null') {
    list = await ImageBankModel.find().populate('packing', { name: 1 }).limit(size).skip(pageIn * size);
    numOfImageBranks = await ImageBankModel.countDocuments();
  } else {
    const filter = { barcode: { $regex: '.*' + barcode + '.*' } };
    list = await ImageBankModel.find(filter).populate('packing', { name: 1 }).limit(size).skip(pageIn * size);
    numOfImageBranks = await ImageBankModel.countDocuments(filter);
  }
  return { lista: list, numeroItens: numOfImageBranks };
}

export class ImageBankService {
  async list(barcode: string, pageIn: number, size: number) {
    return listWithBarcode(barcode, pageIn, size);
  }

  async listPorNome(nome: string, pageIn: number, size: number) {
    let list: any[];
    let numOfImageBranks: number;
    if (nome === 'null') {
      list = await ImageBankModel.find().populate('packing', { name: 1 }).limit(size).skip(pageIn * size);
      numOfImageBranks = await ImageBankModel.countDocuments();
    } else {
      const filter = { productAccent: { $regex: '.*' + nome.toLowerCase() + '.*', $options: 'i' } };
      list = await ImageBankModel.find(filter).populate('packing', { name: 1 }).limit(size).skip(pageIn * size);
      numOfImageBranks = await ImageBankModel.countDocuments(filter);
    }
    return { lista: list, numeroItens: numOfImageBranks };
  }

  async listPorCategory(category: string, pageIn: number, size: number) {
    let list: any[];
    let numOfImageBranks: number;
    if (category === 'null') {
      list = await ImageBankModel.find().populate('packing', { name: 1 }).limit(size).skip(pageIn * size);
      numOfImageBranks = await ImageBankModel.countDocuments();
    } else {
      const filter = { category: { $regex: '.*' + category.toLowerCase() + '.*', $options: 'i' } };
      list = await ImageBankModel.find(filter).populate('packing', { name: 1 }).limit(size).skip(pageIn * size);
      numOfImageBranks = await ImageBankModel.countDocuments(filter);
    }
    return { lista: list, numeroItens: numOfImageBranks };
  }

  async create(data: any) {
    if (!data.file || typeof data.file !== 'object') {
      throw new AppError('Imagens inválidas', 400);
    }
    const body: any = { ...data };
    body.images = extractImages(data);
    if (
      (typeof body.status === 'string' && body.status === '') ||
      body.status === null
    ) {
      body.status = false;
    }
    const imageBank = await ImageBankModel.create(body);
    return imageBank;
  }

  async register(data: any) {
    const imageBank = await ImageBankModel.create(data);
    return { imageBank };
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) throw new AppError('Id do registro inválido', 400);
    const body: any = { ...data };
    if (
      (typeof body.status === 'string' && body.status === '') ||
      body.status === null
    ) {
      body.status = false;
    }
    if (data.file) {
      body.images = extractImages(data);
    }
    const updated = await ImageBankModel.findOneAndUpdate({ _id: id }, body, {
      upsert: true,
      new: true,
    }).populate('packing', { name: 1 });
    if (!updated) throw new AppError('Registro não encontrado', 404);
    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) throw new AppError('Id do registro inválido', 400);
    await ImageBankModel.findByIdAndDelete(id);
    return { status: 200, message: 'Banco de imagens deletada com sucesso' };
  }
}

export default new ImageBankService();
