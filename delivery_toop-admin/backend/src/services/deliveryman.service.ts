import { DeliverymanModel } from "../models/Deliveryman";
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

export class DeliverymanService {
  async create(data: {
    name: string;
    email: string;
    phone: string;
    vehicleType?: string;
  }) {
    const existingDeliveryman = await DeliverymanModel.findOne({
      email: data.email,
    });
    if (existingDeliveryman) {
      throw new AppError("Email já está em uso", 409);
    }

    const deliveryman = await DeliverymanModel.create(data);
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

    const deliveryman = await DeliverymanModel.findByIdAndUpdate(id, data, {
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
