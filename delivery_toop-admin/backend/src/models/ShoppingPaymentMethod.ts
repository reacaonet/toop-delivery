import mongoose, { Schema, Document } from 'mongoose';

export const CARD_FLAGS = [
  'AMEX',
  'DINERS',
  'DISCOVER',
  'ELO',
  'MASTERCARD',
  'MASTER',
  'MAESTRO',
  'VISA',
  'OTHERS',
] as const;

export const CARD_GATEWAYS = ['BRASPAG', 'PAGARME', 'IUGU'] as const;

export interface IShoppingPaymentMethod extends Document {
  customer: mongoose.Types.ObjectId;
  isMain: boolean;
  flag: (typeof CARD_FLAGS)[number];
  cartNumber: string;
  nameOnCard: string;
  valid: Date;
  verifierCode: string;
  documentType: 'CPF' | 'PASSPORT';
  document: string;
  gateway: (typeof CARD_GATEWAYS)[number];
  cardToken: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingPaymentMethodSchema = new Schema<IShoppingPaymentMethod>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    isMain: { type: Boolean, default: false, required: true },
    flag: { type: String, enum: CARD_FLAGS, required: true },
    cartNumber: { type: String, required: true },
    nameOnCard: { type: String, required: true },
    valid: { type: Date, required: true },
    verifierCode: { type: String, required: true },
    documentType: { type: String, enum: ['CPF', 'PASSPORT'], required: true },
    document: { type: String, required: true },
    gateway: { type: String, enum: CARD_GATEWAYS, default: 'PAGARME', required: true },
    cardToken: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'shoppingPaymentMethod' }
);

ShoppingPaymentMethodSchema.index({ customer: -1 });
ShoppingPaymentMethodSchema.index({ isMain: -1 });
ShoppingPaymentMethodSchema.index({ isDeleted: 1 });

export const ShoppingPaymentMethodModel = mongoose.model<IShoppingPaymentMethod>(
  'ShoppingPaymentMethod',
  ShoppingPaymentMethodSchema,
  'shoppingPaymentMethod'
);