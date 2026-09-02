import mongoose, { Schema, Document } from 'mongoose';

export interface ICouponCustomer extends Document {
  coupon: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  person: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  payment?: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponCustomerSchema = new Schema<ICouponCustomer>(
  {
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    person: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CouponCustomerSchema.index({ coupon: -1 });
CouponCustomerSchema.index({ company: -1 });
CouponCustomerSchema.index({ person: -1 });
CouponCustomerSchema.index({ customer: -1 });

export const CouponCustomerModel = mongoose.model<ICouponCustomer>('CouponCustomer', CouponCustomerSchema, 'coupon_customer');
