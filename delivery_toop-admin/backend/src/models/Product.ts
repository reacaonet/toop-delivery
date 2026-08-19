import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  promoPrice?: number;
  company: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  image?: string;
  images?: string[];
  preparationTime?: number;
  active: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    promoPrice: { type: Number },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String },
    images: [{ type: String }],
    preparationTime: { type: Number },
    active: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

ProductSchema.index({ company: 1, active: 1 });
ProductSchema.index({ company: 1, category: 1 });
ProductSchema.index({ name: 'text' });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
