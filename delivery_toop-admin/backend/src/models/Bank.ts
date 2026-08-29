import mongoose, { Schema, Document } from 'mongoose';

export interface IBank extends Document {
  name: string;
  code: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankSchema = new Schema<IBank>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

BankSchema.index({ code: 1, active: 1 });

export const BankModel = mongoose.model<IBank>('Bank', BankSchema);
