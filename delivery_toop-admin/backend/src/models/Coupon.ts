import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  allCompanies: boolean;
  name: string;
  description: string;
  rules: string;
  price: number;
  discountPercentage: number;
  dateInit: Date;
  dateFinish: Date;
  status: boolean;
  minPriceDelivery: number;
  limit: number;
  onlyFirstPurchase: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    allCompanies: { type: Boolean, default: false },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    rules: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    dateInit: { type: Date, required: true, default: Date.now },
    dateFinish: { type: Date, required: true },
    status: { type: Boolean, default: true },
    minPriceDelivery: { type: Number, required: true, default: 0 },
    limit: { type: Number, default: 1 },
    onlyFirstPurchase: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CouponSchema.index({ name: 1 });
CouponSchema.index({ dateInit: 1 });
CouponSchema.index({ dateFinish: 1 });
CouponSchema.index({ status: 1 });
CouponSchema.index({ price: 1 });
CouponSchema.index({ minPriceDelivery: 1 });
CouponSchema.index({ deletedAt: 1 });

export const CouponModel = mongoose.model<ICoupon>('Coupon', CouponSchema, 'coupon');
