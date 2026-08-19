import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  company?: mongoose.Types.ObjectId;
  order: number;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String },
    image: { type: String },
    link: { type: String },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

BannerSchema.index({ company: 1, active: 1 });
BannerSchema.index({ company: 1, order: 1 });

export const BannerModel = mongoose.model<IBanner>('Banner', BannerSchema);
