import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  company: mongoose.Types.ObjectId;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    description: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CategorySchema.index({ company: 1, active: 1 });
CategorySchema.index({ company: 1, order: 1 });

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
