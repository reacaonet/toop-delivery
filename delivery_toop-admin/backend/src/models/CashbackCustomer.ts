import mongoose, { Schema, Document } from 'mongoose';

export interface ICashbackCustomer extends Document {
  customer: mongoose.Types.ObjectId;
  payment?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  campaign?: mongoose.Types.ObjectId;
  percent: number;
  cash: number;
  createdAt: Date;
  updatedAt: Date;
}

const CashbackCustomerSchema = new Schema<ICashbackCustomer>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    payment: { type: Schema.Types.ObjectId },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    campaign: { type: Schema.Types.ObjectId, ref: 'CashbackCampaign' },
    percent: { type: Number, required: true, min: 0, max: 100 },
    cash: { type: Number, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CashbackCustomerSchema.index({ customer: -1 });
CashbackCustomerSchema.index({ campaign: -1 });
CashbackCustomerSchema.index({ order: -1 });
CashbackCustomerSchema.index({ createdAt: -1 });

export const CashbackCustomerModel = mongoose.model<ICashbackCustomer>('CashbackCustomer', CashbackCustomerSchema, 'cashback_customer');
