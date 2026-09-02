import mongoose, { Schema, Document } from 'mongoose';

export interface IShopper extends Document {
  isOnline: boolean;
  person?: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  device?: string;
  token?: string;
  status: boolean;
  appVersion?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShopperSchema = new Schema<IShopper>(
  {
    isOnline: { type: Boolean, default: false, required: true },
    person: { type: Schema.Types.ObjectId, ref: 'User' },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    device: { type: String },
    token: { type: String },
    status: { type: Boolean, required: true, default: true },
    appVersion: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

ShopperSchema.index({ deletedAt: 1 });
ShopperSchema.index({ company: 1, isOnline: 1 });

export const ShopperModel = mongoose.model<IShopper>('Shopper', ShopperSchema, 'shopper');
