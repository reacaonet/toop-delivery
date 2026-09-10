import bcrypt from "bcrypt";
import { CompanyModel } from "../models/Company";
import { UserModel } from "../models/User";
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
    address?: any;
    active?: boolean;
    status?: boolean;
  }) {
    const active = data.active !== undefined ? data.active : data.status;
    const company = await CompanyModel.create({ ...data, active: active !== undefined ? active : true });
    return company;
  }

  async getById(id: string) {
    const company = await CompanyModel.findById(id).populate("owner", "name email");
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
      CompanyModel.find({ deletedAt: { $exists: false } }).populate("owner", "name email").skip(skip).limit(limit).sort({ createdAt: -1 }),
      CompanyModel.countDocuments({ deletedAt: { $exists: false } }),
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
      status?: boolean;
      preparationTime?: number;
      estimatedDeliveryTime?: number;
      deliveryFee?: number;
      minimumOrder?: number;
      openingHours?: Record<string, { open: string; close: string }>;
      description?: string;
      logo?: string;
      address?: any;
    }
  ) {
    if (data.status !== undefined) data.active = data.status;
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
      { active: false, deletedAt: new Date() },
      { new: true }
    );

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    return company;
  }

  async getAdmins(companyId: string) {
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }
    return UserModel.find({ company: companyId, role: "store" })
      .select("-password")
      .sort({ createdAt: 1 });
  }

  async addAdmin(companyId: string, data: { name: string; email: string; password: string }) {
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new AppError("Email já está em uso", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "store",
      active: true,
      company: company._id,
    });

    if (!company.owner) {
      company.owner = user._id as any;
      await company.save();
    }

    const userObj = user.toObject();
    const { password: _, ...safe } = userObj;
    return safe;
  }

  async removeAdmin(companyId: string, userId: string) {
    const user = await UserModel.findOne({ _id: userId, company: companyId, role: "store" });
    if (!user) {
      throw new AppError("Usuário admin não encontrado para esta empresa", 404);
    }

    user.active = false;
    user.company = undefined as any;
    await user.save();

    const company = await CompanyModel.findById(companyId);
    if (company && company.owner && company.owner.toString() === userId) {
      const another = await UserModel.findOne({ company: companyId, role: "store", active: true });
      company.owner = (another ? another._id : undefined) as any;
      await company.save();
    }

    const userObj = user.toObject();
    const { password: _, ...safe } = userObj;
    return safe;
  }
}

export default new CompanyService();