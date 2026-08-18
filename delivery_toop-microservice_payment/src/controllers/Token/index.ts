import jwt from 'jsonwebtoken';
import {Request, Response} from 'express';

import {TypeResponse} from './types';

export default {
  index(req: Request, res: Response): Response<TypeResponse> {
    const {appToken, appSecret} = req.body;

    if (!appToken || !appSecret) {
      return res.status(400).json({
        message: 'Nenhuma credencial foi informada',
      });
    }

    if (
      appToken !== process.env.appToken ||
      appSecret !== process.env.appSecret
    ) {
      return res.status(400).json({
        message: 'Credenciais inválidas',
      });
    }

    const privateKey = process.env.JWT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(500).json({
        message: 'Chave de assinatura não configurada',
      });
    }

    const token = jwt.sign(
      {
        appToken,
        appSecret,
      },
      privateKey,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
      },
    );

    return res.status(200).json({
      token,
    });
  },
};
