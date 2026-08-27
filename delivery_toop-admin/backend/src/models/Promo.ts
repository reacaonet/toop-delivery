import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoUsage {
  userId: mongoose.Types.ObjectId;
  count: number;
}

export interface IPromo extends Document {
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minValue?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usesPerUser?: number;
  usedBy: IPromoUsage[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromoSchema = new Schema<IPromo>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    discountValue: { type: Number, required: true, min: 0 },
    minValue: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    expiresAt: { type: Date },
    usesPerUser: { type: Number, min: 1 },
    usedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 0 },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PromoSchema.index({ code: 1 });
PromoSchema.index({ active: 1 });
PromoSchema.index({ expiresAt: 1 });

export const PromoModel = mongoose.model<IPromo>('Promo', PromoSchema);