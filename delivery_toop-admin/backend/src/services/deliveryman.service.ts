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
      address?: string;
      addressLat?: number;
      addressLng?: number;
      isDriver?: boolean;
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

  async toggleAvailability(id: string) {
    const deliveryman = await DeliverymanModel.findById(id);
    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }
    deliveryman.available = !deliveryman.available;
    await deliveryman.save();
    return { available: deliveryman.available };
  }

  async toggleDriverMode(id: string) {
    const deliveryman = await DeliverymanModel.findById(id);
    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }
    deliveryman.isDriver = !deliveryman.isDriver;
    if (!deliveryman.isDriver) {
      deliveryman.driverOnline = false;
      deliveryman.driverAvailable = false;
    }
    await deliveryman.save();
    return { isDriver: deliveryman.isDriver, driverOnline: deliveryman.driverOnline, driverAvailable: deliveryman.driverAvailable };
  }

  async toggleDriverOnline(id: string, lat?: number, lng?: number) {
    const deliveryman = await DeliverymanModel.findById(id);
    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }
    if (!deliveryman.isDriver) {
      throw new AppError("Entregador não está habilitado como motorista", 400);
    }
    deliveryman.driverOnline = !deliveryman.driverOnline;
    if (!deliveryman.driverOnline) {
      deliveryman.driverAvailable = false;
    }
    if (deliveryman.driverOnline) {
      if (lat != null && lng != null) {
        deliveryman.currentLocation = { type: 'Point', coordinates: [lng, lat] } as any;
      } else if (deliveryman.addressLat != null && deliveryman.addressLng != null) {
        deliveryman.currentLocation = { type: 'Point', coordinates: [deliveryman.addressLng, deliveryman.addressLat] } as any;
      }
    }
    await deliveryman.save();
    return { driverOnline: deliveryman.driverOnline, driverAvailable: deliveryman.driverAvailable };
  }

  async toggleDriverAvailable(id: string) {
    const deliveryman = await DeliverymanModel.findById(id);
    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }
    if (!deliveryman.isDriver) {
      throw new AppError("Entregador não está habilitado como motorista", 400);
    }
    deliveryman.driverAvailable = !deliveryman.driverAvailable;
    if (deliveryman.driverAvailable && !deliveryman.driverOnline) {
      deliveryman.driverOnline = true;
    }
    await deliveryman.save();
    return { driverOnline: deliveryman.driverOnline, driverAvailable: deliveryman.driverAvailable };
  }

  async updateLocation(id: string, lat: number, lng: number) {
    const deliveryman = await DeliverymanModel.findByIdAndUpdate(
      id,
      { currentLocation: { type: 'Point', coordinates: [lng, lat] } },
      { new: true }
    );
    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }
    return deliveryman;
  }

  async updateAddress(id: string, address: string, lat?: number, lng?: number) {
    const deliveryman = await DeliverymanModel.findByIdAndUpdate(
      id,
      { address, addressLat: lat, addressLng: lng },
      { new: true }
    );
    if (!deliveryman) {
      throw new AppError("Entregador não encontrado", 404);
    }
    return deliveryman;
  }

  async findNearbyDrivers(lat: number, lng: number, maxDistance: number = 10000) {
    const deliverymen = await DeliverymanModel.find({
      isDriver: true,
      driverOnline: true,
      driverAvailable: true,
      active: true,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    }).limit(10);
    return deliverymen;
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
