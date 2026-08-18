import { UserModel } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import bcrypt from "bcrypt";

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

export class UserService {
  async create(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email já está em uso", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await UserModel.create({
      ...data,
      password: hashedPassword,
    });

    return user;
  }

  async getById(id: string) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
    return user;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(),
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
      email?: string;
      password?: string;
      phone?: string;
      role?: string;
      active?: boolean;
    }
  ) {
    if (data.email) {
      const existingUser = await UserModel.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new AppError("Email já está em uso", 409);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return user;
  }

  async delete(id: string) {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return user;
  }
}

export default new UserService();
