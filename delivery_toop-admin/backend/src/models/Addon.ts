import mongoose, { Schema, Document } from 'mongoose';

export interface IAddon extends Document {
  company: mongoose.Types.ObjectId;
  name: string;
  price: number;
  active: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddonSchema = new Schema<IAddon>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AddonSchema.index({ company: 1, active: 1 });
AddonSchema.index({ company: 1, name: 1 });

export const AddonModel = mongoose.model<IAddon>('Addon', AddonSchema);