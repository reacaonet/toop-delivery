import mongoose, { Schema, Document } from 'mongoose';

export const SHOPPING_CART_STATUS = [
  'pending',
  'inProgress',
  'purchaded',
  'deleted',
  'canceled',
] as const;

export interface IShoppingCart extends Document {
  customer: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: (typeof SHOPPING_CART_STATUS)[number];
  paymentMethod?: string;
  tip?: number;
  schedule?: Record<string, unknown>;
  pixTxid?: string;
  pixDate?: Date;
  deliveryAddress?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingCartSchema = new Schema<IShoppingCart>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: SHOPPING_CART_STATUS,
      default: 'inProgress',
    },
    paymentMethod: { type: String },
    tip: { type: Number, default: 0 },
    schedule: { type: Schema.Types.Mixed },
    pixTxid: { type: String },
    pixDate: { type: Date },
    deliveryAddress: {
      street: { type: String },
      number: { type: String },
      complement: { type: String },
      neighborhood: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true, collection: 'shoppingCart' }
);

ShoppingCartSchema.index({ customer: 1, status: 1 });
ShoppingCartSchema.index({ company: 1, createdAt: -1 });

export const ShoppingCartModel = mongoose.model<IShoppingCart>(
  'ShoppingCart',
  ShoppingCartSchema,
  'shoppingCart'
);