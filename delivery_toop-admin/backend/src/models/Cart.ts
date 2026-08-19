import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  customer: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    total: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'active' | 'ordered' | 'cancelled';
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true },
        notes: { type: String },
      },
    ],
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'ordered', 'cancelled'], default: 'active' },
    couponCode: { type: String },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CartSchema.index({ customer: 1, company: 1, status: 1 });

export const CartModel = mongoose.model<ICart>('Cart', CartSchema);
