import mongoose, { Schema, Document } from 'mongoose';

export interface IVoucherUsed {
  passenger: mongoose.Types.ObjectId;
  usedAt?: Date;
}

export interface IVoucher extends Document {
  name: string;
  status: boolean;
  value: number;
  code: string;
  limit: number;
  used?: IVoucherUsed[];
  dateInit: Date;
  dateFinish: Date;
  franchise: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    name: { type: String, required: true },
    status: { type: Boolean, required: false, default: true },
    value: { type: Number, required: true },
    code: { type: String, required: true },
    limit: { type: Number, required: true },
    used: { type: Schema.Types.Mixed, required: false, default: [] },
    dateInit: { type: Date, required: true },
    dateFinish: { type: Date, required: true },
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    deletedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } },
  }
);

VoucherSchema.index({ status: -1 });
VoucherSchema.index({ franchise: -1 });
VoucherSchema.index({ name: -1 });
VoucherSchema.index({ code: -1 });
VoucherSchema.index({ deletedAt: -1 });

export const VoucherModel = mongoose.model<IVoucher>('Voucher', VoucherSchema, 'voucher');
