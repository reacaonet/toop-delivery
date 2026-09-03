import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessoriesCategory extends Document {
  name: string;
  company: mongoose.Types.ObjectId;
  isPaused: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccessoriesCategorySchema = new Schema<IAccessoriesCategory>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    isPaused: { type: Boolean, default: false },
    position: { type: Number, default: 1 },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AccessoriesCategorySchema.index({ company: 1 });
AccessoriesCategorySchema.index({ name: 1 });
AccessoriesCategorySchema.index({ isPaused: -1 });

export const AccessoriesCategoryModel = mongoose.model<IAccessoriesCategory>(
  'AccessoriesCategory',
  AccessoriesCategorySchema,
  'accessoriesCategory'
);
