import bcrypt from "bcrypt";
import { UserModel } from "../models/User";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export class AuthService {
  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email }).select("+password");

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
}

export default new AuthService();
