import mongoose, { Schema, Document } from 'mongoose';

export interface ISlider extends Document {
  name: string;
  company: mongoose.Types.ObjectId;
  companyClick: boolean;
  productId?: mongoose.Types.ObjectId;
  foodId?: mongoose.Types.ObjectId;
  status: boolean;
  vizualizations?: number;
  priorities: string;
  images: string[];
  deletedAt?: Date;
  type: 'slider' | 'banner' | 'driver';
  segment?: mongoose.Types.ObjectId;
  category: 'delivery' | 'service';
  createdAt: Date;
  updatedAt: Date;
}

const SliderSchema = new Schema<ISlider>(
  {
    name: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    companyClick: { type: Boolean, default: false, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    foodId: { type: Schema.Types.ObjectId },
    status: { type: Boolean, required: true },
    vizualizations: { type: Number },
    priorities: { type: String, required: true },
    images: [{ type: String }],
    deletedAt: { type: Date },
    type: { type: String, enum: ['slider', 'banner', 'driver'], default: 'slider' },
    segment: { type: Schema.Types.ObjectId },
    category: { type: String, enum: ['delivery', 'service'], default: 'delivery' },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SliderSchema.index({ company: -1 });
SliderSchema.index({ deletedAt: -1 });
SliderSchema.index({ type: -1 });
SliderSchema.index({ createdAt: -1 });

export const SliderModel = mongoose.model<ISlider>('Slider', SliderSchema, 'slider');
