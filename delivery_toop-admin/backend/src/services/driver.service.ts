import { DriverModel, IDriver } from "../models/Driver";
import { UserModel } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import bcrypt from "bcrypt";

interface PaginationQuery {
  page?: string;
  limit?: string;
  available?: string;
  online?: string;
  serviceCategory?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class DriverService {
  async create(data: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    serviceCategories?: string[];
    password?: string;
    company?: string;
  }) {
    const existingDriver = await DriverModel.findOne({ email: data.email });
    if (existingDriver) {
      throw new AppError("Email já está em uso", 409);
    }

    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email já está em uso", 409);
    }

    const driver = await DriverModel.create(data);

    const plainPassword = data.password || "motorista123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await UserModel.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "deliveryman",
      active: true,
      driver: driver._id,
      company: data.company,
    });

    return driver;
  }

  async getById(id: string) {
    const driver = await DriverModel.findById(id);
    if (!driver) {
      throw new AppError("Motorista não encontrado", 404);
    }
    return driver;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.available !== undefined) {
      filter.available = query.available === "true";
    }
    if (query.online !== undefined) {
      filter.online = query.online === "true";
    }
    if (query.serviceCategory) {
      filter.serviceCategories = query.serviceCategory;
    }

    const [data, total] = await Promise.all([
      DriverModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      DriverModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findNearby(lat: number, lng: number, maxDistance: number = 5000, serviceCategory?: string) {
    const filter: any = {
      active: true,
      available: true,
      online: true,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    };

    if (serviceCategory) {
      filter.serviceCategories = serviceCategory;
    }

    return DriverModel.find(filter).limit(10);
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      vehicleType?: string;
      vehiclePlate?: string;
      serviceCategories?: string[];
      active?: boolean;
      cpf?: string;
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
      const existingDriver = await DriverModel.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existingDriver) {
        throw new AppError("Email já está em uso", 409);
      }
    }

    const updateData: any = { ...data };

    if (data.documentStatus) {
      const current = await DriverModel.findById(id);
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

    const driver = await DriverModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!driver) {
      throw new AppError("Motorista não encontrado", 404);
    }

    return driver;
  }

  async updateLocation(id: string, lat: number, lng: number, heading?: number, speed?: number) {
    const driver = await DriverModel.findByIdAndUpdate(
      id,
      {
        currentLocation: { type: "Point", coordinates: [lng, lat] },
        heading,
        speed,
        lastLocationUpdate: new Date(),
      },
      { new: true }
    );

    if (!driver) {
      throw new AppError("Motorista não encontrado", 404);
    }

    return driver;
  }

  async toggleAvailability(id: string) {
    const driver = await DriverModel.findById(id);
    if (!driver) {
      throw new AppError("Motorista não encontrado", 404);
    }

    driver.available = !driver.available;
    await driver.save();

    return { available: driver.available };
  }

  async toggleOnline(id: string) {
    const driver = await DriverModel.findById(id);
    if (!driver) {
      throw new AppError("Motorista não encontrado", 404);
    }

    driver.online = !driver.online;
    if (!driver.online) {
      driver.available = false;
    }
    await driver.save();

    return { online: driver.online, available: driver.available };
  }

  async delete(id: string) {
    const driver = await DriverModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!driver) {
      throw new AppError("Motorista não encontrado", 404);
    }

    return driver;
  }
}

export default new DriverService();
