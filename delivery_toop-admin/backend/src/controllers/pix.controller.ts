import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import paymentGatewayService from '../services/payment-gateway.service';
import { PixGenerateModel } from '../models/PixGenerate';
import { AppError } from '../middleware/errorHandler';

export class PixController {
  async generateCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body || {};
      const cart = body.cart;
      if (!cart || !Types.ObjectId.isValid(cart)) {
        throw new AppError('Informe o carrinho (cart) para gerar o PIX', 400);
      }

      const result = await paymentGatewayService.pixCharge(body);

      const payload: any = (result as any)?.data && typeof (result as any).data === 'object'
        ? (result as any).data
        : result;
      const txid = String(payload?.txid || payload?.id || payload?.transaction_id || '');
      const qrcode = String(payload?.qrcode || payload?.qr_code || payload?.emv || '');

      if (!txid && !qrcode) {
        throw new AppError('O gateway não retornou txid/qrcode para o PIX', 400);
      }

      const pix = await PixGenerateModel.create({
        cart,
        txid,
        qrcode,
        amount: Number(body.amount || body.price || 0),
        response: payload,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      await paymentGatewayService.record({
        gateway: 'PIX',
        operation: 'pix_charge',
        method: 'pix',
        amount: pix.amount,
        status: 'processing',
        gatewayId: txid || undefined,
        gatewayResponse: payload,
        shoppingCart: cart,
        order: body.order,
        customer: body.customer,
        company: body.company,
      });

      return res.status(200).json({ success: true, data: pix });
    } catch (err) {
      next(err);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const txid = req.params.txid;
      if (!txid) throw new AppError('Informe o txid para consultar o PIX', 400);

      const pix = await PixGenerateModel.findOne({ txid }).sort({ createdAt: -1 });
      if (!pix) throw new AppError('PIX não encontrado', 404);

      const data = pix.toJSON() as any;
      return res.status(200).json({
        success: true,
        data,
        tip:
          pix.status === 'pending'
            ? 'Confirmação pendente: aguarde o webhook do gateway de pagamentos'
            : undefined,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new PixController();