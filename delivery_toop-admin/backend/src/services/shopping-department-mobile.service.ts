import { Types } from 'mongoose';
import { ShoppingDepartmentMobileModel } from '../models/ShoppingDepartmentMobile';
import { CompanyModel } from '../models/Company';
import { EcbrProductDepartmentModel } from '../models/EcbrProductDepartment';
import { AppError } from '../middleware/errorHandler';

const getBarcode = (barcode: string): string => {
  let totalZero = 0;
  let disableSum = false;

  for (const char of barcode) {
    if (char === '0' && !disableSum) {
      totalZero += 1;
    } else if (char !== '0') {
      disableSum = true;
    }
  }

  return totalZero >= 2 && totalZero <= 5
    ? barcode.substring(totalZero).trim()
    : barcode.trim();
};

const normalizeBoolean = (value: unknown): boolean =>
  (typeof value === 'string' && value === '') || value === null ? false : Boolean(value);

export class DepartmentMobileService {
  async list(query: Record<string, any> = {}) {
    const { barcode, franchise, company } = query;
    const filter: Record<string, any> = { deletedAt: { $exists: false } };
    const or: Record<string, unknown>[] = [];

    if (franchise) {
      or.push({ franchise });
      or.push({ franchise: { $exists: false } });
    } else if (company) {
      const respCompany = await CompanyModel.findOne({ _id: company })
        .select({ franchise: 1 })
        .lean();
      const companyFranchise = (respCompany as any)?.franchise;
      if (companyFranchise) {
        or.push({ franchise: companyFranchise });
      }
      or.push({ company });
      or.push({ franchise: { $exists: false } });
    }

    if (or.length > 0) filter.$or = or;

    if (barcode && barcode !== null && barcode !== undefined) {
      const strBarcode = getBarcode(String(barcode));
      const list = await EcbrProductDepartmentModel.findOne({ barcode: strBarcode }).lean();

      const resultBarCode =
        list && list.departments && list.departments.length > 0
          ? list.departments.map((item) => ({ _id: item }))
          : [];

      if (resultBarCode.length > 0) {
        return resultBarCode;
      }
    }

    return ShoppingDepartmentMobileModel.find(filter);
  }

  async paginator(query: Record<string, any> = {}) {
    const { pageIn, pageOut, company, franchise } = query;
    const filter: Record<string, any> = { deletedAt: { $exists: false } };

    if (franchise) {
      filter.franchise = franchise;
    }

    if (company) {
      const or: Record<string, unknown>[] = [];
      const respCompany = await CompanyModel.findOne({ _id: company })
        .select({ franchise: 1 })
        .lean();
      const companyFranchise = (respCompany as any)?.franchise;
      if (companyFranchise) {
        or.push({ franchise: companyFranchise });
      }
      or.push({ company });
      or.push({ franchise: { $exists: false } });
      filter.$or = or;
    }

    if (!pageIn || !pageOut) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const list = await ShoppingDepartmentMobileModel.find(filter)
      .sort({ name: 1 })
      .limit(parseInt(String(pageOut), 10))
      .skip(parseInt(String(pageIn), 10) * parseInt(String(pageOut), 10));

    const total = await ShoppingDepartmentMobileModel.countDocuments(filter);
    return { list, total };
  }

  async create(data: any) {
    const { name } = data;

    if (!name || name.length <= 3) {
      throw new AppError('Informe um nome com pelo menos 4 caracteres!!', 400);
    }

    const payload: Record<string, any> = {
      name,
      status: normalizeBoolean(data.status),
      showInApp: normalizeBoolean(data.showInApp),
    };

    if (data.company) {
      if (!Types.ObjectId.isValid(String(data.company))) {
        throw new AppError('Id da empresa inválido', 400);
      }
      const respCompany = await CompanyModel.findOne({ _id: data.company })
        .select({ franchise: 1 })
        .lean();
      const companyFranchise = (respCompany as any)?.franchise;
      if (companyFranchise) {
        payload.franchise = companyFranchise;
      }
      payload.company = data.company;
    }

    if (data.franchise) {
      payload.franchise = data.franchise;
    }

    return ShoppingDepartmentMobileModel.create(payload);
  }

  async update(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }

    if (data.status !== undefined) data.status = normalizeBoolean(data.status);
    if (data.showInApp !== undefined) data.showInApp = normalizeBoolean(data.showInApp);

    const updated = await ShoppingDepartmentMobileModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );

    if (!updated) throw new AppError('Departamento não encontrado', 404);
    return updated;
  }

  async softDelete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }

    const removed = await ShoppingDepartmentMobileModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!removed) throw new AppError('Departamento não encontrado', 404);
    return removed;
  }
}

export default new DepartmentMobileService();