import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessoriesProductComplementItem extends Document {
  name: string;
  codPdv?: string;
  description?: string;
  price: number;
  isPaused?: boolean;
  accessoriesProductComplement: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AccessoriesProductComplementItemSchema = new Schema<IAccessoriesProductComplementItem>(
  {
    name: { type: String, required: true, trim: true },
    codPdv: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    isPaused: { type: Boolean },
    accessoriesProductComplement: {
      type: Schema.Types.ObjectId,
      ref: 'AccessoriesProductComplement',
      required: true,
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AccessoriesProductComplementItemSchema.index({ accessoriesProductComplement: 1 });
AccessoriesProductComplementItemSchema.index({ name: 1 });
AccessoriesProductComplementItemSchema.index({ isPaused: -1 });

export const AccessoriesProductComplementItemModel = mongoose.model<IAccessoriesProductComplementItem>(
  'AccessoriesProductComplementItem',
  AccessoriesProductComplementItemSchema,
  'accessoriesProductComplementItem'
);
