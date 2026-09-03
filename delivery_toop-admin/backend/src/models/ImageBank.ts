import mongoose, { Schema, Document } from 'mongoose';

export interface IImageBank extends Document {
  barcode: string;
  productName: string;
  productAccent: string;
  keywords?: string[];
  description?: string[];
  packing: mongoose.Types.ObjectId;
  packingAmount: number;
  images?: string[];
  category?: string[];
  brand: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageBankSchema = new Schema<IImageBank>(
  {
    barcode: { type: String, required: true },
    productName: { type: String, required: true },
    productAccent: { type: String, required: true },
    keywords: { type: [String], required: false },
    description: { type: [String], required: false },
    packing: { type: Schema.Types.ObjectId, ref: 'Packing', required: true },
    packingAmount: { type: Number, required: true },
    images: { type: [String], required: false },
    category: { type: [String], required: false },
    brand: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } },
  }
);

export const ImageBankModel = mongoose.model<IImageBank>('ImageBank', ImageBankSchema, 'imageBank');
