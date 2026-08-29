import mongoose, { Schema, Document } from 'mongoose';

export interface IFaq extends Document {
  title: string;
  caption: string;
  description: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

FaqSchema.index({ status: 1 });

export const FaqModel = mongoose.model<IFaq>('Faq', FaqSchema);
