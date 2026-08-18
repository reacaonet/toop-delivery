import { CompanyModel } from "../models/Company";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class CompanyService {
  async create(data: {
    name: string;
    cnpj?: string;
    phone?: string;
    email?: string;
    category?: string;
  }) {
    const company = await CompanyModel.create(data);
    return company;
  }

  async getById(id: string) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }
    return company;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      CompanyModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      CompanyModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: {
      name?: string;
      cnpj?: string;
      phone?: string;
      email?: string;
      category?: string;
      active?: boolean;
    }
  ) {
    const company = await CompanyModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    return company;
  }

  async delete(id: string) {
    const company = await CompanyModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    return company;
  }
}

export default new CompanyService();
