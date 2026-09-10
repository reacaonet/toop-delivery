import axios, { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { env } from '../config';
import { AppError } from '../middleware/errorHandler';
import { PaymentTransactionModel } from '../models/PaymentTransaction';
import { getGatewayConfig } from './settings.service';

interface GatewayToken {
  value: string;
  expiresAt: number;
}

let cachedToken: GatewayToken | null = null;

interface RecordInput {
  gateway?: string;
  operation: string;
  method: string;
  amount: number;
  fees?: number;
  status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  gatewayId?: string;
  gatewayResponse?: Record<string, unknown>;
  order?: string;
  booking?: string;
  shoppingCart?: string;
  customer?: string;
  company?: string;
  metadata?: Record<string, unknown>;
}

export class PaymentGatewayService {
  private baseUrl(): string {
    return env.PAYMENT_URL.replace(/\/$/, '');
  }

  private envSandbox(): boolean {
    return env.PAYMENT_DEV_MODE === 'true';
  }

  async isSandbox(): Promise<boolean> {
    try {
      const config = await getGatewayConfig();
      if (config.mode) return config.mode === 'sandbox';
    } catch {
      // fall through to env default
    }
    return this.envSandbox();
  }

  async provider(): Promise<string> {
    try {
      const config = await getGatewayConfig();
      return config.provider || 'PAGARME';
    } catch {
      return 'PAGARME';
    }
  }

  async webhookUrl(): Promise<string | undefined> {
    try {
      const config = await getGatewayConfig();
      return config.webhookUrl || undefined;
    } catch {
      return undefined;
    }
  }

  private randomId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private async getToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.value;
    }

    if (!env.PAYMENT_APP_TOKEN || !env.PAYMENT_APP_SECRET) {
      throw new AppError(
        'Gateway de pagamentos não configurado: informe PAYMENT_APP_TOKEN e PAYMENT_APP_SECRET (credenciais do microserviço de pagamento)',
        400
      );
    }

    try {
      const { data } = await axios.post(`${this.baseUrl()}/${env.LTS}/token`, {
        appToken: env.PAYMENT_APP_TOKEN,
        appSecret: env.PAYMENT_APP_SECRET,
      });

      if (!data?.token) {
        throw new Error('Resposta inesperada do endpoint de token');
      }

      cachedToken = { value: data.token as string, expiresAt: Date.now() + 55 * 60 * 1000 };
      return cachedToken.value;
    } catch (err) {
      cachedToken = null;
      throw new AppError(
        `Microserviço de pagamento indisponível em ${this.baseUrl()}: não foi possível autenticar (revise PAYMENT_APP_TOKEN/PAYMENT_APP_SECRET)`,
        400
      );
    }
  }

  private async request<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
    const token = await this.getToken();
    try {
      const { data } = await axios.request<T>({
        baseURL: this.baseUrl(),
        url: `/${env.LTS}${path}`,
        method: config.method || 'GET',
        data: config.data,
        params: config.params,
        headers: { Authorization: `Bearer ${token}`, ...(config.headers || {}) },
      });
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      if (status >= 500 || !status) {
        throw new AppError(
          `Microserviço de pagamento indisponível em ${this.baseUrl()} (rota ${path})`,
          400
        );
      }
      throw new AppError(message || 'Erro no gateway de pagamentos', 400);
    }
  }

  async record(input: RecordInput) {
    const gateway = input.gateway || (await this.provider());
    return PaymentTransactionModel.create({
      gateway,
      operation: input.operation,
      method: input.method,
      amount: input.amount,
      fees: input.fees ?? 0,
      status: input.status || 'pending',
      gatewayId: input.gatewayId,
      gatewayResponse: input.gatewayResponse,
      order: input.order,
      booking: input.booking,
      shoppingCart: input.shoppingCart,
      customer: input.customer,
      company: input.company,
      metadata: input.metadata,
    });
  }

  // ---------- cards ----------
  async tokenizeCard(data: Record<string, unknown>): Promise<any> {
    if (await this.isSandbox()) {
      return { success: true, data: { token: this.randomId('devtok') } };
    }
    return this.request('/payment/card', { method: 'POST', data });
  }

  async listCard(tokenCard: string): Promise<any> {
    return this.request(`/payment/card/${encodeURIComponent(tokenCard)}`);
  }

  async cardByBin(bin: string): Promise<any> {
    return this.request(`/payment/binCard/${encodeURIComponent(bin)}`);
  }

  // ---------- charges / capture ----------
  async charge(data: Record<string, unknown>): Promise<any> {
    return this.request('/sales', { method: 'POST', data });
  }

  async pagarmeTransaction(data: Record<string, unknown>): Promise<any> {
    if (await this.isSandbox()) {
      return {
        success: true,
        data: { id: this.randomId('devtrx'), status: 'paid', amount: data.amount },
      };
    }
    return this.request('/pagar-me/transactions', { method: 'POST', data });
  }

  async cancelTransaction(paymentId: string): Promise<any> {
    if (await this.isSandbox()) {
      return { success: true, data: { id: paymentId, status: 'canceled' } };
    }
    return this.request(`/cancellation/${encodeURIComponent(paymentId)}`, { method: 'POST' });
  }

  async cancelTransactionPartial(paymentId: string, data: Record<string, unknown>): Promise<any> {
    if (await this.isSandbox()) {
      return { success: true, data: { id: paymentId, status: 'partial_canceled', ...data } };
    }
    return this.request(`/cancellation-partial/${encodeURIComponent(paymentId)}`, {
      method: 'PUT',
      data,
    });
  }

  // ---------- PIX ----------
  async pixCharge(data: Record<string, unknown>): Promise<any> {
    if (await this.isSandbox()) {
      const id = this.randomId('devpix');
      return {
        success: true,
        data: { id, txid: id, pix_qr_code: `0002010102122615br.gov.bcb.pix${id}520400005303986540${String(data.amount)}5802BR5913GoJa6009SAO PAULO` },
      };
    }
    return this.request('/pagar-me/pix', { method: 'POST', data });
  }

  // ---------- invoice ----------
  async listInvoices(params?: Record<string, unknown>): Promise<any> {
    return this.request('/invoice', { params });
  }

  async getInvoice(id: string): Promise<any> {
    return this.request(`/invoice/${encodeURIComponent(id)}`);
  }

  async createInvoice(data: Record<string, unknown>): Promise<any> {
    return this.request('/invoice', { method: 'POST', data });
  }

  async receivable(): Promise<any> {
    return this.request('/invoice/receivable');
  }

  // ---------- recipients / split ----------
  async createRecipient(data: Record<string, unknown>): Promise<any> {
    return this.request('/pagar-me/recipient', { method: 'POST', data });
  }

  async updateRecipient(recipientId: string, data: Record<string, unknown>): Promise<any> {
    return this.request(`/pagar-me/recipient/${encodeURIComponent(recipientId)}`, { method: 'PUT', data });
  }

  async splitAfter(paymentId: string): Promise<any> {
    return this.request(`/split/after/${encodeURIComponent(paymentId)}`, { method: 'POST' });
  }

  // ---------- admin/transaction info ----------
  async transactionInfo(paymentId: string): Promise<any> {
    return this.request(`/payment/information/${encodeURIComponent(paymentId)}`);
  }

  async transactionsList(params?: Record<string, unknown>): Promise<any> {
    return this.request('/transaction', { params });
  }
}

export default new PaymentGatewayService();