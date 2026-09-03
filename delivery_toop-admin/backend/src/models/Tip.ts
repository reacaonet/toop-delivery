import mongoose, { Schema, Document } from 'mongoose';

export interface ITip extends Document {
  status: boolean;
  value: number;
  type: 'system' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema = new Schema<ITip>(
  {
    status: { type: Boolean, default: true },
    value: { type: Number, required: true },
    type: { type: String, enum: ['system', 'user'], default: 'user' },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

export const TipModel = mongoose.model<ITip>('Tip', TipSchema, 'tip');
