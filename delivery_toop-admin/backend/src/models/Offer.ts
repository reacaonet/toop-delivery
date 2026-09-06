import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  name: string;
  groupCompany: boolean;
  cost: number;
  status: boolean;
  description: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    name: { type: String, required: true },
    groupCompany: { type: Boolean, required: true },
    cost: { type: Number, required: true },
    status: { type: Boolean, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

export const OfferModel = mongoose.model<IOffer>('Offer', OfferSchema, 'offer');