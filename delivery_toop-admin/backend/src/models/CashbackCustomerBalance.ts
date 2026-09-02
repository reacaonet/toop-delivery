import mongoose, { Schema, Document } from 'mongoose';

export interface ICashbackCustomerBalance extends Document {
  date: Date;
  customer: mongoose.Types.ObjectId;
  cashPrev: number;
  cash: number;
  createdAt: Date;
  updatedAt: Date;
}

const CashbackCustomerBalanceSchema = new Schema<ICashbackCustomerBalance>(
  {
    date: { type: Date, required: true, default: Date.now },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cashPrev: { type: Number, required: true, default: 0 },
    cash: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CashbackCustomerBalanceSchema.index({ customer: -1 });
CashbackCustomerBalanceSchema.index({ date: -1 });

export const CashbackCustomerBalanceModel = mongoose.model<ICashbackCustomerBalance>('CashbackCustomerBalance', CashbackCustomerBalanceSchema, 'cashback_customer_balance');
