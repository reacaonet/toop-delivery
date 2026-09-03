import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessoriesProduct extends Document {
  images: string[];
  name: string;
  category: mongoose.Types.ObjectId;
  description?: string;
  shortDescription?: string;
  price: number;
  pricePromotion?: number;
  percentualDiscount?: number;
  codPdv?: string;
  isPaused?: boolean;
  position: number;
  amountPeople: 'ONE' | 'TWO' | 'THREE' | 'FOUR';
  company: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AccessoriesProductSchema = new Schema<IAccessoriesProduct>(
  {
    images: [{ type: String }],
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'AccessoriesCategory', required: true },
    description: { type: String },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    pricePromotion: { type: Number },
    percentualDiscount: { type: Number },
    codPdv: { type: String },
    isPaused: { type: Boolean },
    position: { type: Number, default: 1 },
    amountPeople: { type: String, enum: ['ONE', 'TWO', 'THREE', 'FOUR'], default: 'ONE' },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AccessoriesProductSchema.index({ company: 1 });
AccessoriesProductSchema.index({ category: 1 });
AccessoriesProductSchema.index({ name: 'text' });
AccessoriesProductSchema.index({ isPaused: 1 });

export const AccessoriesProductModel = mongoose.model<IAccessoriesProduct>(
  'AccessoriesProduct',
  AccessoriesProductSchema,
  'accessoriesProduct'
);
