import { Request, Response, NextFunction } from 'express';
import paymentGatewayService from '../services/payment-gateway.service';
import repasseService from '../services/repasse.service';
import { AppError } from '../middleware/errorHandler';

export class PaymentGatewayController {
  // ---------- repasse (server-side, Fase 2.2) ----------
  async repasseSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await repasseService.summaryByCompany(req.params.company, req.query as any);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async repasseSplits(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await repasseService.listSplits(req.query as any);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // ---------- cards ----------
  async tokenizeCard(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body || {};
      if (!body.nameOnCard || !body.cardNumber || !body.valid || !body.document) {
        throw new AppError('Informe os dados do cartão (nameOnCard, cardNumber, valid, document)', 400);
      }
      const result = await paymentGatewayService.tokenizeCard(body);
      await paymentGatewayService.record({
        gateway: 'PAGARME',
        operation: 'card_tokenize',
        method: 'card',
        amount: 0,
        status: 'succeeded',
        gatewayId: result?.id || result?.card?.id,
        gatewayResponse: result,
        customer: req.body.customer,
        metadata: { bin: String(body.cardNumber).slice(0, 6), last4: String(body.cardNumber).slice(-4) },
      });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async cardByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.listCard(req.params.tokenCard);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---------- sales / charge ----------
  async charge(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body || {};
      const result = await paymentGatewayService.pagarmeTransaction(body);
      await paymentGatewayService.record({
        gateway: 'PAGARME',
        operation: 'charge',
        method: body.payment_method || 'card',
        amount: Number(body.amount || 0),
        status: 'processing',
        gatewayId: result?.id,
        gatewayResponse: result,
        order: body.order,
        company: body.company,
        customer: body.customer,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.cancelTransaction(req.params.paymentId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async cancelPartial(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.cancelTransactionPartial(req.params.paymentId, req.body || {});
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---------- PIX ----------
  async pixCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body || {};
      const result = await paymentGatewayService.pixCharge(body);
      await paymentGatewayService.record({
        gateway: 'PIX',
        operation: 'pix_charge',
        method: 'pix',
        amount: Number(body.amount || 0),
        status: 'processing',
        gatewayId: result?.id || result?.transaction?.id,
        gatewayResponse: result,
        order: body.order,
        shoppingCart: body.shoppingCart,
        company: body.company,
        customer: body.customer,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---------- invoice ----------
  async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.listInvoices(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.getInvoice(req.params.id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.createInvoice(req.body || {});
      const id = String(result?.id || result?._id || '');
      if (id) {
        await paymentGatewayService.record({
          gateway: 'PAGARME',
          operation: 'invoice',
          method: 'invoice',
          amount: Number(req.body?.price || req.body?.amount || 0),
          status: 'succeeded',
          gatewayId: id,
          gatewayResponse: result,
          company: req.body?.company,
        });
      }
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async invoiceReceivable(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.receivable();
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---------- recipients / split ----------
  async createRecipient(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.createRecipient(req.body || {});
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateRecipient(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.updateRecipient(req.params.recipientId, req.body || {});
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async splitAfter(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.splitAfter(req.params.paymentId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ---------- info ----------
  async transactionInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.transactionInfo(req.params.paymentId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async transactionsList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentGatewayService.transactionsList(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new PaymentGatewayController();