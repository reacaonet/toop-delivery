import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { UserModel } from '../models/User';

export interface AuthPayload {
  _id: string;
  email: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Token not provided' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    const user = await UserModel.findById(decoded._id).select('active');
    if (!user || !user.active) {
      res.status(401).json({ success: false, error: 'Usuario inativo ou nao encontrado' });
      return;
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
}

export function generateRefreshToken(payload: AuthPayload): string {
  const secret = env.JWT_SECRET_REFRESH!;
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string): AuthPayload {
  const secret = env.JWT_SECRET_REFRESH!;
  return jwt.verify(token, secret) as AuthPayload;
}
