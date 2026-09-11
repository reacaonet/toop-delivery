import mongoose, { Schema, Document } from 'mongoose';

export const GATEWAYS = [
  'BRASPAG',
  'PAGARME',
  'IUGU',
  'PIX',
  'PIX_DIRECT',
  'CARD_MACHINE',
  'MONEY',
  'ASAAS',
  'MERCADO_PAGO',
  'PAGSEGURO',
] as const;

export const TX_OPERATIONS = [
  'charge',
  'capture',
  'pix_charge',
  'pix_verify',
  'card_tokenize',
  'refund',
  'split',
  'invoice',
  'repasse',
] as const;

export interface IPaymentTransaction extends Document {
  order?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  shoppingCart?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  gateway: (typeof GATEWAYS)[number];
  operation: (typeof TX_OPERATIONS)[number];
  method: string;
  amount: number;
  fees: number;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  gatewayId?: string;
  gatewayResponse?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    shoppingCart: { type: Schema.Types.ObjectId, ref: 'ShoppingCart' },
    customer: { type: Schema.Types.ObjectId, ref: 'Users' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    gateway: { type: String, enum: GATEWAYS, required: true },
    operation: { type: String, enum: TX_OPERATIONS, required: true },
    method: { type: String, required: true },
    amount: { type: Number, required: true },
    fees: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    gatewayId: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PaymentTransactionSchema.index({ order: 1 });
PaymentTransactionSchema.index({ company: 1, createdAt: -1 });
PaymentTransactionSchema.index({ gateway: 1, status: 1 });
PaymentTransactionSchema.index({ gatewayId: 1 });

export const PaymentTransactionModel = mongoose.model<IPaymentTransaction>(
  'PaymentTransaction',
  PaymentTransactionSchema
);