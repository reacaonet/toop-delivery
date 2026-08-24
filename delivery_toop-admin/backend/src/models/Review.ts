import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  deliveryman?: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  type: 'store' | 'deliveryman';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    deliveryman: { type: Schema.Types.ObjectId, ref: 'Deliveryman' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    type: { type: String, enum: ['store', 'deliveryman'], required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ order: 1, type: 1 });
ReviewSchema.index({ company: 1 });
ReviewSchema.index({ deliveryman: 1 });

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
