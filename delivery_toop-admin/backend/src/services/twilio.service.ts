import twilio from 'twilio';
import { env } from '../config';
import { AppError } from '../middleware/errorHandler';
import TwilioModel from '../models/Twilio';

class TwilioService {
  private getClient() {
    const sid = `${env.TWILIO_ACCOUNT_SID || ''}`.trim();
    const token = `${env.TWILIO_AUTH_TOKEN || ''}`.trim();
    if (!sid || !token) {
      throw new AppError('Twilio não configurado: adicione TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN', 400);
    }
    return twilio(sid, token);
  }

  private getServiceSid() {
    const sid = `${env.TWILIO_SERVICE_SID || ''}`.trim();
    if (!sid) {
      throw new AppError('Twilio Verify não configurado: adicione TWILIO_SERVICE_SID', 400);
    }
    return sid;
  }

  async create(data: any) {
    const name = (data && data.name) || '';
    const email = (data && data.email) || '';
    const phone = (data && data.phone) || '';
    if (!name) throw new AppError('Informe o nome', 400);
    if (!email) throw new AppError('Informe o email', 400);
    if (!phone) throw new AppError('Informe o telefone', 400);

    const created = await TwilioModel.create({
      name,
      email,
      phone,
      note: data.note || '',
      active: typeof data.active === 'boolean' ? data.active : false,
    });
    return created;
  }

  async sendVerificationCode(phone: string) {
    if (!phone) throw new AppError('Informe o telefone', 400);
    const client = this.getClient();
    const serviceSid = this.getServiceSid();
    await client.verify.services(serviceSid).verifications.create({
      to: phone,
      channel: 'sms',
    });
    return { message: 'Código de verificação enviado' };
  }

  async checkVerificationCode(phone: string, code: string) {
    if (!phone) throw new AppError('Informe o telefone', 400);
    if (!code) throw new AppError('Informe o código de verificação', 400);
    const client = this.getClient();
    const serviceSid = this.getServiceSid();
    const check = await client.verify.services(serviceSid).verificationChecks.create({
      to: phone,
      code,
    });
    return { valid: check.status === 'approved', status: check.status };
  }
}

export default new TwilioService();
