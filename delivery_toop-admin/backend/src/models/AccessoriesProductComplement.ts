import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessoriesProductComplement extends Document {
  name: string;
  amountMax: number;
  amountMin: number;
  isRequired?: boolean;
  isQuantified?: boolean;
  product: mongoose.Types.ObjectId;
  isPaused?: boolean;
  position: number;
  company: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AccessoriesProductComplementSchema = new Schema<IAccessoriesProductComplement>(
  {
    name: { type: String, required: true, trim: true },
    amountMax: { type: Number, required: true },
    amountMin: { type: Number, required: true },
    isRequired: { type: Boolean },
    isQuantified: { type: Boolean },
    product: { type: Schema.Types.ObjectId, ref: 'AccessoriesProduct', required: true },
    isPaused: { type: Boolean },
    position: { type: Number, default: 1 },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AccessoriesProductComplementSchema.index({ product: 1 });
AccessoriesProductComplementSchema.index({ name: 1 });
AccessoriesProductComplementSchema.index({ isPaused: -1 });

export const AccessoriesProductComplementModel = mongoose.model<IAccessoriesProductComplement>(
  'AccessoriesProductComplement',
  AccessoriesProductComplementSchema,
  'accessoriesProductComplement'
);
