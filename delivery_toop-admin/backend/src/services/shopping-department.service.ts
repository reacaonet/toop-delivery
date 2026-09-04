import { Types } from 'mongoose';
import { ShoppingDepartmentModel } from '../models/ShoppingDepartment';
import { CompanyModel } from '../models/Company';
import { EcbrProductDepartmentModel } from '../models/EcbrProductDepartment';
import { AppError } from '../middleware/errorHandler';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

export interface DepartmentScopeQuery {
  franchise?: unknown;
  company?: unknown;
}

const buildScopeFilter = async (
  franchise?: unknown,
  company?: unknown
): Promise<Record<string, unknown>> => {
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

  const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
  if (or.length > 0) filter.$or = or;
  return filter;
};

export class DepartmentService {
  async list(query: Record<string, any> = {}) {
    const { suggested, barcode, all, franchise, company, term } = query;
    const filter = await buildScopeFilter(franchise, company);

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

    if (all) {
      if (term && typeof term === 'string' && term.trim().length > 0) {
        filter.name = { $regex: `.*${escapeRegex(term.toLowerCase())}.*`, $options: 'i' };
      }
      return ShoppingDepartmentModel.find(filter);
    }

    if (!suggested || suggested === '' || suggested === undefined) {
      return [];
    }

    const formatTxt = decodeURIComponent(String(suggested)).toLowerCase();
    filter.suggesteds = { $regex: `.*${escapeRegex(formatTxt)}.*`, $options: 'i' };
    return ShoppingDepartmentModel.find(filter);
  }

  async paginator(query: Record<string, any> = {}) {
    const { pageIn, pageOut, company, onlyCompany = false, franchise, term } = query;
    const filter = await buildScopeFilter(franchise, company);

    if (!pageIn || !pageOut) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    if (term && typeof term === 'string' && term.trim().length > 0) {
      filter.name = { $regex: `.*${escapeRegex(term.toLowerCase())}.*`, $options: 'i' };
    }

    if (onlyCompany && company) {
      filter.company = new Types.ObjectId(String(company));
    }

    let list: any[];
    if (company) {
      list = await ShoppingDepartmentModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'sortDepartment',
            let: { departmentId: '$_id', companyId: '$company' },
            as: 'sort',
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ['$department', '$$departmentId'] } },
                    { $expr: { $eq: ['$company', new Types.ObjectId(String(company))] } },
                  ],
                },
              },
            ],
          },
        },
        { $unwind: { path: '$sort', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: 1,
            suggesteds: 1,
            showInApp: 1,
            status: 1,
            name: 1,
            createdAt: 1,
            updatedAt: 1,
            sort: { $ifNull: ['$sort.order', 999999] },
            sort_id: '$sort._id',
          },
        },
        { $sort: { sort: 1, name: 1 } },
        { $limit: parseInt(String(pageOut), 10) },
        { $skip: parseInt(String(pageIn), 10) * parseInt(String(pageOut), 10) },
      ]);
    } else {
      list = await ShoppingDepartmentModel.aggregate([
        { $match: filter },
        { $sort: { name: 1 } },
        { $limit: parseInt(String(pageOut), 10) },
        { $skip: parseInt(String(pageIn), 10) * parseInt(String(pageOut), 10) },
      ]);
    }

    const total = await ShoppingDepartmentModel.countDocuments(filter);
    return { list, total };
  }

  async create(data: any) {
    const { name, suggesteds } = data;

    if (!name || name.length <= 3) {
      throw new AppError('Informe um nome com pelo menos 4 caracteres!!', 400);
    }

    if (!suggesteds || typeof suggesteds !== 'object' || suggesteds.length <= 0) {
      throw new AppError('Informe pelo menos uma sugestão!!', 400);
    }

    const payload: Record<string, any> = {
      name,
      suggesteds,
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

    return ShoppingDepartmentModel.create(payload);
  }

  async update(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }

    if (data.status !== undefined) data.status = normalizeBoolean(data.status);
    if (data.showInApp !== undefined) data.showInApp = normalizeBoolean(data.showInApp);

    const updated = await ShoppingDepartmentModel.findOneAndUpdate(
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

    const removed = await ShoppingDepartmentModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!removed) throw new AppError('Departamento não encontrado', 404);
    return removed;
  }
}

export default new DepartmentService();