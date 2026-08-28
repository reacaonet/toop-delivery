import bcrypt from "bcrypt";
import { UserModel } from "../models/User";
import { DeliverymanModel } from "../models/Deliveryman";
import { CompanyModel } from "../models/Company";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export class AuthService {
  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email }).select("+password").populate("company").populate("deliveryman");

    if (!user) {
      throw new AppError("Email ou senha invalidos", 401);
    }

    if (!user.active) {
      throw new AppError("Conta desativada", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Email ou senha invalidos", 401);
    }

    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return { user: userWithoutPassword, token, refreshToken };
  }

  async register(data: { name: string; email: string; phone?: string; password: string }) {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email já está em uso", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: "customer",
      active: true,
    });

    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return { user: userWithoutPassword, token, refreshToken };
  }

  async registerDeliveryman(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicleType?: string;
    cpf?: string;
    cnh?: string;
    vehiclePlate?: string;
  }) {
    const existingDeliveryman = await DeliverymanModel.findOne({ email: data.email });
    if (existingDeliveryman) {
      throw new AppError("Email já está em uso", 409);
    }

    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email já está em uso", 409);
    }

    const deliveryman = await DeliverymanModel.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      vehicleType: data.vehicleType || "motorcycle",
      cpf: data.cpf,
      cnh: data.cnh,
      vehiclePlate: data.vehiclePlate,
      active: false,
    });

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: "deliveryman",
      active: true,
      deliveryman: deliveryman._id,
    });

    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return { user: userWithoutPassword, token, refreshToken };
  }

  async registerStore(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    cnpj?: string;
    category?: string;
  }) {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email já está em uso", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const company = await CompanyModel.create({
      name: data.name,
      cnpj: data.cnpj,
      phone: data.phone,
      email: data.email,
      category: data.category,
      active: true,
    });

    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: "store",
      active: true,
      company: company._id,
    });

    company.owner = user._id as any;
    await company.save();

    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    userWithoutPassword.company = company._id;

    return { user: userWithoutPassword, token, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Token de refresh invalido ou expirado", 401);
    }

    const user = await UserModel.findById(payload._id);

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    if (!user.active) {
      throw new AppError("Conta desativada", 403);
    }

    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { token };
  }

  async getMe(userId: string) {
    const user = await UserModel.findById(userId)
      .populate("company")
      .populate("deliveryman");

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    const userObj = user.toObject();
    const { password: _, __v: _v, ...userWithoutPassword } = userObj;

    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user: userWithoutPassword, token, refreshToken };
  }
}

export default new AuthService();
