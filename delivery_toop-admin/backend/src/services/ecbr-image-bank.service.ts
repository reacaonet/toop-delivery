import mongoose from 'mongoose';
import { EcbrProductDepartmentModel } from '../models/EcbrProductDepartment';
import { AppError } from '../middleware/errorHandler';

function leftPad(value: string | number, totalWidth: number, paddingChar = '0'): string {
  const str = String(value);
  const length = totalWidth - str.length + 1;
  return (length > 0 ? Array(length).join(paddingChar) : '') + str;
}

function extractImages(body: any): string[] {
  const images: string[] = [];
  const file = body.file;
  const url = body.url;
  if (Array.isArray(file)) {
    file.forEach((item) => {
      if (item && item.url) images.push(item.url);
    });
  } else if (file && Array.isArray(file) === false && file.url) {
    images.push(file.url);
  } else if (url) {
    images.push(url);
  }
  return images;
}

async function propagateToProducts(barcode: string, payload: any) {
  try {
    const db = mongoose.connection.db;
    if (!db) return 0;
    const products = db.collection('products');
    if (products) {
      const result = await (products as any).updateMany(
        { barcode: String(barcode), pauseSync: { $ne: true } },
        { $set: payload }
      );
      return result.modifiedCount || 0;
    }
  } catch {
    return 0;
  }
}

export class EcbrImageBankService {
  async list(query: any) {
    const {
      page, limit, barcode, name, isCopyright, isImages, isDepartments, status, audited, company,
    } = query;

    let nPerPage = 50;
    let pageNumber = 1;

    if (page && page > 0) pageNumber = Number(`${page}`);
    if (limit && limit > 0) nPerPage = Number(`${limit}`);

    const or: any[] = [];
    const match: any = {};

    if (barcode && `${barcode}`.length >= 2) {
      or.push({ barcode: { $regex: '.*' + String(barcode).trim() + '.*', $options: 'i' } });
    }
    if (name && `${name}`.length >= 2) {
      or.push({ name: { $regex: '.*' + String(name).trim() + '.*', $options: 'i' } });
    }
    if (or.length > 0) match.$or = or;

    if (`${isCopyright}` === 'true' || `${isCopyright}` === 'false') match.copyright = Boolean(`${isCopyright}`);
    if (`${status}` === 'true' || `${status}` === 'false') {
      match.status = Boolean(`${status}`);
    } else {
      match.status = true;
    }
    if (`${isImages}` === 'true') match.images = { $exists: true, $not: { $size: 0 } };
    else if (`${isImages}` === 'false') match.images = { $exists: true, $size: 0 };

    if (`${isDepartments}` === 'true') match.departments = { $exists: true, $not: { $size: 0 } };
    else if (`${isDepartments}` === 'false') match.departments = { $exists: true, $size: 0 };

    if (`${audited}` === 'true' || `${audited}` === 'false') match.audited = `${audited}` === 'true';

    if (company) match.companyAdded = new mongoose.Types.ObjectId(company);

    const aggregate: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'department',
          let: { departments: '$departments' },
          as: 'departments',
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$departments'] } } },
            { $project: { _id: 0, name: 1 } },
          ],
        },
      },
      { $project: { createdAt: 0, updatedAt: 0, __v: 0 } },
      { $skip: pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0 },
      { $limit: nPerPage },
    ];

    const response = await EcbrProductDepartmentModel.aggregate(aggregate);

    let total = 0;
    let totalPage = 0;
    const totalAgg = await EcbrProductDepartmentModel.aggregate([
      { $match: match },
      { $count: 'total' },
    ]);
    if (totalAgg && totalAgg.length > 0 && totalAgg[0].total) {
      total = totalAgg[0].total;
      totalPage = Math.ceil(total / nPerPage);
    }

    return {
      response,
      pagination: { page: pageNumber, limit: nPerPage },
      total: { documents: total, pages: totalPage },
    };
  }

  async generateCode() {
    const barcode = 'ECBR';
    const last: any = await EcbrProductDepartmentModel.findOne({
      barcode: { $regex: '.*' + barcode + '.*', $options: 'i' },
    })
      .select({ barcode: 1, createdAt: 1 })
      .sort({ barcode: -1 });

    let sequence = 'ECBR00000001';
    if (last && last.barcode) {
      let code = last.barcode.trim().replace('ECBR', '');
      code = String(Number(code) + 1);
      sequence = `ECBR${leftPad(code, 8)}`;
    }
    return { sequence };
  }

  async listByBarcode(barcode: string) {
    const productBank = await EcbrProductDepartmentModel.find({ barcode });
    if (productBank.length === 0) {
      throw new AppError('Codigo de barras não encontrado', 404);
    }
    return productBank[0];
  }

  async create(data: any) {
    if (!data.file || typeof data.file !== 'object') {
      throw new AppError('Imagens inválidas', 400);
    }
    if (!data.name) throw new AppError('Informe um nome', 400);
    if (!data.barcode || typeof data.barcode !== 'string' || data.barcode.length <= 0) {
      throw new AppError('Informe um código de barra', 400);
    }
    if (!data.description) throw new AppError('Informe uma descrição', 400);
    if (!data.keywords || typeof data.keywords !== 'object' || data.keywords.length <= 0) {
      throw new AppError('Informe pelo menos uma palavra chave', 400);
    }
    if (!data.departments || typeof data.departments !== 'object' || data.departments.length <= 0) {
      throw new AppError('Informe pelo menos uma departamento', 400);
    }

    const body: any = { ...data };
    body.images = extractImages(data);
    body.departments = data.departments.map((item: any) =>
      new mongoose.Types.ObjectId(item._id || item)
    );

    if (`${data.status}` === 'true') body.status = true;
    else if (`${data.status}` === 'false') body.status = false;

    const duplicate = await EcbrProductDepartmentModel.findOne({ barcode: String(data.barcode) }).lean();
    if (duplicate && duplicate._id) {
      throw new AppError('Código de barras já cadastrado', 400);
    }

    const response = await EcbrProductDepartmentModel.create(body);

    if (data.audited && data.audited === true) {
      await propagateToProducts(String(data.barcode), {
        name: body.name,
        keywords: body.keywords,
        images: body.images,
        department: body.departments,
        existImageBank: true,
      });
    }

    return response;
  }

  async update(id: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }
    if (!data.departments || typeof data.departments !== 'object' || data.departments.length <= 0) {
      throw new AppError('Informe pelo menos uma departamento', 400);
    }

    const body: any = { ...data };

    if (
      (typeof body.status === 'string' && body.status === '') ||
      body.status === null
    ) {
      body.status = false;
    }

    body.departments = data.departments.map((item: any) =>
      new mongoose.Types.ObjectId(item._id || item)
    );

    if (!data.file || typeof data.file !== 'object') {
      delete body.file;
      delete body.images;
    } else {
      body.images = extractImages(data);
    }

    const updated = await EcbrProductDepartmentModel.findOneAndUpdate(
      { _id: id },
      body,
      { upsert: true, new: true }
    );
    if (!updated) throw new AppError('Registro não encontrado', 404);

    let productPayload: any;
    if (body.images) {
      productPayload = { name: body.name, images: body.images, department: body.departments };
    } else {
      productPayload = { name: body.name, department: body.departments };
    }

    let nModified = 0;
    if (data.audited && data.audited === true && data.barcode) {
      nModified = await propagateToProducts(String(data.barcode), productPayload);
    }

    return {
      data: updated,
      nModified,
      message: nModified
        ? `Produto atualizada com sucesso e mais ${nModified} nos produtos do supermercado online`
        : 'Produto atualizada com sucesso!',
    };
  }

  async sync() {
    const productsBank = await EcbrProductDepartmentModel.find();
    let updated = 0;

    for (const productBank of productsBank) {
      try {
        const db = mongoose.connection.db;
        if (!db) return { status: 200, message: 'Produtos vinculados com sucesso!', updated };
        const products = db.collection('products');
        if (!products) continue;
        const result = await (products as any).updateMany(
          { barcode: productBank.barcode },
          {
            $set: {
              name: productBank.name,
              images: productBank.images,
              department: productBank.departments,
              productDepartmentId: productBank._id,
            },
          }
        );
        updated += result.modifiedCount || 0;
      } catch {
        return { status: 200, message: 'Produtos vinculados com sucesso!', updated: 0 };
      }
    }

    return { status: 200, message: 'Produtos vinculados com sucesso!', updated };
  }
}

export default new EcbrImageBankService();
