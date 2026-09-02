import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyCoupon extends Document {
  coupon: mongoose.Types.ObjectId;
  companies: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanyCouponSchema = new Schema<ICompanyCoupon>(
  {
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
    companies: [{ type: Schema.Types.ObjectId, ref: 'Company', required: true }],
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CompanyCouponSchema.index({ companies: -1 });
CompanyCouponSchema.index({ coupon: -1 });

export const CompanyCouponModel = mongoose.model<ICompanyCoupon>('CompanyCoupon', CompanyCouponSchema, 'company_coupon');
