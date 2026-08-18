import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  appToken: string;
  appSecret: string;
  iat: number;
  exp: number;
}

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({message: 'Token não fornecido'});
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    if (!privateKey) {
      res.status(500).json({message: 'JWT_PRIVATE_KEY não configurada'});
      return;
    }
    const decoded = jwt.verify(token, privateKey, {algorithms: ['HS256']}) as JwtPayload;
    (req as any).app = decoded;
    next();
  } catch (err) {
    res.status(401).json({message: 'Token inválido ou expirado'});
  }
}
