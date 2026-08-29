import mongoose, { Schema, Document } from 'mongoose';

export interface IAppCategory extends Document {
  name: string;
  type: 'supermarket' | 'restaurant' | 'accessories';
  showInApp: boolean;
  keyword?: string;
  segment?: string;
  status: boolean;
  showHome: boolean;
  order: number;
  images: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppCategorySchema = new Schema<IAppCategory>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['supermarket', 'restaurant', 'accessories'],
      default: 'supermarket',
      required: true,
    },
    showInApp: { type: Boolean, required: true, default: true },
    keyword: { type: String },
    segment: { type: String },
    status: { type: Boolean, required: true, default: true },
    showHome: { type: Boolean, required: true, default: true },
    order: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AppCategorySchema.index({ segment: 1 });
AppCategorySchema.index({ name: 1 });
AppCategorySchema.index({ deletedAt: 1 });
AppCategorySchema.index({ showHome: -1 });
AppCategorySchema.index({ showInApp: -1 });
AppCategorySchema.index({ order: 1, name: 1 });

export const AppCategoryModel = mongoose.model<IAppCategory>('AppCategory', AppCategorySchema);
