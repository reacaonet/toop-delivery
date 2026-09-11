import mongoose, { Schema, Document } from 'mongoose';

export const GATEWAY_PROVIDERS = [
  'BRASPAG',
  'PAGARME',
  'IUGU',
  'CIELO',
  'PIX',
  'ASAAS',
  'MERCADO_PAGO',
  'PAGSEGURO',
] as const;
export type GatewayProvider = (typeof GATEWAY_PROVIDERS)[number];

export const PAYMENT_METHODS = ['credit_card', 'debit_card', 'pix', 'cash'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IPaymentGatewayConfig {
  provider: GatewayProvider;
  mode: 'sandbox' | 'production';
  merchantId: string;
  merchantKey: string;
  apiKey: string;
  token: string;
  webhookUrl: string;
  splitEnabled: boolean;
}

export interface ISettings extends Document {
  companyFeePercentage: number;
  deliverymanFeePercentage: number;
  platformFeePercentage: number;
  pushNotifications: boolean;
  maintenanceMode: boolean;
  autoBackup: boolean;
  emailAlerts: boolean;
  paymentGateway: IPaymentGatewayConfig;
  enabledPaymentMethods: PaymentMethod[];
  contact: {
    supportEmail: string;
    supportPhone: string;
    whatsapp: string;
    website: string;
    supportHours: string;
  };
  updatedAt: Date;
}

const PaymentGatewaySchema = new Schema<IPaymentGatewayConfig>(
  {
    provider: { type: String, enum: GATEWAY_PROVIDERS, default: 'PAGARME' },
    mode: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
    merchantId: { type: String, default: '' },
    merchantKey: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    token: { type: String, default: '' },
    webhookUrl: { type: String, default: '' },
    splitEnabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const ContactSchema = new Schema(
  {
    supportEmail: { type: String, default: '' },
    supportPhone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    website: { type: String, default: 'https://gojadelivery.app.br' },
    supportHours: { type: String, default: 'Seg a Sex, 8h às 18h' },
  },
  { _id: false }
);

const SettingsSchema = new Schema<ISettings>(
  {
    companyFeePercentage: { type: Number, default: 5, min: 0, max: 100 },
    deliverymanFeePercentage: { type: Number, default: 2, min: 0, max: 100 },
    platformFeePercentage: { type: Number, default: 20, min: 0, max: 100 },
    pushNotifications: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    autoBackup: { type: Boolean, default: false },
    emailAlerts: { type: Boolean, default: true },
    paymentGateway: { type: PaymentGatewaySchema, default: () => ({}) },
    enabledPaymentMethods: {
      type: [String],
      enum: PAYMENT_METHODS,
      default: ['credit_card', 'debit_card', 'pix', 'cash'],
    },
    contact: { type: ContactSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model<ISettings>('Settings', SettingsSchema);