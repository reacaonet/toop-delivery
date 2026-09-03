import mongoose, { Schema, Document } from 'mongoose';

export interface IAlertProduct extends Document {
  company: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  barcode?: string;
  priceClick: number;
  followingAt: Date;
  unfollowedAt?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlertProductSchema = new Schema<IAlertProduct>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    barcode: { type: String },
    priceClick: { type: Number, required: true },
    followingAt: { type: Date, default: Date.now },
    unfollowedAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AlertProductSchema.index({ company: -1, active: -1 });
AlertProductSchema.index({ customer: -1, active: -1 });
AlertProductSchema.index({ product: -1 });
AlertProductSchema.index({ followingAt: -1 });
AlertProductSchema.index({ unfollowedAt: -1 });
AlertProductSchema.index({ active: -1 });
AlertProductSchema.index({ customer: 1, product: 1, company: 1 });

export const AlertProductModel = mongoose.model<IAlertProduct>('CustomerAlertProduct', AlertProductSchema, 'customer_alert_product');
