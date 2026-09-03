import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { QrCodeDriverModel } from '../models/QrCodeDriver';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function generateAlphaNumeric(uppercase = true, segments = 3, separatorCount = 1): string {
  const chars = uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' : 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segmentLength = 3;
  const segmentsArr: string[] = [];
  for (let s = 0; s < segments; s++) {
    let seg = '';
    for (let i = 0; i < segmentLength; i++) {
      seg += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segmentsArr.push(seg);
  }
  void separatorCount;
  return segmentsArr.join('');
}

export class QrCodeDriverService {
  async generateDriver(query: any) {
    const { driver } = query;

    if (!driver || !isObjectId(driver)) {
      throw new AppError('Informe um motorista válido', 400);
    }

    const code = generateAlphaNumeric(true, 3, 1);

    const qrcodeDataUrl = await QRCode.toDataURL(code);

    if (!code || !qrcodeDataUrl) {
      throw new AppError('Não conseguimos gerar o QR Code', 400);
    }

    const newQrcode = await QrCodeDriverModel.create({ driver, code });

    if (!newQrcode || !newQrcode._id) {
      throw new AppError('Não conseguimos gerar o QR Code', 400);
    }

    return { code, qrcode: qrcodeDataUrl };
  }

  async listDriverCode(query: any) {
    const { code } = query;

    if (!code || String(code).length < 6) {
      throw new AppError('Informe um código com pelo menos 6 caracteres', 400);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const resp = await QrCodeDriverModel.findOne({
      code,
      createdAt: { $gte: oneHourAgo },
    })
      .populate({
        path: 'driver',
        select: { _id: 1, name: 1, activeRunStatus: 1 },
      })
      .lean();

    if (!resp || !resp._id) {
      throw new AppError('Código informado não existe ou expirado', 400);
    }

    if (!resp.driver || !(resp.driver as any)._id) {
      throw new AppError('Motorista não localizado', 400);
    }

    return resp;
  }
}

export default new QrCodeDriverService();
