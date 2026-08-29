import mongoose, { Schema, Document } from 'mongoose';

export interface ITypePayment extends Document {
  name: string;
  code: string;
  company?: mongoose.Types.ObjectId;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TypePaymentSchema = new Schema<ITypePayment>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    description: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

TypePaymentSchema.index({ company: 1, active: 1 });
TypePaymentSchema.index({ code: 1 });

export const TypePaymentModel = mongoose.model<ITypePayment>('TypePayment', TypePaymentSchema);
