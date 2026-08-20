import { DeliverymanModel } from "../models/Deliveryman";
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

export class DeliverymanService {
  async create(data: {
    name: string;
    email: string;
    phone: string;
    vehicleType?: string;
    password?: string;
  }) {
    const existingDeliveryman = await DeliverymanModel.findOne({
      email: data.email,
    });
    if (existingDeliveryman) {
      throw new AppError("Email já está em uso", 409);
    }

    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email já está em uso", 409);
    }

    const deliveryman = await DeliverymanModel.create(data);

    const plainPassword = data.password || "entregador123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await UserModel.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "deliveryman",
      active: true,
      deliveryman: deliveryman._id,
    });

    return deliveryman;
  }

  async getById(id: string) {
    const deliveryman = await DeliverymanModel.findById(id);
    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }
    return deliveryman;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DeliverymanModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      DeliverymanModel.countDocuments(),
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
      phone?: string;
      vehicleType?: string;
      active?: boolean;
      cpf?: string;
      cnh?: string;
      vehiclePlate?: string;
      avatar?: string;
      documents?: {
        cnh?: string;
        vehicleDocument?: string;
        photo?: string;
      };
      documentStatus?: {
        cnh?: 'pending' | 'approved' | 'rejected';
        vehicleDocument?: 'pending' | 'approved' | 'rejected';
        photo?: 'pending' | 'approved' | 'rejected';
      };
    }
  ) {
    if (data.email) {
      const existingDeliveryman = await DeliverymanModel.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existingDeliveryman) {
        throw new AppError("Email já está em uso", 409);
      }
    }

    const updateData: any = { ...data };

    if (data.documentStatus) {
      const current = await DeliverymanModel.findById(id);
      const merged = {
        cnh: data.documentStatus.cnh || current?.documentStatus?.cnh || 'pending',
        vehicleDocument: data.documentStatus.vehicleDocument || current?.documentStatus?.vehicleDocument || 'pending',
        photo: data.documentStatus.photo || current?.documentStatus?.photo || 'pending',
      };
      updateData.documentStatus = merged;

      const allApproved = merged.cnh === 'approved' && merged.vehicleDocument === 'approved' && merged.photo === 'approved';
      const anyRejected = merged.cnh === 'rejected' || merged.vehicleDocument === 'rejected' || merged.photo === 'rejected';

      if (allApproved) {
        updateData.active = true;
      } else if (anyRejected) {
        updateData.active = false;
      }
    }

    const deliveryman = await DeliverymanModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }

    return deliveryman;
  }

  async delete(id: string) {
    const deliveryman = await DeliverymanModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }

    return deliveryman;
  }
}

export default new DeliverymanService();
