import mongoose, { Schema, Document } from 'mongoose';

export type VoucherDiscountType = 'single' | 'monthly' | 'period';

export interface IVoucherDiscount extends Document {
  franchise: mongoose.Types.ObjectId;
  passenger?: mongoose.Types.ObjectId;
  service?: mongoose.Types.ObjectId;
  name: string;
  price?: number;
  percent?: number;
  startDate: Date;
  endDate: Date;
  type: VoucherDiscountType;
  amountAvailable?: number;
  amountUsed: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVoucherDiscountModel extends mongoose.Model<IVoucherDiscount> {}

const VoucherDiscountSchema = new Schema<IVoucherDiscount, IVoucherDiscountModel>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'Passenger', required: false },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: false },
    name: { type: String, required: true },
    price: { type: Number, required: false },
    percent: { type: Number, required: false, min: 1, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, required: true, enum: ['single', 'monthly', 'period'] },
    amountAvailable: { type: Number, required: false, min: 1 },
    amountUsed: { type: Number, required: true, default: 0, min: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

VoucherDiscountSchema.index({ franchise: -1 });
VoucherDiscountSchema.index({ active: -1 });
VoucherDiscountSchema.index({ passenger: -1 });
VoucherDiscountSchema.index({ service: -1 });
VoucherDiscountSchema.index({ startDate: -1 });
VoucherDiscountSchema.index({ endDate: -1 });
VoucherDiscountSchema.index({ type: -1 });
VoucherDiscountSchema.index({ createdAt: -1 });

export const VoucherDiscountModel = mongoose.model<IVoucherDiscount, IVoucherDiscountModel>(
  'VoucherDiscount',
  VoucherDiscountSchema,
  'voucherDiscount'
);
